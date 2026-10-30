import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Phone,
  Clock,
  ShieldCheck,
  Award,
  Sun,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
  onHeroStateChange?: (isPureVideo: boolean) => void;
}

const TOTAL_FRAMES = 144;

interface MotionChapter {
  id: number;
  tag: string;
  headline: string;
  headlineAccent?: string;
  description: string;
  telemetry: string;
  alignment: 'left' | 'right';
  range: [number, number, number, number]; // [start, peakIn, peakOut, end]
}

const MOTION_CHAPTERS: MotionChapter[] = [
  {
    id: 1,
    tag: '01 // THERMAL SCAN',
    headline: 'Solar load detected.',
    headlineAccent: 'Predictive response.',
    description:
      'Infrared micro-sensors detect radiant solar gain through the panoramic glass, spooling the inverter before indoor temperature shifts.',
    telemetry: '78°F AMBIENT • INVERTER AT 65% • ZERO DRAFTS',
    alignment: 'left',
    range: [0.14, 0.20, 0.40, 0.46],
  },
  {
    id: 2,
    tag: '02 // LAMINAR FLOW',
    headline: 'Airflow in motion.',
    headlineAccent: 'Silent as a breath.',
    description:
      'Architectural linear ceiling slots glide cool laminar air across the upper plane via the Coandă effect — felt throughout, never heard.',
    telemetry: '18 dB ACOUSTICS • 0.15 M/S VELOCITY • MERV-16 PURIFIED',
    alignment: 'right',
    range: [0.44, 0.50, 0.72, 0.78],
  },
  {
    id: 3,
    tag: '03 // EQUILIBRIUM',
    headline: '72° in every corner.',
    headlineAccent: 'Total harmony.',
    description:
      'The entire living space reaches pristine thermal balance. Low-vibration inverter compressors idle in ultra-efficient maintenance mode.',
    telemetry: '72°F BALANCED • AQI 12 PRISTINE • 24.5 SEER2 EFFICIENCY',
    alignment: 'left',
    range: [0.74, 0.80, 0.95, 0.99],
  },
];

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, onHeroStateChange }) => {
  // Mode: 'video-scroll' (cinematic scrubbed video) vs 'house' (inspiration photo)
  const [viewMode, setViewMode] = useState<'video-scroll' | 'house'>('video-scroll');

  // Progress state
  const [scrollProgress, setScrollProgress] = useState(0); // 0.0 to 1.0
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Thermostat state
  const [manualTempOverride, setManualTempOverride] = useState<number | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState(true);

  // Canvas & Frame Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // 1. Preload all 144 WebP frames for instantaneous, zero-latency canvas scrubbing
  useEffect(() => {
    let isMounted = true;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    // Load Frame 1 first for instant paint
    const firstImg = new Image();
    firstImg.src = '/frames/frame_001.webp';
    firstImg.onload = () => {
      if (!isMounted) return;
      images[0] = firstImg;
      loaded++;
      setFramesLoaded(1);
      setIsReady(true);
      drawFrame(0);

      // Preload remaining 143 frames in background
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const formattedIndex = String(i).padStart(3, '0');
        img.src = `/frames/frame_${formattedIndex}.webp`;
        img.onload = () => {
          if (!isMounted) return;
          images[i - 1] = img;
          loaded++;
          if (loaded % 20 === 0 || loaded === TOTAL_FRAMES) {
            setFramesLoaded(loaded);
          }
        };
        img.onerror = () => {
          if (i > 1 && images[i - 2]) {
            images[i - 1] = images[i - 2];
          }
        };
      }
    };

    imagesRef.current = images;

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to draw an image frame to the canvas with "object-fit: cover"
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const clampedIndex = Math.max(0, Math.min(Math.round(index), TOTAL_FRAMES - 1));
    const img = imagesRef.current[clampedIndex] || imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

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
  }, []);

  // 2. Resize Canvas with DevicePixelRatio for razor-sharp rendering on Retina & 4K screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // 3. Liquid 60fps/120fps requestAnimationFrame Lerp Loop
  useEffect(() => {
    if (viewMode !== 'video-scroll') return;

    const LERP_FACTOR = 0.14;

    const loop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.01) {
        const next = current + diff * LERP_FACTOR;
        currentFrameRef.current = next;
        drawFrame(next);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [viewMode, drawFrame]);

  // 4. Track scroll position through pinned container
  useEffect(() => {
    if (viewMode !== 'video-scroll') return;

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = rect.height - vh;

      if (totalScrollable <= 0) return;

      const rawProgress = -rect.top / totalScrollable;
      const p = Math.max(0, Math.min(rawProgress, 1));

      setScrollProgress(p);
      targetFrameRef.current = p * (TOTAL_FRAMES - 1);

      // Inform parent if in pure video mode (progress > 0.08 and < 0.95)
      const isPure = p > 0.08 && p < 0.95;
      onHeroStateChange?.(isPure);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, onHeroStateChange]);

  // Motion Graphics Smooth Interpolation Helper — 100% sharp text (no CSS blur that damages legibility)
  const getMotionStyles = (p: number, range: [number, number, number, number]) => {
    const [start, peakIn, peakOut, end] = range;
    if (p < start || p > end) {
      return {
        opacity: 0,
        transform: 'translate3d(0, 20px, 0)',
        visible: false,
      };
    }

    let progress = 1;
    let translateY = 0;

    if (p < peakIn) {
      const t = (p - start) / (peakIn - start);
      progress = t * t * (3 - 2 * t); // Smooth Hermite curve
      translateY = (1 - progress) * 20;
    } else if (p > peakOut) {
      const t = (end - p) / (end - peakOut);
      progress = t * t * (3 - 2 * t);
      translateY = (1 - progress) * -20;
    }

    return {
      opacity: progress,
      transform: `translate3d(0, ${translateY}px, 0)`,
      visible: progress > 0.01,
    };
  };

  // Initial Content Exit Calculations (Smooth fade out in the first 12% of scroll)
  const rawExit = Math.max(0, Math.min((scrollProgress - 0.01) / 0.12, 1));
  const exitEased = rawExit * rawExit * (3 - 2 * rawExit);
  const contentOpacity = viewMode === 'video-scroll' ? Math.max(0, 1 - exitEased) : 1;
  const isInitialContentHidden = viewMode === 'video-scroll' && contentOpacity < 0.01;

  const leftTransform = viewMode === 'video-scroll'
    ? `translate3d(${-exitEased * 40}px, ${-exitEased * 20}px, 0) scale(${1 - exitEased * 0.03})`
    : 'none';

  const rightTransform = viewMode === 'video-scroll'
    ? `translate3d(${exitEased * 40}px, ${-exitEased * 20}px, 0) scale(${1 - exitEased * 0.03})`
    : 'none';

  // Scrim for initial content
  const initialScrimOpacity = viewMode === 'video-scroll' ? Math.max(0, 1 - exitEased * 1.2) : 1;

  // Temperature calculations
  const autoTemp = Math.round(78 - scrollProgress * 6);
  const currentTemp = manualTempOverride !== null ? manualTempOverride : autoTemp;
  const displayTemp = isFahrenheit ? currentTemp : Math.round(((currentTemp - 32) * 5) / 9);

  // Active step index (1, 2, 3)
  const activeStep =
    scrollProgress < 0.44 ? 1 : scrollProgress < 0.74 ? 2 : 3;

  // Detect whether scroll storytelling text is currently on-screen
  const isNarrativeActive =
    viewMode === 'video-scroll' && scrollProgress >= 0.14 && scrollProgress <= 0.98;

  return (
    <div
      ref={containerRef}
      id="hero"
      className={`relative ${
        viewMode === 'video-scroll' ? 'h-[300vh] sm:h-[320vh]' : 'min-h-[92vh] lg:min-h-screen'
      }`}
    >
      {/* Pinned Sticky Stage */}
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden flex items-center select-none">
        
        {/* ================= LAYER 0: Canvas Background ================= */}
        <div className="absolute inset-0 z-0 bg-[#070c18]">
          {viewMode === 'video-scroll' ? (
            <div className="relative w-full h-full">
              {/* Fallback image before canvas initializes */}
              <img
                src="/images/hero-frame-start.jpg"
                alt="CoolFlow Penthouse Scene"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              />

              {/* Video Canvas */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
              />

              {/* Initial Landing Scrim (fades out as hero moves) */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#070c18]/90 via-[#070c18]/40 to-transparent pointer-events-none z-10 transition-opacity duration-500"
                style={{ opacity: initialScrimOpacity }}
              />

              {/* Cinema Scrim for Motion Storytelling: Ensures 100% razor-sharp text legibility against daylight windows */}
              <div
                className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ease-out ${
                  isNarrativeActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Left side soft gradient for Chapter 1 & 3 */}
                <div
                  className={`absolute inset-y-0 left-0 w-full sm:w-2/3 bg-gradient-to-r from-[#050914]/90 via-[#050914]/55 to-transparent transition-opacity duration-500 ${
                    activeStep === 1 || activeStep === 3 ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Right side soft gradient for Chapter 2 */}
                <div
                  className={`absolute inset-y-0 right-0 w-full sm:w-2/3 bg-gradient-to-l from-[#050914]/90 via-[#050914]/55 to-transparent transition-opacity duration-500 ${
                    activeStep === 2 ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Subtle top & bottom edge vignette */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#070c18]/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070c18]/90 to-transparent" />
              </div>
            </div>
          ) : (
            // Static House & Van Scene
            <div className="relative w-full h-full">
              <img
                src="/images/hero-house-van.jpg"
                alt="CoolFlow Modern Home and Service Van"
                className="w-full h-full object-cover object-center lg:object-right filter brightness-[0.85] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#070c18]/80 to-transparent w-full lg:w-3/5" />
            </div>
          )}

          {/* Minimal ambient glow */}
          <div
            className="absolute top-1/3 left-1/4 w-[420px] h-[420px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700"
            style={{
              backgroundColor: scrollProgress < 0.45 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.12)',
            }}
          />
        </div>

        {/* ================= LAYER 1: Initial Landing Content (Fades out cleanly on scroll) ================= */}
        <div
          className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 transition-all duration-150 ease-out ${
            isInitialContentHidden ? 'pointer-events-none invisible' : 'pointer-events-auto visible'
          }`}
          style={{ opacity: contentOpacity }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtitle, Actions & Trust */}
            <div
              className="lg:col-span-7 space-y-6 will-change-transform"
              style={{ transform: leftTransform }}
            >
              {/* Minimal Kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-cool-300 text-xs font-medium tracking-wider backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cool-400 animate-pulse" />
                <span className="uppercase tracking-widest text-[11px]">
                  Precision Climate Engineering
                </span>
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.12]">
                  A More{' '}
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cool-300 via-cool-400 to-sky-400">
                    Comfortable
                  </span>{' '}
                  Home Awaits
                </h1>
                <p className="text-base sm:text-lg text-slate-300/90 max-w-xl font-light leading-relaxed mt-4">
                  Professional heating, cooling, and indoor air solutions. Engineered with whisper-quiet precision and uncompromising performance.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuote}
                  className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-cool-600 to-cool-500 hover:from-cool-500 hover:to-cool-400 text-white font-medium text-base flex items-center gap-2 shadow-lg shadow-cool-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Get a Free Quote</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="tel:5551234567"
                  className="px-6 py-3.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-white font-medium text-base flex items-center gap-2.5 border border-white/15 backdrop-blur-md transition-all"
                >
                  <Phone className="w-4 h-4 text-cool-400" />
                  <span>(555) 123-4567</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-cool-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">24/7 Response</div>
                    <div className="text-[11px] text-slate-400">Rapid Dispatch</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-cool-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">NATE-Certified</div>
                    <div className="text-[11px] text-slate-400">Licensed & Insured</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-cool-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">Guaranteed</div>
                    <div className="text-[11px] text-slate-400">100% Satisfaction</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Clean Thermostat Card & View Switcher */}
            <div
              className="lg:col-span-5 relative flex flex-col items-end gap-5 will-change-transform"
              style={{ transform: rightTransform }}
            >
              {/* Thermostat Widget */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 w-full max-w-sm backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-cool-500/10 border border-cool-400/20 flex items-center justify-center text-cool-400">
                      <Sun className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-light text-white tracking-tight">
                          {displayTemp}°{isFahrenheit ? 'F' : 'C'}
                        </span>
                        <span className="text-[10px] font-semibold text-cool-400 uppercase tracking-wider">
                          Auto Comfort
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-light">
                        Multi-Zone Climate
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setManualTempOverride((prev) => (prev ?? currentTemp) + 1)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xs font-semibold border border-white/10 transition-colors"
                      aria-label="Increase Temp"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setManualTempOverride((prev) => Math.max((prev ?? currentTemp) - 1, 60))}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xs font-semibold border border-white/10 transition-colors"
                      aria-label="Decrease Temp"
                    >
                      −
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-cool-300/80 text-[11px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cool-400" />
                    Scroll to see work in motion
                  </span>
                  <button
                    onClick={() => setIsFahrenheit(!isFahrenheit)}
                    className="hover:text-white transition-colors underline decoration-dotted text-[11px]"
                  >
                    °{isFahrenheit ? 'C' : 'F'}
                  </button>
                </div>
              </div>

              {/* View Switcher */}
              <div className="p-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md flex items-center gap-1.5 border border-white/10 text-xs">
                <span className="text-slate-400 px-2 text-[11px] font-mono flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-cool-400" />
                  View:
                </span>
                <button
                  onClick={() => setViewMode('video-scroll')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'video-scroll'
                      ? 'bg-cool-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Scroll Video
                </button>
                <button
                  onClick={() => setViewMode('house')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'house'
                      ? 'bg-cool-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  House & Van
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ================= LAYER 2: Motion Graphics Cinematic Typography ================= */}
        {viewMode === 'video-scroll' && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full">
              {MOTION_CHAPTERS.map((chapter) => {
                const styles = getMotionStyles(scrollProgress, chapter.range);
                if (!styles.visible) return null;

                const isRightAligned = chapter.alignment === 'right';

                return (
                  <div
                    key={chapter.id}
                    className={`w-full max-w-xl transition-all duration-150 ease-out relative ${
                      isRightAligned ? 'ml-auto text-left sm:text-right' : 'mr-auto text-left'
                    }`}
                    style={{
                      opacity: styles.opacity,
                      transform: styles.transform,
                    }}
                  >
                    {/* Soft ambient dark radial backplate to ensure 100% crisp contrast over any video scene */}
                    <div className="absolute -inset-10 bg-slate-950/60 rounded-3xl blur-3xl -z-10 pointer-events-none" />

                    {/* Motion Graphics Tag Line with Hairline Accent */}
                    <div
                      className={`flex items-center gap-3 mb-4 ${
                        isRightAligned ? 'justify-start sm:justify-end' : 'justify-start'
                      }`}
                    >
                      {!isRightAligned && (
                        <span className="w-8 sm:w-12 h-[2px] bg-cyan-400" />
                      )}
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        {chapter.tag}
                      </span>
                      {isRightAligned && (
                        <span className="hidden sm:inline-block w-8 sm:w-12 h-[2px] bg-cyan-400" />
                      )}
                    </div>

                    {/* Editorial Large Kinetic Headline — High contrast, crisp weights */}
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.14] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
                      {chapter.headline}{' '}
                      {chapter.headlineAccent && (
                        <span className="block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cool-300 via-sky-300 to-cyan-300">
                          {chapter.headlineAccent}
                        </span>
                      )}
                    </h2>

                    {/* High-legibility Description */}
                    <p
                      className={`text-slate-100 text-base sm:text-lg font-normal leading-relaxed mt-4 max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] ${
                        isRightAligned ? 'sm:ml-auto' : ''
                      }`}
                    >
                      {chapter.description}
                    </p>

                    {/* High-Contrast Monospace Telemetry Stamp */}
                    <div
                      className={`mt-6 pt-4 border-t border-white/20 flex items-center ${
                        isRightAligned ? 'justify-start sm:justify-end' : 'justify-start'
                      }`}
                    >
                      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-lg shadow-black/50">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="font-mono text-xs font-semibold text-slate-200 tracking-wider uppercase">
                          {chapter.telemetry}
                        </span>
                      </div>
                    </div>

                    {/* Chapter 3 Clean Direct CTA */}
                    {chapter.id === 3 && (
                      <div
                        className={`mt-6 flex items-center gap-4 pointer-events-auto ${
                          isRightAligned ? 'justify-start sm:justify-end' : 'justify-start'
                        }`}
                      >
                        <button
                          onClick={onOpenQuote}
                          className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-base flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/60"
                        >
                          <span>Request Consultation</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= LAYER 3: Minimal Motion Graphics Index (Right Side) ================= */}
        {viewMode === 'video-scroll' && (
          <div
            className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-4 transition-opacity duration-500 pointer-events-none"
            style={{
              opacity: scrollProgress > 0.12 && scrollProgress < 0.96 ? 1 : 0,
            }}
          >
            {[1, 2, 3].map((step) => {
              const isActive = activeStep === step;
              return (
                <div key={step} className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs tracking-widest transition-colors duration-300 ${
                      isActive ? 'text-cyan-300 font-bold' : 'text-white/30'
                    }`}
                  >
                    0{step}
                  </span>
                  <div
                    className={`h-8 w-[2px] transition-all duration-300 ${
                      isActive ? 'bg-cyan-400 scale-y-125 shadow-sm shadow-cyan-400' : 'bg-white/20'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ================= LAYER 4: High-Legibility Bottom Telemetry Line ================= */}
        {viewMode === 'video-scroll' && (
          <div
            className="absolute bottom-6 left-6 sm:left-10 right-6 sm:right-10 z-30 flex items-center justify-between text-xs font-mono text-slate-300 tracking-widest uppercase transition-opacity duration-500 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{
              opacity: scrollProgress > 0.12 && scrollProgress < 0.96 ? 1 : 0,
            }}
          >
            <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-slate-200">CoolFlow Architectural System</span>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 px-3.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
              <span className="hidden sm:inline text-slate-300">
                Frame {Math.min(TOTAL_FRAMES, Math.round(scrollProgress * (TOTAL_FRAMES - 1)) + 1)} / {TOTAL_FRAMES}
              </span>
              <span className="text-cyan-300 font-bold">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Minimal Scroll Nudge on Initial State */}
        {viewMode === 'video-scroll' && scrollProgress < 0.08 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none transition-all duration-300 ease-out"
            style={{
              opacity: Math.max(0, 1 - rawExit * 3),
              transform: `translate3d(-50%, ${exitEased * 20}px, 0)`,
            }}
          >
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-cool-300 bg-slate-950/70 px-3 py-1 rounded-full border border-cool-500/30 backdrop-blur-md">
              Scroll to explore
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-cool-400 animate-bounce" />
          </div>
        )}

      </div>
    </div>
  );
};
