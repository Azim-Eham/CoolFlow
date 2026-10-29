---
name: hero-video-scroll
description: >-
  Converts any input video into an ultra-smooth, 60fps/120fps scroll-driven hero section animation.
  Use when the user provides a video (or asks to animate a video on scroll in the hero section),
  wants Apple-style video scrubbing, requests smooth hero scroll animations, or wants UI elements
  to gracefully animate out revealing an unobstructed fullscreen video scrub.
---

# Hero Video Scroll: Zero-Latency Cinematic Hero Animation

Converts an input video file into a butter-smooth, 60fps/120fps scroll-scrubbed hero section using preloaded canvas frame sequences, requestAnimationFrame lerping, and choreographed UI element exit animations.

## Why Standard `<video>` Scrubbing Fails
Standard MP4 videos place keyframes (I-frames) seconds apart. When scrubbing via `video.currentTime`, browsers must sequentially decode dozens of predictive frames (`P` and `B` frames) on every scroll notch, causing severe stutter, frame drops, and frozen playheads.

This skill solves that using the **Apple Gold Standard**:
1. **HTML5 `<canvas>` Frame Sequence:** Video frames are extracted into optimized WebP/JPG images. `ctx.drawImage()` paints in `< 0.05ms` on the GPU with zero decoding delay.
2. **Liquid Momentum Lerp:** A standalone `requestAnimationFrame` loop smoothly glides the current frame toward the scroll target frame (`lerp = 0.12 - 0.15`).
3. **Element Exit Choreography:** In the initial 15% of scroll, headlines, buttons, and scrims glide and fade away, leaving 100% unobstructed fullscreen video.
4. **Dense GOP Video Fallback:** Optional re-encoded MP4 with keyframes every 4 frames (`-g 4`) for lightweight video tags.

---

## Workflow: From Input Video to Live Component

### Step 1: Inspect the Input Video
Check the video's duration, resolution, and fps using `ffprobe`:

```bash
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of default=noprint_wrappers=1 <input_video.mp4>
```

Calculate total frame count: $\text{Frames} \approx \text{Duration (seconds)} \times 24$ (e.g. 6s @ 24fps = 144 frames).

---

### Step 2: Extract Frames to WebP
Run the extraction script or command to output frames to `public/frames/`:

**PowerShell (Windows):**
```powershell
New-Item -ItemType Directory -Force -Path "public/frames"
ffmpeg -y -i <input_video.mp4> -vf "fps=24,scale=1280:720" -c:v libwebp -quality 82 public/frames/frame_%03d.webp
```

**Bash (Linux / macOS):**
```bash
mkdir -p public/frames
ffmpeg -y -i <input_video.mp4> -vf "fps=24,scale=1280:720" -c:v libwebp -quality 82 public/frames/frame_%03d.webp
```

Verify that frames `frame_001.webp` through `frame_NNN.webp` exist.

---

### Step 3: Implement the Hero Canvas Component

Add the [HeroCanvas.tsx](./templates/HeroCanvas.tsx) component (or adapt existing Hero component) with the following contract:

1. **Pinned Scroll Container:** Outer container height set to `280vh` to `300vh` (`data-sc-span="3"`).
2. **Sticky Stage:** Child stage with `position: sticky; top: 0; height: 100vh; overflow: hidden;`.
3. **Canvas Drawing Logic with Aspect Cover:**
   ```typescript
   const ctx = canvas.getContext('2d', { alpha: false });
   const cw = canvas.width, ch = canvas.height;
   const iw = img.naturalWidth, ih = img.naturalHeight;
   const imgRatio = iw / ih;
   const canvasRatio = cw / ch;

   let renderW = cw, renderH = ch, offsetX = 0, offsetY = 0;
   if (canvasRatio > imgRatio) {
     renderH = cw / imgRatio;
     offsetY = (ch - renderH) / 2;
   } else {
     renderW = ch * imgRatio;
     offsetX = (cw - renderW) / 2;
   }
   ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
   ```
4. **Retina Display Support:** Multiply canvas resolution by `Math.min(window.devicePixelRatio || 1, 2)`.
5. **Frame Preloading:** Preload frame 1 immediately for zero-delay paint; load remaining frames asynchronously.
6. **Scroll Progress & Lerp:**
   ```typescript
   const rawProgress = -rect.top / (rect.height - window.innerHeight);
   const p = Math.max(0, Math.min(rawProgress, 1));
   targetFrameRef.current = p * (TOTAL_FRAMES - 1);
   ```

---

### Step 4: UI Exit Animation Curve

To ensure the video becomes 100% unobstructed during scroll:

```typescript
// Exit occurs in the first 15% of scroll travel (p = 0.01 -> 0.16)
const rawExit = Math.max(0, Math.min((p - 0.01) / 0.15, 1));
// Smooth cubic easing: 3x^2 - 2x^3
const exitEased = rawExit * rawExit * (3 - 2 * rawExit);

const contentOpacity = Math.max(0, 1 - exitEased);
const leftTransform = `translate3d(${-exitEased * 45}px, ${-exitEased * 30}px, 0) scale(${1 - exitEased * 0.04})`;
const rightTransform = `translate3d(${exitEased * 45}px, ${-exitEased * 30}px, 0) scale(${1 - exitEased * 0.04})`;
const scrimOpacity = Math.max(0, 1 - exitEased * 1.3);
```

When `p > 0.08 && p < 0.95`, notify the parent application to auto-hide the global navbar (`-translate-y-full opacity-0`).

---

### Step 5: Verification & Quality Checklist

1. **Zero-Stutter Test:** Scroll slowly, flick the scroll wheel quickly, and reverse direction. Frame transitions must remain completely fluid without any stutter.
2. **First-Frame Flash Test:** Refresh at the top of the page. The starting frame must appear immediately without blank space or layout shift.
3. **Pure Video Verification:** When scrolled past $p \approx 0.18$, confirm that no text, card borders, or scrims obstruct the video.
4. **Natural Unpin:** When scrolled past $p \approx 0.90$, the hero container unpins cleanly, letting the next section slide into view naturally.
5. **Mobile Responsiveness:** Confirm canvas covers the viewport correctly without horizontal scrollbars on mobile viewport sizes (`390x844`).

---

## Helper Scripts & Templates

* [scripts/extract-frames.ps1](./scripts/extract-frames.ps1): Automated PowerShell frame extraction.
* [scripts/extract-frames.sh](./scripts/extract-frames.sh): Automated Bash frame extraction.
* [scripts/encode-dense.ps1](./scripts/encode-dense.ps1): Re-encodes MP4 with `-g 4` keyframe density.
* [templates/HeroCanvas.tsx](./templates/HeroCanvas.tsx): Complete drop-in React/TypeScript component.
* [references/pipeline.md](./references/pipeline.md): In-depth technical breakdown and tuning parameters.

