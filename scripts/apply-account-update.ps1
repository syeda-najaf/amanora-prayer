# Run once from the project root:  .\scripts\apply-account-update.ps1
# 1) switches Plus screens to the new status hook (works offline, stays unlocked after logout/login/refresh)
# 2) points every customer-facing contact to the Amanora Gmail
$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Edit($path, $from, $to) {
  if (-not (Test-Path $path)) { Write-Host "skip (missing): $path"; return }
  $t = [IO.File]::ReadAllText((Resolve-Path $path))
  $n = $t.Replace($from, $to)
  if ($n -ne $t) { [IO.File]::WriteAllText((Resolve-Path $path), $n, $utf8); Write-Host "updated: $path" } else { Write-Host "no change: $path" }
}
foreach ($f in "src\components\PlusUnlock.tsx","src\components\Plus.tsx","src\components\AutoInsights.tsx","src\components\AccountCard.tsx") {
  Edit $f 'services/plusCodes"' 'services/plusStatus"'
}
foreach ($f in "src\components\PlusUnlock.tsx","public\privacy.html","src\App.tsx") {
  Edit $f 'Syedanajaf832@gmail.com' 'amanoraprayer@gmail.com'
  Edit $f 'syedanajaf832@gmail.com' 'amanoraprayer@gmail.com'
}
Write-Host "Done. Now run: npm run check"
