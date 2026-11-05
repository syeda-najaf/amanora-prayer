# Amanora Pilgrim Companion update

This update keeps the product name Amanora and adds a Pilgrim Companion area inside Explore.

## Added
- Haramain Live links to the official Worshipper's Guide platform and the Haramain services live portal. Amanora opens the provider's own page; it does not re-host or claim ownership of broadcasts.
- A six-step general Umrah learning guide covering Miqat/Ihram, intention/Talbiyah, Tawaf, two rak'ahs and Zamzam, Sa'i, and hair trimming/shaving.
- Makkah and Madinah visitor orientation lists with reminders about permits, access rules and respectful conduct.
- A private trip planner with departure date, notes and a locally saved packing checklist.
- Checklist data is stored on the device under amanora-pilgrim-* localStorage keys.

## Safety and accuracy notes
- Umrah guidance is educational, not a fatwa. Rulings can vary by madhhab and personal circumstances.
- Official broadcast links open the broadcaster/platform in a browser. Stream availability and regional access are controlled by the provider.
- The live section deliberately does not embed YouTube or re-host copyrighted video.
- No challenges, leaderboards, competitions, AI-generated voices or YouTube-dependent content were added.
- Existing prayer, Quran, subscription, account and Owner Studio code was preserved.

## Verification
- TypeScript check (`npm run check`) passed in the build workspace.
- Vite production build could not be completed in this Linux workspace because the uploaded Windows `node_modules` did not include Rollup's Linux optional native package. Run `npm install` and `npm run build` on the Windows project before release.
