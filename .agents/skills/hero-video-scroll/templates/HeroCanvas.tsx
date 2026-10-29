import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface HeroCanvasProps {
  totalFrames: number;
  framePathPattern?: (index: number) => string;
  posterImage?: string;
  onHeroStateChange?: (isPureVideo: boolean) => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  badges?: React.ReactNode;
  asideWidget?: React.ReactNode;
  className?: string;
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({
  totalFrames,
  framePathPattern = (i) => `/frames/frame_${String(i).padStart(3, '0')}.webp`,
  posterImage,
  onHeroStateChange,
  title,
  subtitle,
  actions,
  badges,
  asideWidget,
  className = '',
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // 1. Preload image sequence into memory
  useEffect(() => {
    let isMounted = true;
    const images: HTMLImageElement[] = [];

    // Load Frame 1 first for instant paint
    const firstImg = new Image();
    firstImg.src = framePathPattern(1);
    firstImg.onload = () => {
      if (!isMounted) return;
      images[0] = firstImg;
      setIsReady(true);
      drawFrame(0);

      // Preload remaining frames asynchronously
      for (let i = 2; i <= totalFrames; i++) {
        const img = new Image();
        img.src = framePathPattern(i);
        img.onload = () => {
          if (!isMounted) return;
          images[i - 1] = img;
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
  }, [totalFrames, framePathPattern]);

  // 2. Draw frame with object-fit: cover logic
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clampedIndex = Math.max(0, Math.min(Math.round(index), totalFrames - 1));
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
  }, [totalFrames]);

  // 3. Retina / High-DPI canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // 4. Liquid requestAnimationFrame Lerp loop
  useEffect(() => {
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
  }, [drawFrame]);

  // 5. Scroll tracking through pinned container
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScrollable = rect.height - vh;
      if (totalScrollable <= 0) return;

      const p = Math.max(0, Math.min(-rect.top / totalScrollable, 1));
      setScrollProgress(p);

      targetFrameRef.current = p * (totalFrames - 1);
      onHeroStateChange?.(p > 0.08 && p < 0.95);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames, onHeroStateChange]);

  // 6. UI Exit Choreography (Exits smoothly between p = 0.01 and 0.16)
  const rawExit = Math.max(0, Math.min((scrollProgress - 0.01) / 0.15, 1));
  const exitEased = rawExit * rawExit * (3 - 2 * rawExit);

  const contentOpacity = Math.max(0, 1 - exitEased);
  const isContentHidden = contentOpacity < 0.01;
  const leftTransform = `translate3d(${-exitEased * 45}px, ${-exitEased * 30}px, 0) scale(${1 - exitEased * 0.04})`;
  const rightTransform = `translate3d(${exitEased * 45}px, ${-exitEased * 30}px, 0) scale(${1 - exitEased * 0.04})`;
  const scrimOpacity = Math.max(0, 1 - exitEased * 1.3);

  return (
    <div ref={containerRef} className={`relative h-[300vh] ${className}`}>
      {/* Pinned Sticky Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center select-none">
        
        {/* Layer 0: Canvas Background */}
        <div className="absolute inset-0 z-0 bg-black">
          {posterImage && !isReady && (
            <img
              src={posterImage}
              alt="Hero Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover will-change-transform" />

          {/* Directional scrims that fade out during scroll */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent w-full lg:w-3/5 pointer-events-none z-10 transition-opacity duration-300"
            style={{ opacity: scrimOpacity }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 pointer-events-none z-10 transition-opacity duration-300"
            style={{ opacity: scrimOpacity }}
          />
        </div>

        {/* Layer 1: Foreground UI Elements */}
        <div
          className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 transition-all duration-150 ease-out ${
            isContentHidden ? 'pointer-events-none invisible' : 'pointer-events-auto visible'
          }`}
          style={{ opacity: contentOpacity }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 will-change-transform" style={{ transform: leftTransform }}>
              {title}
              {subtitle}
              {actions}
              {badges}
            </div>

            {asideWidget && (
              <div className="lg:col-span-5 relative flex flex-col items-end gap-5 will-change-transform" style={{ transform: rightTransform }}>
                {asideWidget}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroCanvas;

