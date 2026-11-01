# Amanora Prayer

Amanora is currently a React + TypeScript + Vite installable web app (PWA), not an Expo / React Native project. This update keeps the existing working prayer, Quran, audio, hadith, worship, reels and learning modules while organising the main navigation into five areas:

- **Home**: prayer overview, daily reminder, progress, Quran continuation and local usefulness feedback.
- **Quran**: existing Quran reader, page navigation, translations, recitation and bookmarks.
- **Explore**: shortcuts to Islamic stories/shorts, audio, hadith and worship tools.
- **Learn**: existing learning content.
- **Profile**: preferences, prayer settings, journal, install option and UPI contribution/membership screen.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run check
npm run build
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Deploy

Run `npm run build`, then deploy the generated `dist` folder to Vercel or Netlify. The project includes deployment configuration files.

## Existing live-data sources

| Feature | Source |
|---|---|
| Prayer times and Hijri date | Aladhan API |
| City name | BigDataCloud reverse geocoding |
| Quran text and translations | AlQuran Cloud |
| Quran audio | Islamic Network audio CDN |
| Quran radio and reciters | MP3Quran API |
| Qibla bearing | Local calculation from device location |
| Compass direction | Device orientation API |

An internet connection is required for live API content. Location and compass features require HTTPS and browser permission.

## Important implementation status

This delivery is a safe first redesign of the supplied project, not the completion of all six roadmap stages.

- Existing features are retained and surfaced through the five-tab navigation.
- Saved preferences, prayer log, journal, bookmarks and home feedback remain device-local using browser storage.
- There is no account/authentication backend or cross-device sync in this version.
- There is no central analytics dashboard. The usefulness feedback is stored only on the current device.
- UPI checkout creates a UPI intent/QR and opens a compatible payment app. It **does not** receive a trusted payment confirmation, issue receipts, process refunds, or automatically activate Premium.
- Do not grant paid membership based on a tap, screenshot or user-submitted claim. Before enabling automatic Premium access, connect a payment provider/merchant account and implement server-side transaction verification, signed webhooks, entitlement records and refund handling.
- AI assistant, family profiles, travel companion, content-management dashboard and native Android packaging remain future stages. Do not present placeholder content as live functionality.

## Privacy and safety

The app does not require an account in its current form. Location is requested only when the user chooses to use location-dependent prayer/Qibla features. Never share a UPI PIN, OTP or banking password with anyone.

## Content

Edit `src/data/content.ts` for daily story and learning content, and `src/data/hadiths.ts` for the supplied hadith collection. Verify references and obtain appropriate rights before publishing third-party audio/video.
