import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Phone,
  Clock,
  ShieldCheck,
  Award,
  Sun,
  Wind,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Gauge,
  Thermometer,
  Activity,
  CheckCircle2,
  Zap,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Crosshair,
  Info,
} from 'lucide-react';

interface HeroProps {
  onOpenQuote: () => void;
  onHeroStateChange?: (isPureVideo: boolean) => void;
}

const TOTAL_FRAMES = 144;

interface Chapter {
  id: number;
  stepNumber: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: { label: string; value: string; highlight: string }[];
  scrollTarget: number;
  range: [number, number, number, number]; // [start, peakIn, peakOut, end]
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    stepNumber: '01',
    badge: 'SMART DETECTION',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
    title: 'Smart Thermal Mapping',
    subtitle: 'Continuous Multi-Zone Radiant Scan',
    description:
      'Infrared micro-sensors detect radiant solar gain through the panoramic glass, initiating variable inverter cooling before temperatures begin to drift.',
    metrics: [
      { label: 'Room Heat Load', value: 'High Solar Gain', highlight: 'text-amber-400' },
      { label: 'Inverter Speed', value: 'Spooling • 65%', highlight: 'text-cool-300' },
      { label: 'Target Setpoint', value: '72°F Target', highlight: 'text-emerald-400' },
    ],
    scrollTarget: 0.28,
    range: [0.15, 0.22, 0.38, 0.44],
  },
  {
    id: 2,
    stepNumber: '02',
    badge: 'AERODYNAMIC FLOW',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
    title: 'Whisper-Silent Dispersion',
    subtitle: 'Dual Architectural Linear Diffusers',
    description:
      'Engineered slot diffusers project laminar cool air along the ceiling using the Coandă effect, delivering draft-free circulation at a whisper-silent 18 dB.',
    metrics: [
      { label: 'Sound Level', value: '18 dB (Whisper Silent)', highlight: 'text-cool-300' },
      { label: 'Air Velocity', value: '0.15 m/s (Draft-Free)', highlight: 'text-sky-300' },
      { label: 'Filtration Level', value: 'MERV-16 + Dual HEPA', highlight: 'text-emerald-400' },
    ],
    scrollTarget: 0.58,
    range: [0.44, 0.51, 0.68, 0.74],
  },
  {
    id: 3,
    stepNumber: '03',
    badge: 'CLIMATE EQUILIBRIUM',
    badgeColor: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
    title: 'Pure Living Equilibrium',
    subtitle: '72°F Ideal Comfort • 40% Energy Savings',
    description:
      'The penthouse achieves complete thermal harmony. Intelligent inverter compressors drop into ultra-low whisper maintenance mode, conserving power.',
    metrics: [
      { label: 'Ambient Comfort', value: '72°F Pristine Balance', highlight: 'text-emerald-400' },
      { label: 'Air Quality', value: 'AQI 12 (Mountain Pure)', highlight: 'text-emerald-400' },
      { label: 'Efficiency Rating', value: '24.5 SEER2 Inverter', highlight: 'text-cool-300' },
    ],
    scrollTarget: 0.88,
    range: [0.74, 0.81, 0.94, 0.98],
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

  // Interactive controls
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Canvas & Frame Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const autoTourRafRef = useRef<number | null>(null);

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

    // High quality bicubic resampling for sharp rendering on mobile Retina and 4K displays
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

  // 5. Smooth Jump to specific progress milestone
  const scrollToProgress = useCallback((targetP: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const currentScroll = window.scrollY;
    const containerTop = currentScroll + rect.top;
    const scrollableDist = el.offsetHeight - window.innerHeight;
    const targetScroll = containerTop + targetP * scrollableDist;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  }, []);

  // 6. Interactive Auto-Tour Feature
  const stopAutoTour = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoTourRafRef.current) {
      cancelAnimationFrame(autoTourRafRef.current);
      autoTourRafRef.current = null;
    }
  }, []);

  const startAutoTour = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setIsAutoPlaying(true);
    const startScroll = window.scrollY;
    const rect = el.getBoundingClientRect();
    const containerTop = startScroll + rect.top;
    const scrollable = el.offsetHeight - window.innerHeight;
    const endScroll = containerTop + scrollable * 0.92;

    const duration = 14000; // 14 seconds smooth narrative scrub
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth easeInOutCubic
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const currentTarget = startScroll + (endScroll - startScroll) * ease;
      window.scrollTo(0, currentTarget);

      if (progress < 1) {
        autoTourRafRef.current = requestAnimationFrame(step);
      } else {
        setIsAutoPlaying(false);
      }
    };

    autoTourRafRef.current = requestAnimationFrame(step);
  }, []);

  const toggleAutoTour = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoTour();
    } else {
      startAutoTour();
    }
  }, [isAutoPlaying, startAutoTour, stopAutoTour]);

  // Interrupt auto-tour if user manually interacts
  useEffect(() => {
    const cancel = () => {
      if (isAutoPlaying) {
        stopAutoTour();
      }
    };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel, { passive: true });
    return () => {
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
      if (autoTourRafRef.current) cancelAnimationFrame(autoTourRafRef.current);
    };
  }, [isAutoPlaying, stopAutoTour]);

  // Helper for step smooth opacity and translation
  const getChapterStyles = (p: number, range: [number, number, number, number]) => {
    const [start, peakIn, peakOut, end] = range;
    if (p < start || p > end) {
      return {
        opacity: 0,
        pointerEvents: 'none' as const,
        transform: 'translate3d(0, 32px, 0)',
        visible: false,
      };
    }
    let weight = 1;
    let offsetY = 0;
    if (p < peakIn) {
      const t = (p - start) / (peakIn - start);
      weight = t * t * (3 - 2 * t);
      offsetY = (1 - weight) * 30;
    } else if (p > peakOut) {
      const t = (end - p) / (end - peakOut);
      weight = t * t * (3 - 2 * t);
      offsetY = (1 - weight) * -30;
    }
    return {
      opacity: weight,
      pointerEvents: weight > 0.05 ? ('auto' as const) : ('none' as const),
      transform: `translate3d(0, ${offsetY}px, 0)`,
      visible: weight > 0.01,
    };
  };

  // Initial Content Exit Calculations
  const rawExit = Math.max(0, Math.min((scrollProgress - 0.01) / 0.14, 1));
  const exitEased = rawExit * rawExit * (3 - 2 * rawExit);
  const contentOpacity = viewMode === 'video-scroll' ? Math.max(0, 1 - exitEased) : 1;
  const isInitialContentHidden = viewMode === 'video-scroll' && contentOpacity < 0.01;

  const leftTransform = viewMode === 'video-scroll'
    ? `translate3d(${-exitEased * 45}px, ${-exitEased * 25}px, 0) scale(${1 - exitEased * 0.04})`
    : 'none';

  const rightTransform = viewMode === 'video-scroll'
    ? `translate3d(${exitEased * 45}px, ${-exitEased * 25}px, 0) scale(${1 - exitEased * 0.04})`
    : 'none';

  // Dynamic Telemetry Calculations
  const normalizedProgress = Math.min(1, Math.max(0, (scrollProgress - 0.15) / 0.65));
  const dynamicTemp = Math.round(78 - normalizedProgress * 6);
  const currentTemp = manualTempOverride !== null ? manualTempOverride : dynamicTemp;
  const displayTemp = isFahrenheit ? currentTemp : Math.round(((currentTemp - 32) * 5) / 9);

  const dynamicAQI = Math.round(68 - normalizedProgress * 56);
  const aqiLabel = dynamicAQI <= 20 ? 'Pristine' : dynamicAQI <= 45 ? 'Good' : 'Moderate';
  const aqiColor = dynamicAQI <= 20 ? 'text-emerald-400' : dynamicAQI <= 45 ? 'text-sky-400' : 'text-amber-400';

  const dynamicCFM =
    scrollProgress < 0.18
      ? 0
      : scrollProgress < 0.42
      ? Math.round(180 + ((scrollProgress - 0.18) / 0.24) * 160)
      : scrollProgress < 0.72
      ? 450
      : 180;

  const dynamicNoise = scrollProgress < 0.2 ? 28 : scrollProgress > 0.45 ? 18 : 22;

  // Determine current active chapter index
  const activeChapterIndex =
    scrollProgress < 0.42
      ? 0
      : scrollProgress < 0.74
      ? 1
      : 2;

  // Hotspots visibility: Airflow Diffusers are visible during Chapter 2
  const showAirflowHotspots = viewMode === 'video-scroll' && scrollProgress >= 0.42 && scrollProgress <= 0.75;
  // Sensor Hotspot is visible during Chapter 1
  const showSensorHotspot = viewMode === 'video-scroll' && scrollProgress >= 0.16 && scrollProgress <= 0.42;

  return (
    <div
      ref={containerRef}
      id="hero"
      className={`relative ${
        viewMode === 'video-scroll' ? 'h-[340vh] sm:h-[360vh]' : 'min-h-[92vh] lg:min-h-screen'
      }`}
    >
      {/* Pinned Sticky Stage */}
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden flex items-center select-none">
        
        {/* ================= LAYER 0: Canvas Frame Sequence Background ================= */}
        <div className="absolute inset-0 z-0 bg-[#070c18]">
          {viewMode === 'video-scroll' ? (
            <div className="relative w-full h-full">
              {/* Fallback poster image before canvas initializes */}
              <img
                src="/images/hero-frame-start.jpg"
                alt="CoolFlow Luxury Penthouse Warm Frame"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              />

              {/* 60fps/120fps Canvas Video Scrubber */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
              />

              {/* Subtle edge scrims so text cards always have contrast without diminishing video beauty */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070c18]/90 via-transparent to-[#070c18]/60 pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070c18]/70 via-transparent to-[#070c18]/40 pointer-events-none z-10" />
            </div>
          ) : (
            // Static Mode: House & Van Scene
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

          {/* Dynamic Ambient Radial Glow */}
          <div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700"
            style={{
              backgroundColor: scrollProgress < 0.4 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.18)',
              opacity: viewMode === 'video-scroll' ? 0.7 : 0.4,
            }}
          />
        </div>

        {/* ================= LAYER 1: Initial Hero UI (Smoothly animates out on scroll) ================= */}
        <div
          className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 transition-all duration-150 ease-out ${
            isInitialContentHidden ? 'pointer-events-none invisible' : 'pointer-events-auto visible'
          }`}
          style={{ opacity: contentOpacity }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtitle, Actions & Badges */}
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

            {/* Right Column: Handwritten Note, Thermostat Card & View Controls */}
            <div
              className="lg:col-span-5 relative flex flex-col items-end gap-5 will-change-transform"
              style={{ transform: rightTransform }}
            >
              {/* Handwritten Note */}
              <div className="hidden sm:flex items-center gap-2 text-cool-200 handwriting text-xl self-end pr-4 animate-bounce">
                <span className="text-2xl">⤴</span>
                <span>Keeping Your Home Comfortable in Every Season</span>
              </div>

              {/* Floating Initial Thermostat Card */}
              <div className="glass-panel p-5 rounded-2xl shadow-2xl border border-white/15 w-full max-w-sm backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-amber-500/20 border-amber-400/40 text-amber-400">
                      <Sun className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                          {displayTemp}°{isFahrenheit ? 'F' : 'C'}
                        </span>
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          Warm Afternoon
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        Smart Climate Control Inactive
                      </p>
                    </div>
                  </div>

                  {/* Manual temp adjusters */}
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
                  <div className="flex items-center gap-1.5 text-cool-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-cool-400 animate-pulse" />
                    Scroll to see work in action
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

        {/* ================= LAYER 2: Floating Diagnostic Telemetry HUD (Active during scroll) ================= */}
        {viewMode === 'video-scroll' && (
          <div
            className="absolute top-4 sm:top-6 right-4 sm:right-8 z-30 transition-all duration-500 ease-out pointer-events-auto"
            style={{
              opacity: scrollProgress > 0.12 && scrollProgress < 0.98 ? 1 : 0,
              transform: `translate3d(0, ${scrollProgress > 0.12 && scrollProgress < 0.98 ? 0 : -20}px, 0)`,
              pointerEvents: scrollProgress > 0.12 && scrollProgress < 0.98 ? 'auto' : 'none',
            }}
          >
            <div className="glass-panel p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/15 backdrop-blur-xl flex items-center gap-4 sm:gap-6">
              
              {/* Temperature Telemetry */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cool-500/20 border border-cool-400/30 flex items-center justify-center text-cool-400 shrink-0">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {displayTemp}°{isFahrenheit ? 'F' : 'C'}
                    </span>
                    <button
                      onClick={() => setIsFahrenheit(!isFahrenheit)}
                      className="text-[10px] text-slate-400 hover:text-cool-300 uppercase font-bold tracking-wider underline transition-colors"
                      title="Toggle Temperature Unit"
                    >
                      {isFahrenheit ? '°C' : '°F'}
                    </button>
                  </div>
                  <div className="text-[10px] font-semibold text-cool-300 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cool-400 animate-ping" />
                    {scrollProgress < 0.4 ? 'Sensing' : scrollProgress < 0.74 ? 'Cooling' : 'Equilibrium'}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

              {/* Air Quality Index */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-white">AQI {dynamicAQI}</span>
                    <span className={`text-[11px] font-bold ${aqiColor}`}>{aqiLabel}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">HEPA Purified</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

              {/* Noise Level */}
              <div className="hidden md:flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white">{dynamicNoise} dB</div>
                  <div className="text-[10px] text-slate-400">Whisper Silent</div>
                </div>
              </div>

              {/* Auto Tour Toggle inside HUD */}
              <button
                onClick={toggleAutoTour}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  isAutoPlaying
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-cool-600/30 border-cool-400/40 text-cool-200 hover:bg-cool-600/50'
                }`}
                title={isAutoPlaying ? 'Pause cinematic tour' : 'Auto-play scroll tour'}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Auto Tour</span>
                  </>
                )}
              </button>

            </div>
          </div>
        )}

        {/* ================= LAYER 3: Interactive Visual Hotspots on Video ================= */}
        {showAirflowHotspots && (
          <>
            {/* Left Ceiling Linear Slot Diffuser Hotspot */}
            <div
              className="absolute top-[16%] left-[23%] z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={() => setActiveHotspot(activeHotspot === 'left-vent' ? null : 'left-vent')}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping" />
                <span className="absolute w-6 h-6 rounded-full bg-cyan-500/50 animate-pulse" />
                <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/80 group-hover:scale-125 transition-transform" />
              </div>

              {/* Popover Card */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 glass-panel p-3.5 rounded-xl border border-cyan-400/40 shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
                  activeHotspot === 'left-vent'
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Wind className="w-3.5 h-3.5" />
                  Ceiling Linear Slot #01
                </div>
                <p className="text-[12px] text-slate-200 leading-snug">
                  Coandă aerodynamic slot creates continuous laminar ceiling flow without cold drafts.
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[11px] text-cyan-200 font-semibold">
                  <span>Velocity: 0.15 m/s</span>
                  <span>450 CFM</span>
                </div>
              </div>
            </div>

            {/* Right Ceiling Linear Slot Diffuser Hotspot */}
            <div
              className="absolute top-[16%] left-[74%] z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onClick={() => setActiveHotspot(activeHotspot === 'right-vent' ? null : 'right-vent')}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping" />
                <span className="absolute w-6 h-6 rounded-full bg-cyan-500/50 animate-pulse" />
                <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/80 group-hover:scale-125 transition-transform" />
              </div>

              {/* Popover Card */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 glass-panel p-3.5 rounded-xl border border-cyan-400/40 shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
                  activeHotspot === 'right-vent'
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ceiling Linear Slot #02
                </div>
                <p className="text-[12px] text-slate-200 leading-snug">
                  Medical-grade HEPA MERV-16 module neutralizes 99.97% of airborne allergens & micro-dust.
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[11px] text-cyan-200 font-semibold">
                  <span>Purification: 99.97%</span>
                  <span>18 dB Silent</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sensor Hotspot during Chapter 1 */}
        {showSensorHotspot && (
          <div
            className="absolute top-[45%] left-[10%] sm:left-[14%] z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            onClick={() => setActiveHotspot(activeHotspot === 'thermal-sensor' ? null : 'thermal-sensor')}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping" />
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg shadow-amber-500/80 group-hover:scale-125 transition-transform" />
            </div>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-60 glass-panel p-3.5 rounded-xl border border-amber-400/40 shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
                activeHotspot === 'thermal-sensor'
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Sun className="w-3.5 h-3.5" />
                Solar Thermal Sensor
              </div>
              <p className="text-[12px] text-slate-200 leading-snug">
                Detects peak radiant sunlight through west-facing glass and triggers predictive cooling.
              </p>
            </div>
          </div>
        )}

        {/* ================= LAYER 4: Scroll Narrative Story Cards (Chapters 1, 2, 3) ================= */}
        {viewMode === 'video-scroll' && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {CHAPTERS.map((chapter) => {
              const styles = getChapterStyles(scrollProgress, chapter.range);
              if (!styles.visible) return null;

              return (
                <div
                  key={chapter.id}
                  className="w-full max-w-md sm:max-w-lg transition-all duration-200 ease-out pointer-events-auto mb-16 sm:mb-0"
                  style={{
                    opacity: styles.opacity,
                    transform: styles.transform,
                    pointerEvents: styles.pointerEvents,
                  }}
                >
                  <div className="glass-panel p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-2xl relative overflow-hidden group">
                    {/* Glowing Accent Top Bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                        chapter.id === 1
                          ? 'from-amber-400 via-orange-400 to-amber-500'
                          : chapter.id === 2
                          ? 'from-cyan-400 via-sky-400 to-blue-500'
                          : 'from-emerald-400 via-teal-400 to-emerald-500'
                      }`}
                    />

                    {/* Step Kicker */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-widest border ${chapter.badgeColor}`}>
                          {chapter.badge}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Phase {chapter.stepNumber} of 03
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs font-mono font-medium">
                        Scrub: {Math.round(scrollProgress * 100)}%
                      </span>
                    </div>

                    {/* Main Chapter Title & Subtitle */}
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      {chapter.title}
                    </h3>
                    <p className="text-sm font-semibold text-cool-300 mt-1">
                      {chapter.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-3">
                      {chapter.description}
                    </p>

                    {/* Metrics Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
                      {chapter.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                          <div className="text-[10px] text-slate-400 font-medium truncate">
                            {metric.label}
                          </div>
                          <div className={`text-xs font-bold mt-0.5 ${metric.highlight} truncate`}>
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action in Chapter 3 to convert viewer directly */}
                    {chapter.id === 3 && (
                      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                        <button
                          onClick={onOpenQuote}
                          className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-cool-600 to-cool-500 hover:from-cool-500 hover:to-cool-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cool-600/30 transition-all hover:scale-[1.02]"
                        >
                          <span>Get Instant Estimate</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                          href="tel:5551234567"
                          className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 border border-white/15 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-cool-400" />
                          <span>(555) 123-4567</span>
                        </a>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= LAYER 5: Interactive Bottom Chapter Rail & Scrub Controller ================= */}
        {viewMode === 'video-scroll' && (
          <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto">
            <div className="glass-panel p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-white/15 backdrop-blur-xl flex items-center justify-between gap-2 sm:gap-3">
              
              {/* Reset to Start */}
              <button
                onClick={() => scrollToProgress(0)}
                className="w-8 h-8 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs border border-white/10 transition-colors shrink-0"
                title="Reset to Beginning"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Chapter Pill Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-1 justify-center">
                {CHAPTERS.map((ch, idx) => {
                  const isActive = scrollProgress >= ch.range[0] && scrollProgress <= ch.range[3];
                  return (
                    <button
                      key={ch.id}
                      onClick={() => scrollToProgress(ch.scrollTarget)}
                      className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-cool-600 text-white shadow-md shadow-cool-600/40 scale-[1.02]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-[10px] opacity-75 font-mono">{ch.stepNumber}</span>
                      <span className="truncate">{ch.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Auto Tour Toggle */}
              <button
                onClick={toggleAutoTour}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
                  isAutoPlaying
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900/80 border-white/15 text-slate-200 hover:border-cool-400/50'
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current text-amber-400" />
                    <span className="text-[11px]">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current text-cool-400" />
                    <span className="text-[11px]">Tour</span>
                  </>
                )}
              </button>

            </div>

            {/* Micro Scrub Indicator Bar */}
            <div className="w-full bg-slate-950/60 h-1.5 rounded-full mt-2 overflow-hidden border border-white/10 relative">
              <div
                className="h-full bg-gradient-to-r from-cool-500 via-sky-400 to-emerald-400 transition-all duration-75 ease-out rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Minimal Scroll Nudge on Initial State */}
        {viewMode === 'video-scroll' && scrollProgress < 0.08 && (
          <div
            className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none transition-all duration-300 ease-out"
            style={{
              opacity: Math.max(0, 1 - rawExit * 3),
              transform: `translate3d(-50%, ${exitEased * 20}px, 0)`,
            }}
          >
            <span className="text-[11px] font-bold tracking-wider uppercase text-cool-300 bg-slate-950/70 px-3 py-1 rounded-full border border-cool-500/30 backdrop-blur-md">
              Scroll down to explore climate control
            </span>
            <ChevronDown className="w-4 h-4 text-cool-400 animate-bounce" />
          </div>
        )}

      </div>
    </div>
  );
};
