# Amanora 8.5 milestone update

Date: 2 November 2026

## Changes in this update

- Bayan personal audio shelf now stores imported audio blobs in IndexedDB instead of relying on temporary object URLs alone.
- Saved personal audio is restored when the user reopens or refreshes Amanora in the same browser profile.
- Audio imports validate file type and cap each import batch at 200 MB, with storage errors shown in the UI.
- Audio can be played in-app, playback speed and sleep timer controls remain available, and users can remove saved recordings from this device.
- Existing Quran, Salah, Hadith, learning, reflection, local Reels, and other screens are retained.

## Privacy and scope

Personal audio and video uploads remain local to the current browser/device. They are not published to other Amanora users. A shared Reels service, automated content publishing, push notifications while the browser is closed, and verified online subscriptions still require backend services and credentials. Bayan publisher embeds remain subject to the publisher's embedding policy.

## Verification

- `npm run check`: passed after the changes.
- `npm run build`: not verified in this environment. The bundled dependency installation was incomplete; Vite/Rollup's platform-specific native optional dependency was unavailable, and a clean `npm ci` did not finish before timeout.
- No live device, payment, push-notification, or publisher-embed test is claimed.
