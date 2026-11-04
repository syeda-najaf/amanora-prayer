-- =====================================================================
-- Amanora Phase 1: workflow enforcement, audit log, payments, reports
-- ADDITIVE migration. It does not drop or rewrite existing content rows.
-- Review, then run on a Supabase BRANCH / staging project first.
-- Rollback: supabase/rollback/202611040001_amanora_phase1_security_down.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helpers
-- ---------------------------------------------------------------------
-- Role claim of the current API request (null for direct DB connections).
create or replace function public.amanora_jwt_role()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.role', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
    ), ''
  );
$$;

-- ---------------------------------------------------------------------
-- 1. Admin table: defence in depth (RLS already blocks client writes)
-- ---------------------------------------------------------------------
revoke all on public.amanora_admins from anon, authenticated;
grant select on public.amanora_admins to authenticated;
-- Admins are added ONLY via SQL editor / service role, never from the app.

-- ---------------------------------------------------------------------
-- 2. Content publishing workflow, enforced in the database
-- ---------------------------------------------------------------------
create or replace function public.amanora_content_readiness_error(c public.amanora_content)
returns text
language plpgsql
stable
as $$
begin
  if btrim(coalesce(c.title, '')) = '' then
    return 'A title is required.';
  end if;
  if btrim(coalesce(c.body, '')) = '' and btrim(coalesce(c.body_ur, '')) = ''
     and btrim(coalesce(c.body_ar, '')) = '' and btrim(coalesce(c.media_url, '')) = '' then
    return 'Add text or media before approval.';
  end if;
  if c.content_type = 'hadith' and btrim(coalesce(c.reference, '')) = '' then
    return 'A hadith needs a reference (collection and number).';
  end if;
  if c.content_type in ('dua', 'story')
     and btrim(coalesce(c.reference, '')) = '' and btrim(coalesce(c.source_name, '')) = '' then
    return 'Religious content needs a source or reference.';
  end if;
  if c.content_type = 'reel' and c.presenter_type is null then
    return 'Reels must be labelled with a human or AI presenter.';
  end if;
  if btrim(coalesce(c.media_url, '')) <> '' and c.media_kind is null then
    return 'Media needs a type (audio, video or image).';
  end if;
  return null;
end;
$$;

create or replace function public.amanora_enforce_content_workflow()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_role    text    := public.amanora_jwt_role();
  v_actor   uuid    := auth.uid();
  v_trusted boolean := (v_role is null and current_user in ('postgres', 'supabase_admin'));
  v_err     text;
