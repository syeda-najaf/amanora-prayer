# Amanora: finish in 6 steps (about 30 minutes)

1. **Extract** this zip over `D:\amanora-prayer` (Replace files). Your `.env`, Android keystore and `keys` folder are not in the zip, so they stay as they are.
2. **New Plus key** (once): `node scripts/plus-codes.mjs init`   then keep `keys\plus-private.json` safe (never upload it).
3. **Supabase** (dashboard):
   - SQL Editor: run `supabase/migrations/202611070001_amanora_members.sql` (skip if already run).
   - SQL Editor: run `supabase/manual/activate-customers.sql` (activates the 2 customers + owner; set `yearly`/366 for anyone who paid 799).
   - Follow `docs/EMAIL-SETUP.md` (Gmail app password, `send-plus-email` function, two secrets, SMTP settings).
4. **Publish the website:**
   ```
   npm ci
   npm run check
   npm run build
   git add -A
   git commit -m "Accounts, emails, notifications, Plus offline"
   git push
   npx vercel --prod
   ```
5. **Android app:** `npx cap sync android`, then build the signed APK (`.\gradlew.bat assembleRelease` in `android`). It loads the live website, so later website updates reach everyone without a new APK.
6. **Test on your phone:** register, Plus unlocks for the customers, Test notification plays the Azan, then turn the internet off and check the next reminder.
