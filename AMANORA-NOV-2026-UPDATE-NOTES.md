# Amanora bilingual Prophet Stories and Plus update

This update is based on the saved Amanora project archive, preserving its React + Vite PWA structure and existing Quran, prayer-time, Qibla, Hadith, worship, learning, payment UI and deployment configuration.

## What changed
- Added a dedicated **Stories of the Prophets** experience with 25 concise Prophet story entries, in English and Hindi. Readers can choose Hindi, English or both.
- Added a daily featured Prophet story that rotates through the bundled library, searchable story cards, topic filters, Quran passage references, practical lessons, bookmarks, reading progress, private per-story reflections, copy and share.
- Added Prophet Stories to Home shortcuts and Explore, and made it selectable in the Plus Home shortcut customiser.
- Removed browser text-to-speech and synthetic narration from the active app. Removed unused legacy components that contained device-generated narration. **There is no AI-generated or device text-to-speech narration in this update.**
- Kept authentic Quran recitation playback separate. Existing Quran recitation streams use the selected reciter/audio source, not generated voice.
- Daily Dua is now read-and-copy only. Hadith and adhkar screens are text-first and have no synthetic voice playback.
- Expanded Plus positioning around guided Quran/Arabic/Seerah learning, personal progress, goals, OLED theme, Home customisation and a same-device family learning planner.

## Content and religious accuracy
- Story summaries are short educational retellings based on the cited Quran passages, not full tafsir or a substitute for a qualified teacher.
- Some Prophets are mentioned briefly in the Quran. The app deliberately avoids inventing biographical details where the Quran gives little narrative information.
- Please have a qualified Islamic reviewer check the Hindi wording, transliteration, references and story explanations before public release, especially before charging for religious learning content.
- The daily feature rotates through the 25 stories bundled in this version. This is not yet a remotely updated daily editorial feed.

## Important production limitations
- The project is a Vite web PWA, not an Expo native Android build. The install prompt installs the PWA; it does not create an APK. An APK needs a native Android wrapper/build and signed release artifact.
- Browser geolocation requires HTTPS and user permission. Prayer times depend on the selected calculation method and device time zone; users should verify their preferred method with their local mosque.
- The current prayer reminder schedules a browser notification while Amanora is running. Reliable closed-app Azan requires a push-notification backend/service worker push subscription and device-specific support. Full-length Azan audio cannot be guaranteed by a normal browser notification.
- Daily Dua still rotates through the small bundled set of Quranic duas. It is not a server-fed unlimited daily content service.
- The learning screens are text-first and use Amanora-authored educational explanations. No external video or creator-feed embeds are included.
- UPI payment UI is not proof of payment or subscription activation. Secure Plus activation requires server-side payment verification and webhook handling. Do not promise automatic paid access until that is implemented.
- Plus family list and story notes/progress are currently stored on the same device. Cross-device family sync needs secure accounts and a backend.

## Build and deployment
Run `npm install`, `npm run check`, and `npm run build` in the project directory before deployment. Dependency installation timed out in this environment, so the build and type-check have **not** been verified here. Do not deploy until those commands pass locally.