begin
  -- Direct database maintenance (SQL editor / migrations) is trusted.
  if v_trusted then
    new.updated_at := now();
    return new;
  end if;

  if v_role is distinct from 'service_role' and not public.amanora_is_admin() then
    raise exception 'Not authorised to change content.' using errcode = '42501';
  end if;

  -- ---------------- INSERT ----------------
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending_review') then
      raise exception 'New content must start as draft or pending_review.' using errcode = '23514';
    end if;
    new.approved_by := null;
    new.approved_at := null;
    new.published_at := null;
    new.updated_at := now();
    return new;
  end if;

  -- ---------------- UPDATE ----------------
  new.id := old.id;
  new.created_at := old.created_at;
  new.updated_at := now();

  -- Scheduler (service role): may ONLY publish due, approved, scheduled rows.
  if v_role = 'service_role' then
    if not (old.status = 'scheduled' and new.status = 'published') then
      raise exception 'Service role may only publish scheduled content.' using errcode = '42501';
    end if;
    if old.approved_by is null then
      raise exception 'Scheduled item has no recorded approver.' using errcode = '23514';
    end if;
    if old.publish_at is null or old.publish_at > now() then
      raise exception 'Scheduled item is not due yet.' using errcode = '23514';
    end if;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
    new.published_at := now();
    return new;
  end if;

  -- Same status (normal editing): lifecycle columns can never be changed by the client.
  -- This is what prevents an edit from resetting status or publishing dates.
  if new.status = old.status then
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
    new.published_at := old.published_at;
    if new.status = 'scheduled' and new.publish_at is null then
      raise exception 'Scheduled content must keep a publish date.' using errcode = '23514';
    end if;
    return new;
  end if;

  -- Allowed transitions
  if not (
       (old.status = 'draft'          and new.status in ('pending_review', 'archived'))
    or (old.status = 'pending_review' and new.status in ('approved', 'rejected', 'draft'))
    or (old.status = 'rejected'       and new.status in ('draft', 'archived'))
    or (old.status = 'approved'       and new.status in ('scheduled', 'published', 'pending_review', 'archived'))
    or (old.status = 'scheduled'      and new.status in ('approved', 'published', 'archived'))
    or (old.status = 'published'      and new.status = 'archived')
    or (old.status = 'archived'       and new.status = 'draft')
  ) then
    raise exception 'Invalid status change: % -> %', old.status, new.status using errcode = '23514';
  end if;

  if new.status in ('draft', 'pending_review', 'rejected') then
    new.approved_by := null;
    new.approved_at := null;
    new.published_at := null;
  elsif new.status = 'archived' then
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
    new.published_at := old.published_at;
  else
    v_err := public.amanora_content_readiness_error(new);
    if v_err is not null then
      raise exception '%', v_err using errcode = '23514';
    end if;

    if new.status = 'approved' then
      if old.status = 'scheduled' then
        new.approved_by := coalesce(old.approved_by, v_actor);
        new.approved_at := coalesce(old.approved_at, now());
      else
        new.approved_by := v_actor;
        new.approved_at := now();
      end if;
      new.published_at := null;
    elsif new.status = 'scheduled' then
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
      new.published_at := null;
      if new.publish_at is null or new.publish_at <= now() then
        raise exception 'Scheduling needs a future publish date.' using errcode = '23514';
      end if;
    else -- published
      new.approved_by := old.approved_by;
      new.approved_at := old.approved_at;
      if new.approved_by is null then
        raise exception 'Content must be approved before publishing.' using errcode = '23514';
      end if;
      new.published_at := now();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists amanora_content_workflow on public.amanora_content;
create trigger amanora_content_workflow
before insert or update on public.amanora_content
for each row execute function public.amanora_enforce_content_workflow();

-- ---------------------------------------------------------------------
-- 3. Audit log of content changes (admin-readable only)
-- ---------------------------------------------------------------------
create table if not exists public.amanora_content_audit (
  id         bigint generated always as identity primary key,
  content_id uuid,
  action     text not null,
  actor      uuid,
  actor_role text,
  old_status text,
  new_status text,
  at         timestamptz not null default now()
);
alter table public.amanora_content_audit enable row level security;
revoke all on public.amanora_content_audit from anon, authenticated;
grant select on public.amanora_content_audit to authenticated;

drop policy if exists "admins read content audit" on public.amanora_content_audit;
create policy "admins read content audit" on public.amanora_content_audit
for select to authenticated using (public.amanora_is_admin());

create or replace function public.amanora_audit_content()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.amanora_content_audit (content_id, action, actor, actor_role, new_status)
    values (new.id, 'insert', auth.uid(), public.amanora_jwt_role(), new.status);
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      insert into public.amanora_content_audit (content_id, action, actor, actor_role, old_status, new_status)
      values (new.id, 'status_change', auth.uid(), public.amanora_jwt_role(), old.status, new.status);
    end if;
  else
    insert into public.amanora_content_audit (content_id, action, actor, actor_role, old_status)
    values (old.id, 'delete', auth.uid(), public.amanora_jwt_role(), old.status);
  end if;
  return null;
end;
$$;

drop trigger if exists amanora_content_audit_trg on public.amanora_content;
create trigger amanora_content_audit_trg
after insert or update or delete on public.amanora_content
for each row execute function public.amanora_audit_content();

-- ---------------------------------------------------------------------
-- 4. Storage: bucket stays private; uploads limited to the admin's own
--    folder and to allowed media extensions (bucket also enforces MIME+size).
-- ---------------------------------------------------------------------
update storage.buckets set public = false where id = 'amanora-media';

