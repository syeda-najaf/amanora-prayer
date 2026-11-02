# Amanora 9/10 milestone update

Date: 2 November 2026

## Changes made to the uploaded project

- The personal Bayan audio shelf now stores owner-selected audio files in IndexedDB on the current browser/device.
- Imported audio is restored after a refresh, can be played inside Amanora, and can be removed from the local shelf.
- Added file type and 200 MB per-import checks, clearer storage errors, and object-URL cleanup.
- Audio remains private to the device and is not uploaded or shared.

## Existing project features retained

- Quran reader, prayer-time tools, Qibla, prayer log, daily content, Hadith, worship tools, quizzes, stories, learning, UPI payment UI, and PWA setup.
- Reels local video feed with IndexedDB persistence, likes, saved filter and device-local video imports.
- Bayan library with publisher embed and personal audio playback controls.

## Honest production limitations

- Local media is not a shared multi-user Reels or Bayan service.
- Publisher iframe playback remains subject to publisher embedding permissions.
- Prayer notifications cannot reliably wake a closed browser; production push needs a backend and platform setup.
- UPI deep links and QR codes do not verify payments or activate Premium. Server-side order creation, payment verification and webhook handling are still required.
- No licensed human-shot Reels or scholar recordings are bundled.
- No GitHub push or Vercel deployment was performed.

## Verification status

- The uploaded archive was extracted and inspected.
- A clean dependency install could not complete in this environment (network/package retrieval timeout); offline installation also failed because required packages were not cached.
- Consequently, TypeScript and production build checks could not be run after this change. Run `npm ci`, `npm run check`, and `npm run build` on the development machine before deployment.
