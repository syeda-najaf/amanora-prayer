# Amanora email setup (amanoraprayer@gmail.com)

## A. Gmail app password (once)
1. Sign in to amanoraprayer@gmail.com. Open myaccount.google.com > Security > turn on **2-Step Verification**.
2. Open myaccount.google.com/apppasswords, name it "Amanora", click Create, copy the 16-letter password (no spaces).

## B. Customer emails (thank-you + activation)
1. Supabase > Edge Functions > **Deploy a new function** > "Via Editor". Name: `send-plus-email`. Paste the whole file `supabase/functions/send-plus-email/index.ts`. Deploy. Keep "Verify JWT" ON.
2. Supabase > Edge Functions > **Secrets** > add:
   - `GMAIL_USER` = amanoraprayer@gmail.com
   - `GMAIL_APP_PASSWORD` = the 16-letter password
3. In the app, open /owner > Members > Activate. "Email the customer" is ticked by default: the customer gets "Payment received" and "Amanora Plus is active" (plan, activation date, valid-until date). Emails are only sent when the database shows Plus is really active.

## C. Sign-up and password-reset emails from the same Gmail
Supabase > Authentication > Emails > **SMTP Settings** > turn on Custom SMTP:
- Sender email: amanoraprayer@gmail.com, Sender name: Amanora
- Host: smtp.gmail.com, Port: 465
- Username: amanoraprayer@gmail.com, Password: the same 16-letter app password
Save. This also removes Supabase's small hourly email limit.

## D. Activate the paying customers
Supabase > SQL Editor > paste `supabase/manual/activate-customers.sql` > Run. The last table lists who now has Plus.
