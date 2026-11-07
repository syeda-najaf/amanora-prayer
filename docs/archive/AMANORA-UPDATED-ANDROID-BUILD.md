# Amanora Android release build

This update keeps Amanora's existing design and content while adding a scheduled daily Quran reminder, improving offline prayer-time caching, using Capacitor's native Android location permission, refreshing notification channels, and fixing the missing Android theme color resources.

## Apply the update on Windows

1. Keep your existing `D:\amanora-prayer\.env` file. It contains local project configuration and must not be shared.
2. Extract the update ZIP into `D:\amanora-prayer`, allowing the included files to replace the matching files.
3. Open PowerShell and run:

```powershell
cd D:\amanora-prayer
npm install
npm run check
npm run build
npx cap sync android
```

## Create a signed release APK

A production release needs a signing key that you own and keep safe. Create it once and keep the same key for every future update:

```powershell
cd D:\amanora-prayer
keytool -genkeypair -v -keystore android\amanora-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias amanora
Copy-Item android\keystore.properties.example android\keystore.properties
notepad android\keystore.properties
```

In `android\keystore.properties`, replace `CHANGE_ME` with the passwords you entered for the key. Keep the file and `amanora-release.jks` private. The `storeFile` line should remain `../amanora-release.jks`.

Build the signed APK:

```powershell
cd D:\amanora-prayer\android
.\gradlew.bat assembleRelease
```

Output when signing is configured:

`D:\amanora-prayer\android\app\build\outputs\apk\release\app-release.apk`

For Google Play, build the signed App Bundle too:

```powershell
.\gradlew.bat bundleRelease
```

Output:

`D:\amanora-prayer\android\app\build\outputs\bundle\release\app-release.aab`

## Important behavior notes

- The installed Capacitor APK opens as a standalone Android app, not in Chrome with a website address bar. The existing 560px maximum layout fills normal phone widths.
- Android prayer and Quran reminders are scheduled locally on the device. Once scheduled, they do not need internet. Android notification permission and Alarms & reminders exact-alarm access must be allowed. Battery restrictions from some phone manufacturers can still delay alarms.
- Prayer timings must first be downloaded for the selected location and calculation method. Amanora now caches the current and next day's downloaded times on the device for offline use. If the user changes location or calculation method, fresh timings need internet once.
- Quran pages, translations, and streaming recitation still need internet unless that content has already been cached by the device/browser. This update does not claim a complete offline Quran library.
- This source update has passed `npm run check` in the preparation environment. An Android APK was not built here because this environment does not include the Android SDK or your private signing key. Run the Windows commands above to create your signed release on your own machine.