drop policy if exists "Amanora admins upload media" on storage.objects;
create policy "Amanora admins upload media"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'amanora-media'
  and public.amanora_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(name) ~ '\.(mp3|m4a|aac|mp4|webm|jpe?g|png|webp)$'
);

-- ---------------------------------------------------------------------
-- 5. Plans, payments, subscriptions
--    Clients can only READ their own rows. All writes happen in
--    SECURITY DEFINER functions callable by the service role alone.
-- ---------------------------------------------------------------------
create table if not exists public.amanora_plans (
  code           text primary key check (code in ('monthly', 'yearly')),
  name           text not null,
  amount_paise   integer not null check (amount_paise > 0),
  currency       text not null default 'INR' check (currency = 'INR'),
  period_months  integer not null check (period_months in (1, 12)),
  active         boolean not null default true
);
alter table public.amanora_plans enable row level security;
revoke all on public.amanora_plans from anon, authenticated;
grant select on public.amanora_plans to anon, authenticated;

drop policy if exists "anyone reads active plans" on public.amanora_plans;
create policy "anyone reads active plans" on public.amanora_plans
for select to anon, authenticated using (active);

-- Prices match the current in-app UI (Rs 99 / Rs 799). Change here, never in the client.
insert into public.amanora_plans (code, name, amount_paise, period_months) values
  ('monthly', 'Amanora Plus Monthly', 9900, 1),
  ('yearly',  'Amanora Plus Yearly',  79900, 12)
on conflict (code) do nothing;

create sequence if not exists public.amanora_receipt_seq;
revoke all on sequence public.amanora_receipt_seq from anon, authenticated;
grant usage, select on sequence public.amanora_receipt_seq to service_role;

create table if not exists public.amanora_payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  plan_code           text not null references public.amanora_plans(code),
  amount_paise        integer not null check (amount_paise > 0),
  currency            text not null default 'INR' check (currency = 'INR'),
  provider            text not null default 'razorpay',
  provider_order_id   text not null,
  provider_payment_id text,
  status              text not null default 'pending'
                      check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  failure_reason      text,
  receipt_no          text not null unique default
                      ('AMN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.amanora_receipt_seq')::text, 6, '0')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  paid_at             timestamptz,
  refunded_at         timestamptz,
  unique (provider, provider_order_id)
);
create unique index if not exists amanora_payments_provider_payment_uidx
  on public.amanora_payments (provider, provider_payment_id) where provider_payment_id is not null;
create index if not exists amanora_payments_user_idx on public.amanora_payments (user_id, created_at desc);

alter table public.amanora_payments enable row level security;
revoke all on public.amanora_payments from anon, authenticated;
grant select on public.amanora_payments to authenticated;

drop policy if exists "users read own payments" on public.amanora_payments;
create policy "users read own payments" on public.amanora_payments
for select to authenticated using (user_id = auth.uid());

drop policy if exists "admins read all payments" on public.amanora_payments;
create policy "admins read all payments" on public.amanora_payments
for select to authenticated using (public.amanora_is_admin());

create table if not exists public.amanora_payment_events (
  id                uuid primary key default gen_random_uuid(),
  provider          text not null default 'razorpay',
  provider_event_id text not null,
  event_type        text not null,
  summary           jsonb not null default '{}'::jsonb,   -- ids/amounts only, no customer contact data
  outcome           text,                                  -- null until fully processed
  received_at       timestamptz not null default now(),
  processed_at      timestamptz,
  unique (provider, provider_event_id)
);
alter table public.amanora_payment_events enable row level security;
revoke all on public.amanora_payment_events from anon, authenticated;
grant select on public.amanora_payment_events to authenticated;

drop policy if exists "admins read payment events" on public.amanora_payment_events;
create policy "admins read payment events" on public.amanora_payment_events
for select to authenticated using (public.amanora_is_admin());

