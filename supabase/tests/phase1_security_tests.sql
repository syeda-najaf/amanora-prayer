-- Amanora Phase 1 authorization & payment tests.
-- RUN ON A STAGING BRANCH / TEST PROJECT, in the Supabase SQL editor (runs as postgres).
-- Everything happens inside one transaction and is ROLLED BACK at the end.
-- Expected: a series of "PASS" notices and NO "FAIL" exception.
begin;

-- Fixtures -------------------------------------------------------------
insert into auth.users (id, aud, role, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'admin-test@example.invalid'),
  ('00000000-0000-0000-0000-0000000000b2', 'authenticated', 'authenticated', 'user-test@example.invalid');
insert into public.amanora_admins (user_id) values ('00000000-0000-0000-0000-0000000000a1');

-- 1. Non-admin cannot write content or admin list ------------------------
do $t$ begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true); perform set_config('request.jwt.claim.role', 'authenticated', true); set local role authenticated;
  begin
    insert into public.amanora_content (content_type, title, body) values ('reflection', 'x', 'y');
    raise exception 'FAIL: non-admin inserted content';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: non-admin cannot insert content (%)', sqlerrm;
  end;
  begin
    insert into public.amanora_admins (user_id) values ('00000000-0000-0000-0000-0000000000b2');
    raise exception 'FAIL: non-admin self-promoted to admin';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: non-admin cannot add themselves to amanora_admins';
  end;
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
end $t$;

-- 2. Workflow enforcement as admin ---------------------------------------
do $t$
declare v_id uuid; v_row public.amanora_content;
begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true); perform set_config('request.jwt.claim.role', 'authenticated', true); set local role authenticated;

  begin
    insert into public.amanora_content (content_type, title, body, status) values ('reflection', 't', 'b', 'published');
    raise exception 'FAIL: inserted directly as published';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: cannot insert directly as published';
  end;

  insert into public.amanora_content (content_type, title, body, reference)
  values ('hadith', 'Test hadith', 'text', null) returning id into v_id;

  begin
    update public.amanora_content set status = 'approved' where id = v_id;
    raise exception 'FAIL: draft -> approved allowed';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: draft -> approved blocked';
  end;

  update public.amanora_content set status = 'pending_review' where id = v_id;
  begin
    update public.amanora_content set status = 'approved' where id = v_id;
    raise exception 'FAIL: hadith without reference was approved';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: hadith without reference cannot be approved (%)', sqlerrm;
  end;

  update public.amanora_content set reference = 'Sahih al-Bukhari 1' where id = v_id;
  update public.amanora_content set status = 'approved', approved_by = '00000000-0000-0000-0000-0000000000b2' where id = v_id;
  select * into v_row from public.amanora_content where id = v_id;
  if v_row.approved_by is distinct from '00000000-0000-0000-0000-0000000000a1'::uuid then
    raise exception 'FAIL: client-supplied approved_by was accepted';
  end if;
  raise notice 'PASS: approved_by is set by the server, not the client';

  update public.amanora_content set status = 'published' where id = v_id;
  select * into v_row from public.amanora_content where id = v_id;
  if v_row.published_at is null then raise exception 'FAIL: published_at not set'; end if;
  raise notice 'PASS: publishing sets published_at';

  -- Editing must not reset status or dates, even if the client tries.
  update public.amanora_content
     set title = 'Edited title', status = 'published', published_at = now() - interval '10 years', approved_by = null
   where id = v_id;
  declare v_after public.amanora_content; begin
    select * into v_after from public.amanora_content where id = v_id;
    if v_after.status <> 'published' or v_after.published_at <> v_row.published_at or v_after.approved_by is null then
      raise exception 'FAIL: edit altered lifecycle fields';
    end if;
  end;
  raise notice 'PASS: editing keeps status, published_at and approver';

  begin
    update public.amanora_content set status = 'draft' where id = v_id;
    raise exception 'FAIL: published -> draft allowed';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: published -> draft blocked';
  end;
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);

  if not exists (select 1 from public.amanora_content_audit where content_id = v_id and action = 'status_change') then
    raise exception 'FAIL: audit log empty';
  end if;
  raise notice 'PASS: audit log records status changes';
end $t$;

-- 3. Public (anon) can read only published content -----------------------
do $t$
declare n_draft int; n_pub int;
begin
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
  insert into public.amanora_content (content_type, title, body, status) values ('reflection', 'draft-only', 'b', 'draft');
  perform set_config('request.jwt.claims', '{"role":"anon"}', true); perform set_config('request.jwt.claim.role', 'anon', true); set local role anon;
  select count(*) into n_draft from public.amanora_content where status <> 'published';
  select count(*) into n_pub from public.amanora_content where status = 'published';
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
  if n_draft <> 0 then raise exception 'FAIL: anon can see unpublished rows'; end if;
  raise notice 'PASS: anon sees no unpublished rows (published visible: %)', n_pub;
end $t$;

