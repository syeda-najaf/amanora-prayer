-- Rollback for 202611040001_amanora_phase1_security.sql
-- WARNING: dropping the payment tables DELETES payment, subscription and event
-- records. Export them first if the payment system has been used:
--   select * from public.amanora_payments;  -- etc.
-- Existing amanora_content and amanora_admins data is NOT touched.

drop trigger if exists amanora_content_workflow on public.amanora_content;
drop trigger if exists amanora_content_audit_trg on public.amanora_content;
drop function if exists public.amanora_enforce_content_workflow();
drop function if exists public.amanora_audit_content();
drop function if exists public.amanora_content_readiness_error(public.amanora_content);

drop table if exists public.amanora_content_audit;
drop table if exists public.amanora_content_reports;
drop table if exists public.amanora_account_deletions;

drop function if exists public.amanora_apply_payment_success(text, text, integer, text);
drop function if exists public.amanora_apply_payment_failed(text, text, text);
drop function if exists public.amanora_apply_payment_refund(text, integer);
drop function if exists public.amanora_has_plus(uuid);
drop table if exists public.amanora_subscriptions;
drop table if exists public.amanora_payment_events;
drop table if exists public.amanora_payments;
drop table if exists public.amanora_plans;
drop sequence if exists public.amanora_receipt_seq;
drop function if exists public.amanora_jwt_role();

-- Restore the original (looser) upload policy from migration 202611020001.
drop policy if exists "Amanora admins upload media" on storage.objects;
create policy "Amanora admins upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'amanora-media' and public.amanora_is_admin());
