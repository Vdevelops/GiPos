param(
  [string]$Url = "http://localhost:3000",
  [ValidateSet("auto", "edge", "chrome")]
  [string]$Browser = "auto"
)

$edgePath = (Get-Command msedge.exe -ErrorAction SilentlyContinue).Source
$chromePath = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source

$targetBrowser = $null
if ($Browser -eq "edge") {
  if (-not $edgePath) {
    throw "Microsoft Edge tidak ditemukan. Gunakan -Browser chrome atau install Edge."
  }
  $targetBrowser = $edgePath
}
elseif ($Browser -eq "chrome") {
  if (-not $chromePath) {
    throw "Google Chrome tidak ditemukan. Gunakan -Browser edge atau install Chrome."
  }
  $targetBrowser = $chromePath
}
else {
  if ($edgePath) {
    $targetBrowser = $edgePath
  }
  elseif ($chromePath) {
    $targetBrowser = $chromePath
  }
  else {
    throw "Browser tidak ditemukan. Install Microsoft Edge atau Google Chrome."
  }
}

Write-Host "Launching kiosk mode:" $Url
Start-Process -FilePath $targetBrowser -ArgumentList @(
  "--kiosk",
  "--no-first-run",
  "--disable-pinch",
  "--overscroll-history-navigation=0",
  $Url
)
