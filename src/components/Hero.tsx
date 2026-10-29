import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Phone, Clock, ShieldCheck, Award, Sun, Wind, ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
  onHeroStateChange?: (isPureVideo: boolean) => void;
}

const TOTAL_FRAMES = 144;

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
      // Immediately draw frame 1 onto canvas
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
          // Fallback to previous image if a single frame fails
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

    // Clamp index
    const clampedIndex = Math.max(0, Math.min(Math.round(index), TOTAL_FRAMES - 1));
    const img = imagesRef.current[clampedIndex] || imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Calculate aspect ratios for cover fit
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      // Redraw current frame at new resolution
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // 3. Liquid 60fps/120fps requestAnimationFrame Lerp Loop
  useEffect(() => {
    if (viewMode !== 'video-scroll') return;

    // Lerp factor: 0.14 delivers buttery, fluid inertia with zero lag
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

      // Pinned progress: 0 when top touches viewport top, 1 when bottom touches viewport bottom
      const rawProgress = -rect.top / totalScrollable;
      const p = Math.max(0, Math.min(rawProgress, 1));

      setScrollProgress(p);

      // Target frame index
      targetFrameRef.current = p * (TOTAL_FRAMES - 1);

      // Inform parent if in pure video mode (progress > 0.08 and < 0.95)
      const isPure = p > 0.08 && p < 0.95;
      onHeroStateChange?.(isPure);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, onHeroStateChange]);

  // ================= ANIMATION CALCULATIONS FOR SMOOTH ELEMENT EXIT =================
  // Elements animate out smoothly between p = 0.01 and p = 0.16
  const rawExit = Math.max(0, Math.min((scrollProgress - 0.01) / 0.15, 1));
  // Smooth cubic ease: 3x^2 - 2x^3
  const exitEased = rawExit * rawExit * (3 - 2 * rawExit);

  // Content opacity & transforms
  const contentOpacity = viewMode === 'video-scroll' ? Math.max(0, 1 - exitEased) : 1;
  const isContentHidden = viewMode === 'video-scroll' && contentOpacity < 0.01;
  
  // Left side elements glide out to the left and up
  const leftTransform = viewMode === 'video-scroll'
    ? `translate3d(${-exitEased * 45}px, ${-exitEased * 30}px, 0) scale(${1 - exitEased * 0.04})`
    : 'none';

  // Right side elements glide out to the right and up
  const rightTransform = viewMode === 'video-scroll'
    ? `translate3d(${exitEased * 45}px, ${-exitEased * 30}px, 0) scale(${1 - exitEased * 0.04})`
    : 'none';

  // Scrims fade away completely so ONLY the video is visible with 100% clarity
  const scrimOpacity = viewMode === 'video-scroll' ? Math.max(0, 1 - exitEased * 1.3) : 1;

  // Temperature calculations
  const autoTemp = Math.round(78 - scrollProgress * 6);
  const currentTemp = manualTempOverride !== null ? manualTempOverride : autoTemp;
  const displayTemp = isFahrenheit ? currentTemp : Math.round(((currentTemp - 32) * 5) / 9);

  return (
    <div
      ref={containerRef}
      id="hero"
      className={`relative ${
        viewMode === 'video-scroll' ? 'h-[280vh] sm:h-[300vh]' : 'min-h-[92vh] lg:min-h-screen'
      }`}
    >
      {/* Pinned Sticky Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center select-none">
        
        {/* ================= LAYER 0: Canvas Frame Sequence Background ================= */}
        <div className="absolute inset-0 z-0 bg-[#070c18]">
          {viewMode === 'video-scroll' ? (
            <div className="relative w-full h-full">
              {/* Fallback image before canvas initializes */}
              <img
                src="/images/hero-frame-start.jpg"
                alt="CoolFlow Luxury Penthouse Warm Frame"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              />

              {/* Ultra-Smooth Canvas Video Scrubber */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
              />

              {/* Scrim Layers: Dark edge gradients that fade out smoothly when scrolling */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#070c18]/85 to-transparent w-full lg:w-3/5 pointer-events-none z-10 transition-opacity duration-300 ease-out"
                style={{ opacity: scrimOpacity }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-[#070c18]/60 pointer-events-none z-10 transition-opacity duration-300 ease-out"
                style={{ opacity: scrimOpacity }}
              />
            </div>
          ) : (
            // Mode: Static Inspiration House & Van Scene
            <div className="relative w-full h-full">
              <img
                src="/images/hero-house-van.jpg"
                alt="CoolFlow Luxury Modern Home and Service Van"
                className="w-full h-full object-cover object-center lg:object-right filter brightness-[0.82] contrast-[1.08] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#070c18]/80 to-transparent w-full lg:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-[#070c18]/50" />
            </div>
          )}

          {/* Subtle Ambient Radial Highlight */}
          <div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700"
            style={{
              backgroundColor: scrollProgress < 0.5 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.18)',
              opacity: scrimOpacity,
            }}
          />
        </div>

        {/* ================= LAYER 1: Interactive Hero UI (Smoothly Animates Out on Scroll) ================= */}
        <div
          className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 transition-all duration-150 ease-out ${
            isContentHidden ? 'pointer-events-none invisible' : 'pointer-events-auto visible'
          }`}
          style={{ opacity: contentOpacity }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtitle, Actions & Trust Badges */}
            <div
              className="lg:col-span-7 space-y-6 will-change-transform"
              style={{ transform: leftTransform }}
            >
              {/* Kicker Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cool-500/30 text-cool-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cool-400 animate-ping" />
                <span className="tracking-widest uppercase">
                  Comfort • Efficiency • All Year
                </span>
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                  A More{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cool-300 via-cool-400 to-sky-500 underline decoration-cool-400/30 decoration-wavy underline-offset-8">
                    Comfortable
                  </span>{' '}
                  Home Awaits
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed mt-4">
                  Professional heating, cooling, and indoor air solutions for a healthier, more comfortable home. Engineered with whisper-quiet precision.
                </p>
              </div>

              {/* Call To Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenQuote}
                  className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-cool-600 to-cool-500 hover:from-cool-500 hover:to-cool-400 text-white font-bold text-base flex items-center gap-2 shadow-xl shadow-cool-600/35 hover:shadow-cool-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Get a Free Quote</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="tel:5551234567"
                  className="px-6 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 text-white font-semibold text-base flex items-center gap-2.5 border border-white/15 backdrop-blur-md hover:border-white/30 transition-all duration-200"
                >
                  <Phone className="w-4 h-4 text-cool-400" />
                  <span>(555) 123-4567</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-cool-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-cool-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">24/7</div>
                    <div className="text-[11px] text-slate-400">Emergency Response</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-cool-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-cool-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Licensed & Insured</div>
                    <div className="text-[11px] text-slate-400">NATE-Certified Experts</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-cool-500/20 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-cool-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">100% Satisfaction</div>
                    <div className="text-[11px] text-slate-400">Guaranteed Work</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Handwritten Note, Thermostat Widget & Controls */}
            <div
              className="lg:col-span-5 relative flex flex-col items-end gap-5 will-change-transform"
              style={{ transform: rightTransform }}
            >
              {/* Handwritten Note */}
              <div className="hidden sm:flex items-center gap-2 text-cool-200 handwriting text-xl self-end pr-4 animate-bounce">
                <span className="text-2xl">⤴</span>
                <span>Keeping Your Home Comfortable in Every Season</span>
              </div>

              {/* Floating Thermostat Card */}
              <div className="glass-panel p-5 rounded-2xl shadow-2xl border border-white/15 w-full max-w-sm backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors duration-500 ${
                        scrollProgress < 0.4
                          ? 'bg-amber-500/20 border-amber-400/40 text-amber-400'
                          : 'bg-cool-500/20 border-cool-400/40 text-cool-400'
                      }`}
                    >
                      {scrollProgress < 0.4 ? (
                        <Sun className="w-6 h-6 animate-pulse" />
                      ) : (
                        <Wind className="w-6 h-6 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          {displayTemp}°{isFahrenheit ? 'F' : 'C'}
                        </span>
                        <span className="text-[11px] font-bold text-cool-400 uppercase tracking-wider">
                          {scrollProgress < 0.35 ? 'Warm Dusk' : 'Cooling Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        Perfect Comfort Inside & Out
                      </p>
                    </div>
                  </div>

                  {/* Manual +/- adjusters */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setManualTempOverride((prev) => (prev ?? currentTemp) + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold border border-white/10"
                      aria-label="Increase Temp"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setManualTempOverride((prev) => Math.max((prev ?? currentTemp) - 1, 60))}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold border border-white/10"
                      aria-label="Decrease Temp"
                    >
                      −
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    60fps Canvas Engine Active
                  </div>
                  <button
                    onClick={() => setIsFahrenheit(!isFahrenheit)}
                    className="hover:text-white transition-colors underline decoration-dotted text-[11px]"
                  >
                    Switch to °{isFahrenheit ? 'C' : 'F'}
                  </button>
                </div>
              </div>

              {/* View Switcher: Scroll Video vs House & Van */}
              <div className="glass-panel-subtle p-2 rounded-xl flex items-center gap-2 border border-white/10 self-end text-xs">
                <span className="text-slate-400 px-2 font-medium flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cool-400" />
                  Hero View:
                </span>
                <button
                  onClick={() => setViewMode('video-scroll')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    viewMode === 'video-scroll'
                      ? 'bg-cool-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Scroll Video
                </button>
                <button
                  onClick={() => setViewMode('house')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    viewMode === 'house'
                      ? 'bg-cool-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  House & Van
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Minimal Scroll Nudge (Fades out immediately as soon as scrolling starts) */}
        {viewMode === 'video-scroll' && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none transition-all duration-300 ease-out"
            style={{
              opacity: Math.max(0, 1 - rawExit * 3), // Disappears in the first 5% of scroll
              transform: `translate3d(-50%, ${exitEased * 20}px, 0)`,
            }}
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase text-cool-300">
              Scroll to scrub video
            </span>
            <ChevronDown className="w-4 h-4 text-cool-400 animate-bounce" />
          </div>
        )}

      </div>
    </div>
  );
};
