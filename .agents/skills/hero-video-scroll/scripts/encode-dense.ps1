param (
    [Parameter(Mandatory=$true)]
    [string]$InputVideo,

    [string]$OutputFile = "public/videos/hero-scroll-dense.mp4",

    [int]$Gop = 4,

    [int]$Crf = 20
)

if (-not (Test-Path $InputVideo)) {
    Write-Error "Input video not found: $InputVideo"
    exit 1
}

$parent = Split-Path -Parent $OutputFile
if ($parent -and -not (Test-Path $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
}

Write-Host "Re-encoding $InputVideo to dense GOP ($Gop) -> $OutputFile..." -ForegroundColor Cyan

ffmpeg -y -i $InputVideo -an -c:v libx264 -preset fast -crf $Crf -g $Gop -keyint_min $Gop -sc_threshold 0 -movflags +faststart $OutputFile

Write-Host "Dense-GOP encoding complete: $OutputFile created." -ForegroundColor Green

