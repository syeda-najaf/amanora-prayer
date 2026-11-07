# Amanora upgrade round 2

Date: 2 November 2026

## What changed

- Rebuilt the Reels media shelf around IndexedDB. Uploaded video files now persist across refreshes on the same browser/device instead of relying on temporary object URLs only.
- Added For You and Saved filters, persistent likes and saved state, video removal, multiple-file import, storage feedback, and automatic pause/play as the user scrolls through the vertical feed.
- Added a 500 MB per-import guard and clear error feedback for unsupported formats or unavailable storage.
- Added an explicit privacy notice: imported media remains local to the browser and is not uploaded or shared.

## What this does not do

- It does not publish a shared feed to all Amanora users. That requires a hosted backend, authenticated owner upload, storage, moderation and content delivery.
- It does not create original human-shot videos or licensed speaker recordings. Only owner-provided or properly licensed videos should be uploaded.
- It does not guarantee background notifications after the browser is closed. A web push service and platform configuration are still required.
- Bayan iframe playback still depends on the publisher allowing embedding. A publisher-approved audio feed or direct stream is required for a reliable native audio player.
- Payment UI is not equivalent to verified subscriptions. Production payments need a server-side order and webhook verification flow before Premium entitlements are granted.

## Verification

- `npm run check`: passed using the project's existing dependency tree.
- `npm run build`: not verified in this environment. The available cached dependency tree has a missing Rolldown native optional binding. A clean install on the deployment machine is required before release.

## Local run

```bash
npm ci
npm run check
npm run dev
```

Then open the local URL printed by Vite. Before deployment, also run `npm run build` and resolve any environment-specific install issues.
