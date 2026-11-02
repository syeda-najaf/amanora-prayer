# Amanora 9.5 milestone update — 2 November 2026

## Changes in this update

- The personal Bayan audio shelf now stores imported audio `Blob`s in IndexedDB instead of relying on temporary object URLs only.
- Imported personal audio is restored after refreshing/reopening Amanora in the same browser on the same device.
- Added validation for audio file types and a 200 MB per-import batch limit.
- Added explicit saving, storage failure, and remove feedback.
- Added stable IDs for saved personal audio entries and persistent deletion.
- Kept publisher-hosted Bayan pages embedded in the in-app screen; publisher iframe restrictions still apply.

## Verification

- `npm run check` — passed (TypeScript).
- ZIP integrity — verified after packaging.
- `npm run build` — not verified in this environment. The bundled Rollup optional native dependency `@rollup/rollup-linux-x64-gnu` is missing, and a package repair attempt timed out.
- Browser/device playback, publisher iframe permissions, and mobile background audio have not been end-to-end tested.

## Important scope

This is a local-first source upgrade. Personal audio remains on the current browser/device and is not shared with other Amanora users. A shared Reels service, automated daily publishing, push notifications, and verified UPI subscription processing require backend/provider configuration and are not represented as completed here.
