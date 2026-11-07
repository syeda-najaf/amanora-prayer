# Amanora Shorts and Audio Vault Update

## Included in this update

- Replaced the former Read & Reflect screen with **Amanora Shorts**, an immersive vertical micro-learning feed.
- 16 original short lessons with English and Urdu script editions, references, practical actions, categories, progress, likes, saved items and sharing.
- Added feed navigation, per-short progress, watched history and language preference stored on-device.
- Updated Home and Explore labels to open Amanora Shorts.
- Improved Bayan audio storage: imported permitted recordings are stored in IndexedDB on the same browser/device and can be played in Amanora after reopening the app. Added queue, favourites, speed and sleep timer remain.

## Important content and rights boundary

The Shorts are original text-led animated cards, not externally sourced or re-uploaded videos. They do not pretend to be recorded scholar lectures. Quran references are included for checking; these educational reminders are not tafsir or fatwas.

No licensed full-length human Bayan recordings were bundled. A real full Bayan catalogue requires rights-cleared recordings and permission to stream/host them. The project does not synthesize voices or rehost copyrighted lectures without permission. The Bayan player and persistent on-device audio vault are available for permitted recordings.

## Verification

- All 32 TypeScript/TSX source files passed TypeScript transpilation syntax diagnostics.
- Full `tsc --noEmit` / Vite production build was not completed because dependencies are not installed in this workspace (`vite/client` type definitions unavailable).
- GitHub and Vercel were not changed by this ZIP preparation.
