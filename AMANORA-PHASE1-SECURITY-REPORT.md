# Amanora Phase 1: Security, Workflow and Payment Foundation

Status date: 3 Nov 2026. This report separates what was **tested here** from what **must be tested by you**.

## 1. Verification status (honest)

| Item | Status |
|---|---|
| TypeScript check (`tsc --noEmit`, project config) | Ran, passed |
| Strict TypeScript check of the 3 new service files | Ran, passed |
| Unit tests: HMAC signature, constant-time compare, CORS, Razorpay event parsing (10 tests) | Ran, 10/10 passed (`npm run test:functions`) |
| `vercel.json` valid JSON | Ran, passed |
| **Database migration SQL** | **NOT executed** (no Postgres in the build sandbox). Delimiters/parentheses checked only. |
| **SQL authorization tests** (`supabase/tests/phase1_security_tests.sql`) | **Written, NOT run.** Run on a staging branch first. |
| **Edge Functions** (create-order, payment-webhook, delete-account, publish-scheduled) | **NOT run / not deployed.** Type-level logic tested only through the shared modules. |
| Production build (`vite build`) | **NOT run.** The `node_modules` in the upload are Windows-only and the sandbox has no network. Run `npm ci && npm run build` on your machine. |
| `npm audit` | **NOT run** (no registry access). Run `npm audit --omit=dev`. |
| Real payment end-to-end | **Not possible** without your Razorpay account. Test in Razorpay TEST mode. |

## 2. What changed

**Database (`supabase/migrations/202611040001_amanora_phase1_security.sql`, additive)**
- Content workflow enforced by a database trigger: Draft -> Pending review -> Approved -> Scheduled/Published -> Archived. Invalid jumps (e.g. draft -> published) are rejected even for admins.
- `approved_by`, `approved_at`, `published_at` can no longer be set by the client. Editing an item cannot reset its status or publishing date.
- Approval readiness rules: title and content required; hadith needs a reference; dua/story need a reference or source; reels need a human/AI presenter label; media needs a type.
- Scheduler (service role) may only publish due, approved, scheduled rows.
- `amanora_content_audit`: admin-readable log of inserts, status changes and deletes.
- Storage: bucket forced private; uploads only to the admin's own folder with allowed extensions (bucket MIME/size limits from the earlier migration still apply).
- Admin table: client write privileges revoked (defence in depth).
- New tables, all with RLS: `amanora_plans`, `amanora_payments`, `amanora_payment_events`, `amanora_subscriptions`, `amanora_content_reports`, `amanora_account_deletions`.
- Users can only READ their own payments/subscription. Only service-role functions write them.
- Payment functions (transactional, idempotent, service-role only): success (amount/currency verified against the amount stored when the order was created), failed (never downgrades a success), refund (full refunds only; partial refunds flagged for review).
- `amanora_has_plus()` for server-side entitlement checks.

**Edge Functions (`supabase/functions/`)**
- `create-order`: authenticated; price read from the database, not the client; rate limited (5 orders / 10 min / user); records a pending payment. Does not grant Plus.
- `payment-webhook`: verifies Razorpay HMAC-SHA256 on the raw body; dedupes on `x-razorpay-event-id`; applies state via SQL functions; returns 500 on internal failure so Razorpay retries safely.
- `delete-account`: authenticated, needs `confirm: "DELETE"`; refuses admin accounts; payment rows are kept with the user link removed (check retention rules with your accountant).
- `publish-scheduled`: constant-time secret check, requires an approver, reports (does not publish) due items with no approver.

**App**
- `src/services/entitlements.ts`, `payments.ts`, `safety.ts`: typed, secret-free clients. **Not yet wired into screens** (Phase 3). Existing UPI QR screen is unchanged and still does not grant Plus.
- `.env.example`: placeholders only (removed real project values and leftover AI Studio text).
- `vercel.json`: added nosniff, frame deny, referrer policy, permissions policy, HSTS.
- `src/services/supabase.ts`: one-line typing fix for strict mode.

**Deliberately not done in Phase 1:** Content-Security-Policy (needs testing against the running app; adding it blind could break the app), UI wiring, Razorpay Checkout UI, rate limiting for anonymous reports (use Supabase/Cloudflare edge limits), repo cleanup.

## 3. Behaviour you should know about

1. **Existing scheduled/approved rows without an approver** (created before this migration) will not auto-publish. The scheduler response shows `blocked_missing_approver`. Fix: in Owner Studio click "Cancel schedule" (-> approved, records you as approver) and schedule again.
2. **Stricter approval**: a hadith with no `reference` can no longer be approved; the error message tells you what is missing.
3. **Cancellation/renewal**: payments are one-time purchases that extend access by 1 month or 12 months. There is **no auto-debit**; "renewal" means buying again. Say this in the UI/policy wording.
4. Prices live in `amanora_plans` (Rs 99 / Rs 799, same as the current UI). Change them there; the in-app text must be updated to match.

## 4. Deployment (your existing Supabase + Vercel)

Do all of this on a **Supabase branch or a test project first**. Nothing here touches production until you run it.

1. **Back up**: Supabase Dashboard -> Database -> Backups (or `pg_dump`).
2. **Run migration**: SQL editor -> paste `supabase/migrations/202611040001_amanora_phase1_security.sql` -> Run.
3. **Run tests**: paste `supabase/tests/phase1_security_tests.sql` -> Run. You should see PASS notices and no FAIL; it rolls back by itself. If anything fails, do not go to production and send me the error text.
4. **Install CLI & link**: `supabase login` then `supabase link --project-ref YOUR_PROJECT_REF`.
5. **Secrets** (server-side only):
   ```
   supabase secrets set AMANORA_SCHEDULER_SECRET="long-random-string"
   supabase secrets set ALLOWED_ORIGINS="https://YOUR-APP.vercel.app,https://yourdomain.com"
   supabase secrets set RAZORPAY_KEY_ID="rzp_test_..." RAZORPAY_KEY_SECRET="..." RAZORPAY_WEBHOOK_SECRET="..."
   ```
6. **Deploy functions**:
   ```
   supabase functions deploy publish-scheduled --no-verify-jwt
   supabase functions deploy payment-webhook --no-verify-jwt
   supabase functions deploy create-order
   supabase functions deploy delete-account
   ```
7. **Razorpay** (needs your account; free to sign up, per-transaction fees apply): Dashboard (TEST mode) -> Webhooks -> URL `https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-webhook`, secret = `RAZORPAY_WEBHOOK_SECRET`, events: `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`. Make a Rs 99 test payment, then confirm in SQL: `select * from amanora_payments order by created_at desc limit 3;` and `select * from amanora_subscriptions;`.
8. **Vercel**: push this project to your Git repo; Vercel auto-deploys. Environment variables in Vercel stay only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never add the service-role key or any Razorpay secret to Vercel.
9. **Local checks** on your machine: `npm ci`, `npm run check`, `npm run build`, `npm run test:functions`, `npm audit --omit=dev`.

**Rollback:** `supabase/rollback/202611040001_amanora_phase1_security_down.sql` (export payment tables first if used).

## 5. Security notes for you

- The `.env` file in your upload holds only the public Supabase URL and publishable key, which is safe by design. It is **not** included in the cleaned ZIP.
- Your upload also contained your personal UPI ID in `UpiPayment.tsx`. That is a public payee address, not a secret, but anyone can pay it without Amanora ever knowing. Use the Razorpay flow for anything that unlocks Plus.
- Rotate `AMANORA_SCHEDULER_SECRET` and Razorpay secrets if they are ever pasted into chat, email or Git.