create table if not exists public.amanora_subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  plan_code          text not null references public.amanora_plans(code),
  status             text not null default 'active' check (status in ('active', 'expired')),
  current_period_end timestamptz not null,
  last_payment_id    uuid references public.amanora_payments(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table public.amanora_subscriptions enable row level security;
revoke all on public.amanora_subscriptions from anon, authenticated;
grant select on public.amanora_subscriptions to authenticated;

drop policy if exists "users read own subscription" on public.amanora_subscriptions;
create policy "users read own subscription" on public.amanora_subscriptions
for select to authenticated using (user_id = auth.uid());

drop policy if exists "admins read subscriptions" on public.amanora_subscriptions;
create policy "admins read subscriptions" on public.amanora_subscriptions
for select to authenticated using (public.amanora_is_admin());

-- Entitlement check for use in RLS / RPC. Users can only ask about themselves.
create or replace function public.amanora_has_plus(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.amanora_subscriptions s
    where s.user_id = p_user
      and s.current_period_end > now()
      and (p_user = auth.uid() or public.amanora_is_admin())
  );
$$;
revoke all on function public.amanora_has_plus(uuid) from public, anon;
grant execute on function public.amanora_has_plus(uuid) to authenticated;

-- ---- Payment state machine (service role only, one transaction each) ----
create or replace function public.amanora_apply_payment_success(
  p_order_id text, p_payment_id text, p_amount_paise integer, p_currency text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pay      public.amanora_payments;
  v_plan   public.amanora_plans;
  v_base   timestamptz;
  v_end    timestamptz;
begin
  select * into pay from public.amanora_payments
  where provider = 'razorpay' and provider_order_id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('result', 'unknown_order');
  end if;
  if pay.status in ('succeeded', 'refunded') then
    return jsonb_build_object('result', 'already_processed', 'status', pay.status);
  end if;
  -- The amount we expected is the one WE stored when creating the order.
  if pay.amount_paise <> p_amount_paise or pay.currency <> upper(p_currency) then
    update public.amanora_payments
       set failure_reason = 'amount_or_currency_mismatch', updated_at = now()
     where id = pay.id;
    return jsonb_build_object('result', 'mismatch');
  end if;
  if pay.user_id is null then
    return jsonb_build_object('result', 'no_user');
  end if;

  select * into v_plan from public.amanora_plans where code = pay.plan_code;

  update public.amanora_payments
     set status = 'succeeded', provider_payment_id = p_payment_id,
         paid_at = now(), failure_reason = null, updated_at = now()
   where id = pay.id;

  select greatest(now(), coalesce(
           (select s.current_period_end from public.amanora_subscriptions s where s.user_id = pay.user_id), now()))
    into v_base;
  v_end := v_base + make_interval(months => v_plan.period_months);

  insert into public.amanora_subscriptions (user_id, plan_code, status, current_period_end, last_payment_id)
  values (pay.user_id, pay.plan_code, 'active', v_end, pay.id)
  on conflict (user_id) do update
    set plan_code = excluded.plan_code, status = 'active',
        current_period_end = excluded.current_period_end,
        last_payment_id = excluded.last_payment_id, updated_at = now();

  return jsonb_build_object('result', 'granted', 'period_end', v_end);
end;
$$;

create or replace function public.amanora_apply_payment_failed(
  p_order_id text, p_payment_id text, p_reason text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare pay public.amanora_payments;
begin
  select * into pay from public.amanora_payments
  where provider = 'razorpay' and provider_order_id = p_order_id for update;
  if not found then return jsonb_build_object('result', 'unknown_order'); end if;
  -- A success or refund is never downgraded by a late or out-of-order "failed" event.
  if pay.status in ('succeeded', 'refunded') then
    return jsonb_build_object('result', 'ignored', 'status', pay.status);
  end if;
  update public.amanora_payments
     set status = 'failed', failure_reason = left(coalesce(p_reason, 'failed'), 200), updated_at = now()
   where id = pay.id;
  return jsonb_build_object('result', 'marked_failed');
end;
$$;

create or replace function public.amanora_apply_payment_refund(
  p_payment_id text, p_refund_amount_paise integer
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pay    public.amanora_payments;
  v_plan public.amanora_plans;
begin
  select * into pay from public.amanora_payments
  where provider = 'razorpay' and provider_payment_id = p_payment_id for update;
  if not found then return jsonb_build_object('result', 'unknown_payment'); end if;
  if pay.status = 'refunded' then return jsonb_build_object('result', 'already_processed'); end if;
  if pay.status <> 'succeeded' then return jsonb_build_object('result', 'not_succeeded'); end if;
  if p_refund_amount_paise < pay.amount_paise then
    -- Partial refunds are deliberately NOT auto-processed; an admin should review.
    return jsonb_build_object('result', 'partial_refund_needs_review');
  end if;

  update public.amanora_payments
     set status = 'refunded', refunded_at = now(), updated_at = now() where id = pay.id;

  select * into v_plan from public.amanora_plans where code = pay.plan_code;
  update public.amanora_subscriptions s
     set current_period_end = greatest(now(), s.current_period_end - make_interval(months => v_plan.period_months)),
         status = case when greatest(now(), s.current_period_end - make_interval(months => v_plan.period_months)) <= now()
                       then 'expired' else 'active' end,
         updated_at = now()
   where s.user_id = pay.user_id;

  return jsonb_build_object('result', 'refunded');
end;
$$;

revoke all on function public.amanora_apply_payment_success(text, text, integer, text) from public, anon, authenticated;
revoke all on function public.amanora_apply_payment_failed(text, text, text) from public, anon, authenticated;
revoke all on function public.amanora_apply_payment_refund(text, integer) from public, anon, authenticated;
grant execute on function public.amanora_apply_payment_success(text, text, integer, text) to service_role;
grant execute on function public.amanora_apply_payment_failed(text, text, text) to service_role;
grant execute on function public.amanora_apply_payment_refund(text, integer) to service_role;

-- ---------------------------------------------------------------------
-- 6. Content reports (correction / reporting mechanism)
-- ---------------------------------------------------------------------
create table if not exists public.amanora_content_reports (
  id              uuid primary key default gen_random_uuid(),
  content_id      uuid not null references public.amanora_content(id) on delete cascade,
  reporter_id     uuid references auth.users(id) on delete set null,
  reason          text not null check (reason in
                    ('incorrect_text','wrong_reference','translation_error','inappropriate','copyright','other')),
  details         text check (details is null or char_length(details) <= 1000),
  status          text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution_note text check (resolution_note is null or char_length(resolution_note) <= 1000),
  resolved_by     uuid references auth.users(id),
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);
create unique index if not exists amanora_reports_one_per_user
  on public.amanora_content_reports (content_id, reporter_id) where reporter_id is not null;
create index if not exists amanora_reports_status_idx on public.amanora_content_reports (status, created_at desc);

alter table public.amanora_content_reports enable row level security;
revoke all on public.amanora_content_reports from anon, authenticated;
grant insert (content_id, reporter_id, reason, details) on public.amanora_content_reports to anon, authenticated;
grant select, update on public.amanora_content_reports to authenticated;

drop policy if exists "anyone reports published content" on public.amanora_content_reports;
create policy "anyone reports published content" on public.amanora_content_reports
for insert to anon, authenticated
with check (
  status = 'open'
  and resolved_by is null and resolved_at is null and resolution_note is null
  and (reporter_id is null or reporter_id = auth.uid())
  and exists (select 1 from public.amanora_content c where c.id = content_id and c.status = 'published')
);

drop policy if exists "users read own reports" on public.amanora_content_reports;
create policy "users read own reports" on public.amanora_content_reports
for select to authenticated using (reporter_id = auth.uid() or public.amanora_is_admin());

drop policy if exists "admins manage reports" on public.amanora_content_reports;
create policy "admins manage reports" on public.amanora_content_reports
for update to authenticated
using (public.amanora_is_admin()) with check (public.amanora_is_admin());

-- ---------------------------------------------------------------------
-- 7. Account deletion record (no personal data: id + timestamp only)
-- ---------------------------------------------------------------------
create table if not exists public.amanora_account_deletions (
  deleted_user_id uuid primary key,
  deleted_at      timestamptz not null default now()
);
alter table public.amanora_account_deletions enable row level security;
revoke all on public.amanora_account_deletions from anon, authenticated;
-- No policies: only the service role (which bypasses RLS) can read or write.
