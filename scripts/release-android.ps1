# Run from the project root in PowerShell:  .\scripts\release-android.ps1
$ErrorActionPreference = "Stop"
npm ci
npx tsc --noEmit
npm run build
npx cap sync android
Push-Location android
.\gradlew.bat bundleRelease assembleRelease
Pop-Location
Write-Host "Play Store bundle: android\app\build\outputs\bundle\release\app-release.aab"
Write-Host "Installable APK:   android\app\build\outputs\apk\release\app-release.apk"
