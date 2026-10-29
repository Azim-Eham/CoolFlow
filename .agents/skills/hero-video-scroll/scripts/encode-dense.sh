#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:?Usage: encode-dense.sh <input_video.mp4> [output_file] [gop] [crf]}"
OUTPUT="${2:-public/videos/hero-scroll-dense.mp4}"
GOP="${3:-4}"
CRF="${4:-20}"

if [ ! -f "$INPUT" ]; then
  echo "Error: Input video '$INPUT' does not exist." >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
echo "Re-encoding $INPUT with dense GOP ($GOP) -> $OUTPUT..."

ffmpeg -y -i "$INPUT" \
  -an \
  -c:v libx264 -preset fast -crf "$CRF" \
  -g "$GOP" -keyint_min "$GOP" -sc_threshold 0 \
  -movflags +faststart \
  "$OUTPUT"

echo "Dense-GOP encoding complete: $OUTPUT created."

