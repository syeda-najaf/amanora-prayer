# Amanora cleanup and final fixes. Run once from the project root:  .\scripts\cleanup-and-fix.ps1
# - removes unused screens/files that are not part of the app (the app builds without them)
# - moves old update notes into docs\archive
# - raises the Android version so the new APK installs over the old one
# - creates your private Plus-code key if it is still missing
$ErrorActionPreference = "Stop"

$dead = @(
  'src\components\AbdulBariCartoon.tsx',
  'src\components\AbdulBariReels.tsx',
  'src\components\Academy.tsx',
  'src\components\ButtonShowcase.tsx',
  'src\components\CloudReelsFeed.tsx',
  'src\components\DailyAutoPilot.tsx',
  'src\components\DailyDeenTracker.tsx',
  'src\components\HadithOfTheDay.tsx',
  'src\components\HadithSection.tsx',
  'src\components\IslamicButton.tsx',
  'src\components\IslamicPlusFeatures.tsx',
  'src\components\JannahGate.tsx',
  'src\components\LearnSection.tsx',
  'src\components\LoginModal.tsx',
  'src\components\MuftiBayanSection.tsx',
  'src\components\MySanctuarySection.tsx',
  'src\components\PilgrimCompanion.tsx',
  'src\components\PrayerSection.tsx',
  'src\components\QuranReader.tsx',
  'src\components\SubscriptionSection.tsx',
  'src\components\SwiftCodeViewer.tsx',
  'src\components\VideoReelStudio.tsx',
  'src\components\WorshipSection.tsx',
  'src\services\payments.ts',
  'src\services\safety.ts',
  'src\types\index.ts',
  'src\utils\audioHaptics.ts'
)
foreach ($f in $dead) { if (Test-Path $f) { Remove-Item $f -Force; Write-Host "removed $f" } }
foreach ($d in "src\types","src\utils") { if ((Test-Path $d) -and -not (Get-ChildItem $d -Force)) { Remove-Item $d -Force } }

foreach ($f in "Explore.tsx","Store.tsx","store.ts","config.ts","names.ts") { if (Test-Path $f) { Remove-Item $f -Force; Write-Host "removed $f" } }
foreach ($d in "public\reels","public\assets\aistudio","android\.idea") { if (Test-Path $d) { Remove-Item $d -Recurse -Force; Write-Host "removed $d" } }

New-Item -ItemType Directory -Force docs\archive | Out-Null
Get-ChildItem -File -Filter "AMANORA-*" | ForEach-Object { Move-Item $_.FullName docs\archive -Force }
foreach ($n in "MEDIA-DELIVERY-UPDATE.txt","QURAN-MUSHAF-PHONE-UPDATE.txt","SHORTS-AND-MUSHAF-UPDATE.txt") { if (Test-Path $n) { Move-Item $n docs\archive -Force } }

$g = "android\app\build.gradle"
if (Test-Path $g) {
  $t = [IO.File]::ReadAllText((Resolve-Path $g))
  $t = $t -replace 'versionCode 3\b','versionCode 4' -replace 'versionName "1\.2\.0"','versionName "1.2.1"'
  [IO.File]::WriteAllText((Resolve-Path $g), $t, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "Android version is now 1.2.1 (code 4)"
}

$pk = Get-Content src\services\plusCodes.ts -Raw
if ($pk -match 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
  Write-Host "Creating your Plus-code key..."
  node scripts/plus-codes.mjs init
} else { Write-Host "Plus-code key already set." }

npm run check
Write-Host ""
Write-Host "Cleanup finished. Next: npm run build; git add -A; git commit; git push; npx vercel --prod"
