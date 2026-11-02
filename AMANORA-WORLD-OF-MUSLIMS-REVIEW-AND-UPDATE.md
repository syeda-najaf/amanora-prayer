# Amanora · World of Muslims update (2 November 2026)

## Product benchmark
This review uses public store listings, published app descriptions and a sample of visible user reviews. Store ratings change over time and are not a controlled usability study.

| Reference app | Strength worth learning from | Friction to avoid in Amanora |
|---|---|---|
| Muslim Pro | All-in-one daily toolkit: prayer times, Quran, Qibla, duas and reminders | Google Play reviews include complaints about intrusive ads, prayer-screen obstruction and reminder reliability |
| Athan by IslamicFinder | Daily goals, prayer log, Quran goal, athkar and streaks | Keep core worship paths uncluttered and make reminders transparent |
| Quran Majeed (Pakdata) | Large Quran library, many reciters, translations and prayer utilities | Some public user reports mention translation/audio reliability; test Urdu translation and recitation failures gracefully |
| Pillars | Focused, ad-free, privacy-conscious prayer experience | Public review summaries report missed/duplicate adhan alerts and setup/blank-screen bugs; explain PWA notification limits |
| Tarteel | Memorisation goals, recitation practice, progress and review history | Do not promise AI tajweed/mistake detection without a validated model; users also mention subscription and stability concerns |

## Changes in this project update
- Reworked the home surface with a more premium emerald/gold visual treatment, responsive quick-access tiles, next-prayer hero and clearer daily worship progress.
- Added an English / Urdu language switch on Home and Profile. The selected preference is stored on the device. Urdu mode sets RTL direction and uses Urdu navigation labels on the bottom navigation.
- Kept Quran translation choices to English (Saheeh International) and Urdu (Jalandhry); removed the Hindi translation option from the app's translation list and Mushaf toggle.
- Added proper Urdu-script meanings for the 14 daily duas, with an English / Urdu switch, copy and share.
- Removed Hindi rendering and Hindi language selectors from the Quiz, Prophet Stories and Read & Reflect views. Those views remain English until proper Urdu translations are prepared and reviewed; no Hindi text is presented as Urdu.
- Prophet Stories retain English text and English/Urdu human-recording audio slots. No audio files are included yet; the documented MP3 naming convention remains in `public/audio/stories/README.txt`.
- Kept existing local prayer tracker, streak, bookmarks, story notes, Quran reading, Qibla/worship, Hadith, learning, quiz, Listen and Plus sections.

## Important limits before production
- This is a React + Vite PWA, not a native Android APK.
- Urdu interface coverage is partial in this update: Home/navigation, Quran translation selection and Daily Dua have Urdu support. Quiz, Prophet Stories and Read & Reflect are English-only pending proper Urdu editorial translations. Other screens may still contain English UI labels.
- Human English/Urdu story recordings are not bundled. Add only licensed/consented human MP3s using the instructions in `public/audio/stories/README.txt`.
- Prayer notifications in a browser PWA cannot reliably fire an exact-time full Azan after the browser is fully closed. Background push needs a backend, push subscription and device/platform support.
- UPI payment UI is not proof of payment. Secure Plus activation requires server-side payment verification/webhooks.
- Family sync, cross-device progress, live community features and global Muslim directory need a backend and moderation. Do not show fake live users or fabricated community counts.
- No external video/YouTube source is used for the original learning library.

## Review-derived product principles
1. Never interrupt Quran reading or prayer time with ads.
2. Keep prayer time and Quran reachable in one tap.
3. Give users control over prayer calculation method, reminders and notification sound availability.
4. Make privacy and location use explicit; request location only when needed.
5. Keep essential worship free; Plus should sell convenience, structured learning and verified premium content, not access to the Quran or obligatory prayer information.
6. Clearly distinguish Quran text, credited translations, hadith, editorial reflections and scholarly rulings.

## Sources consulted
- Muslim Pro Google Play listing and visible reviews: https://play.google.com/store/apps/details?id=com.bitsmedia.android.muslimpro
- Athan Google Play listing: https://play.google.com/store/apps/details?id=com.athan
- Quran Majeed (Pakdata) rating snapshot: https://www.appbrain.com/app/com.pakdata.QuranMajeed
- Quran Majeed public reviews: https://www.trustpilot.com/review/quranmajeed.com
- Pillars App Store listing and privacy policy: https://apps.apple.com/in/app/pillars-prayer-times-qibla/id1559086853 and https://thepillarsapp.com/privacy
- Tarteel Google Play listing and reviews: https://play.google.com/store/apps/details?id=com.mmmoussa.iqra
