# Amanora v1.2.0 launch guide

Everything below is already in this project. Only the items marked **YOU** need your input.

## 0. Before anything (5 minutes)
1. **YOU** open `public/privacy.html` and replace `CONTACT_EMAIL_HERE` (twice) with your real email.
2. Confirm `.env` has your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Confirm the Azan file exists in both places: `public/audio/azan.mp3` and `android/app/src/main/res/raw/azan.mp3` (both present).

## 1. Web / PWA (Vercel)
```
npm ci
npm run build
npx vercel --prod
```
Set the same two `VITE_SUPABASE_*` variables in the Vercel project settings. Your site and `https://<your-domain>/privacy.html` go live together.

## 2. Android app (Play Store)
One-time signing key (keep the file and passwords safe, you cannot publish updates without them):
```
keytool -genkey -v -keystore android\amanora-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias amanora
```
Create `android\keystore.properties`:
```
storeFile=amanora-release.jks
storePassword=YOUR_PASSWORD
keyAlias=amanora
keyPassword=YOUR_PASSWORD
```
Build:
```
.\scripts\release-android.ps1
```
Upload `android\app\build\outputs\bundle\release\app-release.aab` in Play Console. Each later update: raise `versionCode` in `android/app/build.gradle` by 1.

## 3. Play Console listing (copy and paste)
- **App name:** Amanora: Prayer Times & Quran
- **Short description (80):** Prayer times with Azan, Quran in 16-line mushaf, Hajj & Umrah guide.
- **Full description:** Amanora is a calm all-in-one Islamic companion. Get accurate prayer times with the Azan at Salah time, read the Quran in a printed 16-line mushaf layout with swipe page turning, recitation audio and translation, follow a step-by-step Umrah and Hajj guide with Tawaf and Sa'i counters, duas, Miqat and Ziyarah information, plan your Khatm, track your prayers, and learn with daily reflections, stories and quizzes. No ads. Your progress stays on your device.
- **Category:** Lifestyle (or Books & Reference). **Contains ads:** No.
- **Privacy policy URL:** `https://<your-domain>/privacy.html`
- **Data safety form:** Location (approximate/precise, used for prayer times, not stored on a server); Email (optional account); Purchases (subscription status). Data is encrypted in transit. Users can request deletion by email.
- **Permissions to justify:** Location (prayer times and Qibla), Notifications (prayer reminders), Exact alarms (Azan at the exact time).
- **Graphics you must upload:** 512x512 icon (use `public/amanora-icon.png`), 1024x500 feature graphic, 2 to 8 phone screenshots.

## 4. Known launch requirements
- Google Play requires Google Play Billing for in-app digital subscriptions. Amanora Plus is currently paid by manual UPI, which Play may reject. For the first release, either keep Plus off the Android build or use the web version for Plus purchases.
- `public/amanora.apk` is an old test APK served from your website. Replace it with the new `app-release.apk` after building.
- Quran line layout loads from the Quran.com public API. If it is unreachable the app automatically uses the 604-page layout, so pages always open.

## 5. Plus activation codes (how you unlock paying users)
1. The user pays by UPI, then sends you the payment screenshot and the **Device ID** shown at the top of the Plus tab.
2. Put your private key file at `keys/plus-private.json` (delivered separately as `PLUS-PRIVATE-KEY.json`; rename it). Never upload it or commit it; `keys/` is already git-ignored.
3. On your PC, in the project folder, run:
```
node scripts/plus-codes.mjs issue --device A1B2-C3D4 --plan monthly
node scripts/plus-codes.mjs issue --device A1B2-C3D4 --plan yearly
```
   Add `--days 45` for a custom length. Monthly defaults to 31 days, yearly to 365.
4. Send the printed code (starts with `AMN1.`) to the user. They paste it in Plus and tap **Activate Plus**.

Each code works on one device only and stops on its end date. It is checked on the phone with no server, and only your private key can create valid codes. Plus unlocks: Auto Insights report, Amanora Academy paths, Goals, Family circle, and Premium experience (OLED theme and Home shortcuts).
If you ever lose the private key, run `node scripts/plus-codes.mjs init` to make a new pair, rebuild and redeploy; older codes then stop working.

## 6. User accounts and Plus (registration before the app opens)
Users now register (name, email, phone, city, password) before the app opens. Plus is tied to the account, so it works on every device.

**One-time Supabase setup (10 minutes)**
1. Supabase dashboard → SQL Editor → run the files in `supabase/migrations` in order. The last one is `202611070001_amanora_members.sql` (profiles + owner tools).
2. Authentication → Providers → Email: for instant sign-up turn **Confirm email OFF** (or leave it on and users must tap the email link before signing in).
3. Authentication → URL Configuration: set **Site URL** to your live website address and add it under Redirect URLs (needed for password-reset links).
4. Make yourself the owner: register in the app with your own email, then in SQL Editor run:
   `insert into public.amanora_admins (user_id) select id from auth.users where email = 'Syedanajaf832@gmail.com';`
5. Deploy the delete-account function (needed for the "Delete my account" button): `supabase functions deploy delete-account`.

**Each time a user pays by UPI**
1. The payment note shows `Amanora monthly <their email>`; the user also sends you the screenshot.
2. Open `https://<your-site>/owner`, sign in with your owner account, find the user under **Members**, tap **Activate monthly** or **Activate yearly**.
3. Plus unlocks on their account within a few minutes, or at once when they tap "I have paid · Refresh" in the Plus tab. **Switch off** removes it. Renewals extend from the current end date.

If Supabase is not configured in `.env`, the registration screen is skipped and the app opens directly.
Device activation codes (section 5) still work as a backup for users without an account.
