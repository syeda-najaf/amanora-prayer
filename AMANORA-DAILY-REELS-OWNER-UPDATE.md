# Amanora Daily Reels Update (November 2026)

## Included in this update
- Added a bilingual (English + Urdu) Daily Drop panel to the existing Reels screen.
- Added a 30-day rotating set of original reflection prompts and practical questions, selected automatically by the user's local calendar date.
- Added an expandable answer/reveal interaction.
- Preserved the existing in-app vertical MP4 player, swipe navigation, autoplay, playback controls, likes, saved list, watch history, search and categories.
- Preserved the existing Bayan audio vault and its on-device playback/storage.

## Important media and automation status
This update does **not** create photorealistic human animation or new MP4 files every day. The three bundled sample MP4s in `public/reels` are the existing stylised 2D/2.5D samples. A true realistic-human video feed needs actual rendered/licensed video assets and a video-generation/hosting pipeline.

The Daily Drop is a prewritten 30-day editorial rotation, not an AI generation service or a live editorial backend. It changes automatically by date and works offline, but the 30-day set repeats.

The Bayan library remains an in-app player and on-device audio vault. It does not automatically fetch new scholar recordings. Daily full-length Bayans require a rights-cleared publisher/feed and a backend catalog/streaming connection. No scholar voice, lecture or recording has been fabricated or rehosted.

## Owner and premium status
The designated owner email supplied for the future owner account is `syedanajaf832@gmail.com`. This archive does not yet implement secure owner authentication, server-side payment verification, automatic premium activation, subscriber analytics, or a protected owner dashboard. Those require a server-side identity/payment backend and secrets configured outside the browser. Do not use an email-only frontend check as security.

## Verification
- `npm run check` (TypeScript) passed after the update.
- `npm run build` could not be completed in this environment because the installed Rollup optional native package is missing; `npm ci` timed out. Run `npm ci` and `npm run build` on the Windows development machine.
- GitHub and Vercel were not changed.
