# Amanora In-App-Only Experience Update

## Product rule
A feature presented as available inside Amanora must complete its core user journey inside the app. Do not send users to YouTube, lecture websites, Quran websites, or external browser pages for ordinary product use.

## Bayan Studio change
- Removed the previous catalogue of external lecture-page links and the `window.open` navigation.
- Replaced it with an in-app audio library and HTML audio player.
- Users can import MP3/M4A/OGG/WAV/AAC files they own or are licensed to use.
- Playback, favourites, queue, language shelf, speed and sleep timer operate inside Amanora.
- No fabricated playable scholar catalogue is displayed. English and Urdu shelves are populated by the user's permitted recordings.
- Imported audio is currently session-local browser object URLs. It is not uploaded, synchronised, or guaranteed to persist after reload. Persistent in-app streaming requires licensed media, object storage/CDN, authenticated APIs, and rights metadata.

## What remains before a genuinely complete all-in-app product
1. Licensed English and Urdu Bayan catalogue and streaming backend.
2. Durable private audio uploads and offline encrypted downloads.
3. Quran Arabic/translation/audio datasets with licensing and verified source attribution, cached in-app.
4. Prayer-time calculation and location permissions; background notifications require service-worker push and platform support.
5. Secure payment checkout and server-side subscription verification. The current UPI intent may hand off to a UPI payment app; that is not a website redirect but it does leave the app. A fully embedded checkout needs a supported payment SDK/gateway and merchant credentials.
6. Cloud authentication, family profiles, progress sync, admin moderation and privacy controls.

## Honest product promise
No external browser redirects for core app flows. Third-party services may be used behind the scenes for licensed content, payments, maps, geocoding, or notifications, but core content and interactions should render in Amanora. Never claim a feature is offline, background-capable, synced, or fully in-app until it is implemented and tested on target devices.
