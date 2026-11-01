# Amanora Plus: existing-app upgrade

This package modifies the latest Amanora PWA archive and keeps its existing React + Vite architecture. It preserves the current Quran, prayer times, Reels, listening, Hadith, Worship, Learn, profile, journal, install prompt and UPI checkout.

## Added in this update

- New Amanora Plus destination in the existing bottom navigation.
- Amanora Academy learning tracks with locally saved lesson progress.
- Interactive knowledge micro-quiz.
- Seven-day prayer check-in chart using the existing prayer log.
- Custom goals with daily progress controls.
- Family reminder list (stored locally on this device).
- OLED night theme.
- Customisable Home quick-access tiles.
- Plus pricing CTA that opens the existing UPI checkout and preselects the matching monthly/yearly plan.
- New Explore entry for the existing Learn section.

## Run locally

1. Install Node.js 20 or newer.
2. Open this project folder in PowerShell or a terminal.
3. Run `npm ci` (or `npm install` if you need npm to regenerate the lockfile).
4. Run `npm run dev`.
5. Open the local URL printed by Vite.

For production, run `npm run build` and deploy the generated `dist` folder to the existing Vercel project.

## Important feature and payment limits

- The existing UPI screen creates a UPI intent and QR code. It does **not** verify a completed transaction or activate Plus automatically. A merchant/payment provider, server-side transaction verification, webhook handling and subscription entitlement service are required before selling live subscriptions. Confirm the UPI ID and payee name before launch.
- The Family Circle currently stores names locally on one device. Shared family accounts and cross-device accountability require authentication and backend sync.
- The current Listen screen streams from its existing reciter source. Offline audio downloads, background playback guarantees and extra high-bitrate reciters require authorised audio files, a download/storage service and licensing. The Plus page labels these as future integrations.
- The Academy lessons and quizzes in this release are a functional starter track. Have qualified teachers review and expand religious learning material before publishing it as a paid course. Completion tracking is not a religious certificate or scholarly qualification.
- Amanora remains ad-free; no advertising SDK has been added.

No existing Quran, prayer or listening feature has been intentionally removed.
