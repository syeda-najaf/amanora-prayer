-- Amanora: activate the paying customers and give the owner permanent Plus.
-- Run in Supabase -> SQL Editor. Safe to run more than once.
-- Change 'monthly' to 'yearly' (and 31 to 366) for anyone who paid the yearly plan.

insert into public.amanora_plans (code, name, amount_paise, period_months) values
  ('monthly', 'Amanora Plus Monthly', 9900, 1),
  ('yearly',  'Amanora Plus Yearly',  79900, 12)
on conflict (code) do nothing;

with grants(email, plan, days) as (values
  ('indiacanada907@gmail.com', 'monthly', 31),    -- Syed Kaif
  ('sqsadaf@gmail.com',        'monthly', 31),    -- syeda najaf
  ('syedanajaf832@gmail.com',  'yearly',  36500)  -- owner: permanent (100 years)
)
insert into public.amanora_subscriptions (user_id, plan_code, status, current_period_end)
select u.id, g.plan, 'active', now() + make_interval(days => g.days)
from grants g
join auth.users u on lower(u.email) = lower(g.email)
on conflict (user_id) do update
  set plan_code = excluded.plan_code,
      status = 'active',
      current_period_end = excluded.current_period_end,
      updated_at = now();

-- Owner can use /owner (Members list and Activate buttons).
insert into public.amanora_admins (user_id)
select id from auth.users where lower(email) = 'syedanajaf832@gmail.com'
on conflict do nothing;

-- Result: every person listed here now has Plus. A missing person has not registered in the app yet.
select u.email, s.plan_code, s.status, s.current_period_end
from public.amanora_subscriptions s
join auth.users u on u.id = s.user_id
order by u.email;
