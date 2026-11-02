# Amanora in-app media update

## Changed
- `src/components/BayanLibrary.tsx`: selecting a Bayan opens an in-app iframe player, not a new browser tab. The Peace in Islam record now points to the canonical Muslim Central page `https://muslimcentral.com/mufti-ismail-musa-menk-peace-in-islam`. Publisher branding and source attribution remain visible.
- `src/components/VideoReelStudio.tsx`: replaced the small local-preview card with a vertical scroll-snap video feed, upload control, playback controls, clip count and remove actions.
- `src/components/Reels.tsx`: Reels tab now leads with the vertical feed and retains the original reflection library below it.
- `src/styles.css`: added responsive in-app media styles.

## Honest limitations
- The Muslim Central page is embedded in an iframe. Whether it plays inside a third-party app depends on the publisher's frame policy and player. If the publisher blocks iframe embedding, there is no legitimate client-side way to force it. Amanora does not download or rehost the lecture. Muslim Central identifies itself as the publisher for Mufti Menk's official audio distribution; the speaker's official website also lists Muslim Central among his audio outlets.
- No licensed human-shot Reel video files were included in the uploaded project. The vertical feed is functional for owner-supplied video files, but it is empty until those are added. It does not invent footage or import YouTube videos.
- Uploaded videos are local to the current browser session and are not published to other users. Shared public Reels require authenticated storage, moderation and a backend upload service.

## Verification
- `npm run check`: passed.
- `npm run build`: failed in this environment because archived `node_modules` lacks `@rolldown/binding-linux-x64-gnu`; this is an environment/dependency installation issue, not a confirmed app build. Reinstall dependencies with `npm ci` on the target machine before deployment.
