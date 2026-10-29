param (
    [Parameter(Mandatory=$true)]
    [string]$InputVideo,

    [string]$OutputDir = "public/frames",

    [int]$Fps = 24,

    [int]$Width = 1280,

    [int]$Height = 720,

    [int]$Quality = 82
)

if (-not (Test-Path $InputVideo)) {
    Write-Error "Input video not found: $InputVideo"
    exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Extracting $InputVideo to $OutputDir at ${Fps}fps (${Width}x${Height}, WebP Q${Quality})..." -ForegroundColor Cyan

ffmpeg -y -i $InputVideo -vf "fps=${Fps},scale=${Width}:${Height}" -c:v libwebp -quality $Quality "$OutputDir/frame_%03d.webp"

$count = (Get-ChildItem -Path $OutputDir -Filter "*.webp").Count
Write-Host "Extraction complete: $count frames created in $OutputDir." -ForegroundColor Green

