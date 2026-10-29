# Technical Architecture & Pipeline Reference

## 1. Why Canvas Frames Beat `<video>` for Scroll Scrubbing

### The Hardware Decoding Reality
Standard video codecs (H.264, HEVC, VP9, AV1) compress temporal redundancy using Group of Pictures (GOP):
* **I-Frames (Intra / Keyframes):** Complete, self-contained uncompressed photos.
* **P-Frames (Predicted):** Store only what changed compared to previous frames.
* **B-Frames (Bidirectional):** Store changes calculated from both past AND future frames.

Streaming video players only decode forward at a steady 1x rate (24 or 30 fps). However, a user scrolling with a mouse wheel sends non-linear, unpredictable seeking commands (e.g., `currentTime = 2.45s`, then `2.48s`, then `2.41s`).

When a browser encounters a seek to an arbitrary time, the hardware decoder must:
1. Walk back to the nearest previous I-Frame.
2. Decode every intermediate P and B frame in memory up to the target timestamp.
3. Drop the render queue if a newer seek request arrives.

In a file where keyframes occur every 2 to 5 seconds (or only once at time 0), seeking requires decoding dozens of frames per wheel tick, producing severe stutter and freezing.

### HTML5 Canvas Advantage
* An in-memory array of pre-decoded `HTMLImageElement` objects bypasses the video decoder pipeline entirely.
* `ctx.drawImage(img, ...)` is a direct GPU texture blit executed in less than **0.05ms**.
* Seeking forward and backward has identical, deterministic, instantaneous performance.

---

## 2. Lerp & Inertia Tuning

Raw wheel events fire at irregular intervals depending on the user's mouse hardware, OS acceleration, and gesture velocity. Writing progress directly causes jagged motion.

A requestAnimationFrame lerp loop acts as a software low-pass filter:

$$\text{current} = \text{current} + (\text{target} - \text{current}) \times \lambda$$

| Lerp Factor ($\lambda$) | Feel | Best For |
| :--- | :--- | :--- |
| `0.08` | Heavy, cinematic, luxurious glide | Slow macro shots, architectural reveals |
| `0.12 - 0.15` | **Sweet spot** (Apple-like responsiveness + smooth momentum) | Product showcases, brand landing heroes |
| `0.25 - 0.35` | Snappy, immediate tracking | Fast mechanical diagrams, technical explainers |

---

## 3. Aspect Ratio Cover Fit Algorithm

To mimic CSS `object-fit: cover` on a 2D canvas context:

```typescript
const cw = canvas.width;
const ch = canvas.height;
const iw = img.naturalWidth;
const ih = img.naturalHeight;

const imgRatio = iw / ih;
const canvasRatio = cw / ch;

let renderW = cw;
let renderH = ch;
let offsetX = 0;
let offsetY = 0;

if (canvasRatio > imgRatio) {
  renderH = cw / imgRatio;
  offsetY = (ch - renderH) / 2;
} else {
  renderW = ch * imgRatio;
  offsetX = (cw - renderW) / 2;
}

ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
```

---

## 4. UI Exit Choreography Math

To make UI elements gracefully vacate the screen as scrolling begins:

```typescript
// Normalize exit between p_start and p_end
const rawProgress = (p - p_start) / (p_end - p_start);
const clamped = Math.max(0, Math.min(rawProgress, 1));

// Smooth cubic easing curve: 3x^2 - 2x^3 (smoothstep)
const eased = clamped * clamped * (3 - 2 * clamped);

const opacity = 1 - eased;
const translateY = -eased * 30; // pixels
const translateX = -eased * 45; // pixels
```

