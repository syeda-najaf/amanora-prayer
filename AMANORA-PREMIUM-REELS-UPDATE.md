# Amanora Premium Reels Update

## What changed
- Replaced the previous text-only Shorts cards with a vertical, 9:16, in-app video player.
- Added original bundled animated human-character sample clips: a neighbour kindness scene, a family scene, and a prayer-space scene.
- The sample visuals use layered 2D illustration with shaded 2.5D/cinematic depth. They are not photorealistic 3D animation.
- Added autoplay, automatic next reel, swipe navigation on touch screens, previous/next controls, progress indicator, mute, captions toggle, playback speed, fullscreen, likes, saved reels, watch history, sharing, category filters, search, and English/Urdu UI captions.
- Videos and poster images are stored locally in `public/reels`, so playback stays inside Amanora and does not redirect to another website.
- Updated Home and Explore labels from Amanora Shorts to Amanora Reels.

## Content and media limitations
- The three included clips are original silent animated visual samples generated for this project. They do not contain voiceover, licensed scholar Bayans, or third-party video footage.
- The current bundled library has three clips. A production-scale feed requires a larger catalogue of rendered, rights-cleared animated videos and optionally original narration/ambience.
- No external video hosting or streaming backend was added. All bundled clips are served by the Amanora app itself.
- Quran references are presented as reflection prompts, not tafsir or fatwas. Verify religious material with trusted sources and qualified scholars.

## Files changed
- `src/components/Reels.tsx`
- `src/styles.css`
- `src/App.tsx`
- `public/reels/*`

## Build status
- TSX syntax transpilation passed for the updated Reels component.
- A full Vite production build could not be run in this environment because dependency installation (`npm ci`) did not complete and Vite was unavailable. Run `npm ci` and `npm run build` on the development machine before deployment.
- GitHub and Vercel were not modified by this archive creation.