-- 4. Payments: clients cannot forge access -------------------------------
do $t$ begin
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true); perform set_config('request.jwt.claim.role', 'authenticated', true); set local role authenticated;
  begin
    insert into public.amanora_subscriptions (user_id, plan_code, current_period_end)
    values ('00000000-0000-0000-0000-0000000000b2', 'yearly', now() + interval '1 year');
    raise exception 'FAIL: user inserted own subscription';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: user cannot insert a subscription';
  end;
  begin
    perform public.amanora_apply_payment_success('order_x', 'pay_x', 9900, 'INR');
    raise exception 'FAIL: user executed payment function';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: user cannot execute payment functions';
  end;
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
end $t$;

-- 5. Payment state machine (as owner, as the webhook's service role would) --
do $t$
declare r jsonb; v_end timestamptz; v_plus boolean;
begin
  insert into public.amanora_payments (user_id, plan_code, amount_paise, provider_order_id)
  values ('00000000-0000-0000-0000-0000000000b2', 'monthly', 9900, 'order_ok'),
         ('00000000-0000-0000-0000-0000000000b2', 'monthly', 9900, 'order_bad');

  r := public.amanora_apply_payment_success('order_bad', 'pay_bad', 100, 'INR');
  if r->>'result' <> 'mismatch' then raise exception 'FAIL: amount mismatch not detected: %', r; end if;
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true); perform set_config('request.jwt.claim.role', 'authenticated', true); set local role authenticated; v_plus := public.amanora_has_plus(); reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
  if v_plus then raise exception 'FAIL: access granted on mismatch'; end if;
  raise notice 'PASS: wrong amount does not grant access';

  r := public.amanora_apply_payment_success('order_ok', 'pay_ok', 9900, 'INR');
  if r->>'result' <> 'granted' then raise exception 'FAIL: valid payment not granted: %', r; end if;
  select current_period_end into v_end from public.amanora_subscriptions where user_id = '00000000-0000-0000-0000-0000000000b2';
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true); perform set_config('request.jwt.claim.role', 'authenticated', true); set local role authenticated; v_plus := public.amanora_has_plus(); reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
  if not v_plus then raise exception 'FAIL: has_plus false after valid payment'; end if;
  raise notice 'PASS: valid payment granted until %', v_end;

  r := public.amanora_apply_payment_success('order_ok', 'pay_ok', 9900, 'INR');
  if r->>'result' <> 'already_processed' then raise exception 'FAIL: duplicate processed twice: %', r; end if;
  if (select current_period_end from public.amanora_subscriptions where user_id = '00000000-0000-0000-0000-0000000000b2') <> v_end then
    raise exception 'FAIL: duplicate event extended the subscription';
  end if;
  raise notice 'PASS: duplicate webhook does not extend access twice';

  r := public.amanora_apply_payment_failed('order_ok', 'pay_ok', 'late failure');
  if r->>'result' <> 'ignored' then raise exception 'FAIL: late failed event downgraded a success: %', r; end if;
  raise notice 'PASS: out-of-order failed event cannot undo a success';

  r := public.amanora_apply_payment_refund('pay_ok', 5000);
  if r->>'result' <> 'partial_refund_needs_review' then raise exception 'FAIL: partial refund auto-processed: %', r; end if;
  r := public.amanora_apply_payment_refund('pay_ok', 9900);
  if r->>'result' <> 'refunded' then raise exception 'FAIL: full refund not applied: %', r; end if;
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true); perform set_config('request.jwt.claim.role', 'authenticated', true); set local role authenticated; v_plus := public.amanora_has_plus(); reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
  if v_plus then raise exception 'FAIL: access remained after full refund'; end if;
  raise notice 'PASS: full refund removes access; partial refund flagged for review';
end $t$;

-- 6. Reports: anonymous allowed only against published content ----------------
do $t$
declare v_pub uuid; v_draft uuid;
begin
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
  insert into public.amanora_content (content_type, title, body, status) values ('reflection', 'draft-for-report', 'b', 'draft') returning id into v_draft;
  -- publish one row via trusted direct path (postgres) for the test
  insert into public.amanora_content (content_type, title, body, status) values ('reflection', 'pub-for-report', 'b', 'draft') returning id into v_pub;
  update public.amanora_content set status = 'published', approved_by = '00000000-0000-0000-0000-0000000000a1' where id = v_pub;

  perform set_config('request.jwt.claims', '{"role":"anon"}', true); perform set_config('request.jwt.claim.role', 'anon', true); set local role anon;
  insert into public.amanora_content_reports (content_id, reason, details) values (v_pub, 'incorrect_text', 'typo');
  raise notice 'PASS: anon can report published content';
  begin
    insert into public.amanora_content_reports (content_id, reason) values (v_draft, 'other');
    raise exception 'FAIL: reported unpublished content';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: cannot report unpublished content';
  end;
  begin
    perform 1 from public.amanora_content_reports;
    raise notice 'INFO: anon select on reports returned no error (expect 0 rows via RLS)';
  exception when others then raise notice 'PASS: anon cannot read reports';
  end;
  reset role; perform set_config('request.jwt.claims', '', true); perform set_config('request.jwt.claim.role', '', true);
end $t$;

rollback;
