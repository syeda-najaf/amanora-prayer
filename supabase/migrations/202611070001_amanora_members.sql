-- Amanora members: registration details + owner tools to activate Plus after a verified UPI payment.
-- Run once in Supabase SQL Editor (after the earlier migrations).

create table if not exists public.amanora_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text check (full_name is null or char_length(full_name) <= 120),
  phone      text check (phone is null or char_length(phone) <= 32),
  city       text check (city is null or char_length(city) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.amanora_profiles enable row level security;
revoke all on public.amanora_profiles from anon, authenticated;
grant select on public.amanora_profiles to authenticated;
grant update (full_name, phone, city) on public.amanora_profiles to authenticated;

drop policy if exists "users read own profile" on public.amanora_profiles;
create policy "users read own profile" on public.amanora_profiles
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users update own profile" on public.amanora_profiles;
create policy "users update own profile" on public.amanora_profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "admins read profiles" on public.amanora_profiles;
create policy "admins read profiles" on public.amanora_profiles
for select to authenticated using (public.amanora_is_admin());

-- Every new sign-up gets a profile row filled from the registration form.
create or replace function public.amanora_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.amanora_profiles (user_id, full_name, phone, city)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), 120), ''),
    nullif(left(trim(coalesce(new.raw_user_meta_data->>'phone', '')), 32), ''),
    nullif(left(trim(coalesce(new.raw_user_meta_data->>'city', '')), 80), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists amanora_on_auth_user_created on auth.users;
create trigger amanora_on_auth_user_created
after insert on auth.users
for each row execute function public.amanora_handle_new_user();

-- Profiles for people who registered before this migration.
insert into public.amanora_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Owner: list members with registration details and Plus status.
create or replace function public.amanora_admin_members()
returns table (
  user_id uuid, email text, full_name text, phone text, city text,
  registered_at timestamptz, plan_code text, plus_until timestamptz, plus_active boolean
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.amanora_is_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, p.full_name, p.phone, p.city, u.created_at,
           s.plan_code, s.current_period_end,
           coalesce(s.current_period_end > now(), false)
    from auth.users u
    left join public.amanora_profiles p on p.user_id = u.id
    left join public.amanora_subscriptions s on s.user_id = u.id
    order by u.created_at desc
    limit 1000;
end;
$$;

-- Owner: activate Plus for a registered email after you verified their UPI payment.
create or replace function public.amanora_admin_grant_plus(p_email text, p_plan text, p_days integer default null)
returns timestamptz
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user uuid;
  v_days integer;
  v_base timestamptz;
  v_end  timestamptz;
begin
  if not public.amanora_is_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if p_plan not in ('monthly', 'yearly') then
    raise exception 'Plan must be monthly or yearly';
  end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No registered user with that email';
  end if;
  v_days := coalesce(p_days, case p_plan when 'yearly' then 366 else 31 end);
  if v_days < 1 or v_days > 800 then
    raise exception 'Days must be between 1 and 800';
  end if;
  select greatest(now(), coalesce((select s.current_period_end from public.amanora_subscriptions s where s.user_id = v_user), now()))
    into v_base;
  v_end := v_base + make_interval(days => v_days);
  insert into public.amanora_subscriptions (user_id, plan_code, status, current_period_end)
  values (v_user, p_plan, 'active', v_end)
  on conflict (user_id) do update
    set plan_code = excluded.plan_code, status = 'active',
        current_period_end = excluded.current_period_end, updated_at = now();
  return v_end;
end;
$$;

-- Owner: switch Plus off for a user (refund, chargeback, mistake).
create or replace function public.amanora_admin_revoke_plus(p_email text)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare v_user uuid;
begin
  if not public.amanora_is_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then raise exception 'No registered user with that email'; end if;
  update public.amanora_subscriptions
     set status = 'expired', current_period_end = now(), updated_at = now()
   where user_id = v_user;
end;
$$;

revoke all on function public.amanora_admin_members() from public, anon;
revoke all on function public.amanora_admin_grant_plus(text, text, integer) from public, anon;
revoke all on function public.amanora_admin_revoke_plus(text) from public, anon;
grant execute on function public.amanora_admin_members() to authenticated;
grant execute on function public.amanora_admin_grant_plus(text, text, integer) to authenticated;
grant execute on function public.amanora_admin_revoke_plus(text) to authenticated;
