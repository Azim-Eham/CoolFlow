#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:?Usage: extract-frames.sh <input_video.mp4> [output_dir] [fps] [width] [height] [quality]}"
OUTPUT_DIR="${2:-public/frames}"
FPS="${3:-24}"
WIDTH="${4:-1280}"
HEIGHT="${5:-720}"
QUALITY="${6:-82}"

if [ ! -f "$INPUT" ]; then
  echo "Error: Input video '$INPUT' does not exist." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
echo "Extracting $INPUT to $OUTPUT_DIR at ${FPS}fps (${WIDTH}x${HEIGHT}, WebP Q${QUALITY})..."

ffmpeg -y -i "$INPUT" \
  -vf "fps=${FPS},scale=${WIDTH}:${HEIGHT}" \
  -c:v libwebp -quality "$QUALITY" \
  "$OUTPUT_DIR/frame_%03d.webp"

COUNT=$(find "$OUTPUT_DIR" -name "*.webp" | wc -l)
echo "Extraction complete: $COUNT frames created in $OUTPUT_DIR."

