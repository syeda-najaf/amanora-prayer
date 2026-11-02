# Amanora shared content backend (Supabase free-first)

This update adds the public, read-only shared content feed, the database schema with row-level security, private media bucket policies, and a server-side scheduled-publishing function. It does not create a Supabase project or deploy anything automatically. No credentials are included.

## 1. Create the Supabase project

1. Create a Supabase project and select the Free plan.
2. In Project Settings → API, copy the Project URL and `anon` / publishable key.
3. Put those two values in your local `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Never put the `service_role` key in a `VITE_` variable, frontend file, Git commit, or chat.

## 2. Create database tables and security policies

Open Supabase → SQL Editor, paste and run `supabase/migrations/202611020001_amanora_content.sql`.

The migration creates `amanora_content`, `amanora_admins`, row-level security policies and the private `amanora-media` bucket. Public users can only read rows with `status='published'`. Only registered users listed in `amanora_admins` can manage content. The first owner must be added deliberately after creating/signing up their auth account:

```sql
insert into public.amanora_admins (user_id)
values ('PASTE_OWNER_AUTH_USER_UUID_HERE');
```

Do not guess the UUID. Copy it from Authentication → Users after the owner account exists. Do not expose the service-role key to the browser.

## 3. Deploy the scheduled publishing function

Install and authenticate the Supabase CLI, link this folder to your project, then set server secrets and deploy:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set AMANORA_SCHEDULER_SECRET="GENERATE_A_LONG_RANDOM_SECRET"
supabase functions deploy publish-scheduled --no-verify-jwt
```

The Edge Function also needs the project-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server secrets. Configure them in the Edge Function secrets dashboard if they are not already available in the project environment. Keep all secrets server-side.

In Supabase Cron, schedule a POST request to:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/publish-scheduled`

Include header `x-amanora-scheduler-secret: YOUR_LONG_RANDOM_SECRET`. A 15-minute schedule is a sensible starting point. The function only publishes rows already approved and scheduled; it does not invent Hadith or generate videos.

## 4. Publish content safely

Create content rows with `status='draft'`, review the exact text, source and rights, then set `status='approved'`, `publish_at`, and finally `status='scheduled'`. The scheduler publishes due rows. Religious content needs a traceable reference/source. Reels must be original or licensed; label synthetic presenters as AI and do not imitate or attribute speech to real scholars without permission.

## 5. Verify

Restart Vite after editing `.env`:

```powershell
npm install
npm run check
npm run build
npm run dev
```

Open Explore. The Fresh for the Ummah panel should show Cloud feed when credentials are configured, and list published content when rows exist.

## Current boundary

The code in this update provides shared published-content reading and a scheduled publish queue. It does not yet include a complete owner CMS screen, user sign-in UI, automated verified-source research/content generation, native push notifications, AI video generation, or payment verification. Those are separate implementation/deployment steps. Free-plan quotas and platform limits apply; monitor usage before scaling.
