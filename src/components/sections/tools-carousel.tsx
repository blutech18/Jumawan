"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValue, useAnimationFrame, useMotionTemplate } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from '../../../convex/_generated/api';

// --- Types ---
interface DisplayTool {
  name: string;
  image: string;
}

// --- Shared scroll velocity tracker for mobile marquee ---
function useScrollVelocity() {
  const velocity = useRef(0);

  useEffect(() => {
    let rafId: number;
    let prevY = window.scrollY;
    let prevTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - prevTime) / 1000; // seconds
      const currentY = window.scrollY;
      const dist = Math.abs(currentY - prevY);

      if (dt > 0) {
        // Pixels per second — true velocity
        const instantSpeed = dist / dt;
        // Smooth it so it doesn't spike/drop instantly
        const smoothing = 0.3;
        velocity.current += (instantSpeed - velocity.current) * smoothing;
      }

      prevY = currentY;
      prevTime = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return velocity;
}

// --- Marquee Row driven by requestAnimationFrame with scroll-responsive speed ---
const MarqueeRow = ({ tools, reverse = false, baseSpeed = 40, scrollVelocity }: { 
  tools: DisplayTool[]; 
  reverse?: boolean;
  baseSpeed?: number;
  scrollVelocity: React.MutableRefObject<number>;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const setARef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const initializedRef = useRef(false);
  const smoothSpeedRef = useRef(baseSpeed);
  
  const repeatCount = tools.length > 0 ? Math.max(8, Math.ceil(80 / tools.length)) : 0;
  const oneSet = tools.length > 0 ? Array(repeatCount).fill(tools).flat() : [];

  // Measure width of one set
  useEffect(() => {
    if (tools.length === 0) return;
    const measure = () => {
      if (setARef.current) {
        widthRef.current = setARef.current.offsetWidth;
        if (!initializedRef.current && reverse && widthRef.current > 0) {
          offsetRef.current = -widthRef.current;
          initializedRef.current = true;
        }
      }
    };
    measure();
    const timer = setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(timer);
    };
  }, [tools.length, reverse]);

  // Animation loop — single smooth pipeline
  useEffect(() => {
    if (tools.length === 0) return;
    let rafId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const w = widthRef.current;
      if (w > 0 && trackRef.current && dt > 0 && dt < 0.1) {
        // Scroll boost: map velocity to a 0-4 multiplier for noticeable effect
        const scrollSpeed = scrollVelocity.current;
        const boost = Math.min(4, scrollSpeed / 200);
        const targetSpeed = baseSpeed + baseSpeed * boost;
        
        // Frame-rate independent exponential smoothing
        const halfLife = boost > 0.1 ? 0.15 : 0.6; // fast ramp-up, slow decay
        const factor = 1 - Math.pow(0.5, dt / halfLife);
        smoothSpeedRef.current += (targetSpeed - smoothSpeedRef.current) * factor;
        
        const direction = reverse ? 1 : -1;
        offsetRef.current += direction * smoothSpeedRef.current * dt;

        // Modulo wrap
        if (!reverse) {
          if (offsetRef.current <= -w) {
            offsetRef.current = offsetRef.current % w;
          }
        } else {
          if (offsetRef.current >= 0) {
            offsetRef.current = -w + (offsetRef.current % w);
          }
        }

        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [tools.length, baseSpeed, reverse, scrollVelocity]);

  if (tools.length === 0) return null;

  return (
    <div className="overflow-hidden" style={{ height: '4.5rem', borderTop: '1px solid var(--marquee-border, rgba(6,182,212,0.15))', borderBottom: '1px solid var(--marquee-border, rgba(6,182,212,0.15))' }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {/* 3 identical sets for bulletproof seamless loop */}
        {[0, 1, 2].map((setIdx) => (
          <div key={setIdx} ref={setIdx === 0 ? setARef : undefined} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {oneSet.map((tool, i) => (
              <div
                key={`${setIdx}-${i}`}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: '2.75rem', height: '2.75rem', margin: '0 1.25rem' }}
              >
                <img src={tool.image} alt={tool.name} className="w-full h-full object-contain opacity-70" draggable={false} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Mobile Horizontal Lines Component ---
const MobileToolsLayout = ({ 
  innerRing, 
  middleRing, 
  outerRing 
}: { 
  innerRing: DisplayTool[];
  middleRing: DisplayTool[];
  outerRing: DisplayTool[];
}) => {
  const scrollVelocity = useScrollVelocity();
  const allTools = [...innerRing, ...middleRing, ...outerRing];
  
  // Fisher-Yates shuffle with a seed so it's stable per mount but random per row
  const shuffle = (arr: DisplayTool[], seed: number) => {
    const copy = [...arr];
    let s = seed;
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const line1 = shuffle(allTools, 1);
  const line2 = shuffle(allTools, 2);
  const line3 = shuffle(allTools, 3);

  return (
    <motion.div 
      className="w-full relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <motion.div 
        className="flex flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <MarqueeRow tools={line1} baseSpeed={44} scrollVelocity={scrollVelocity} />
        <MarqueeRow tools={line2} reverse baseSpeed={28} scrollVelocity={scrollVelocity} />
        <MarqueeRow tools={line3} baseSpeed={50} scrollVelocity={scrollVelocity} />
      </motion.div>

      {/* Central Logo In Front */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.45 }}
      >
        <motion.img
          src="/blutech.png"
          alt="Tech Core"
          className="w-[10rem] h-[10rem] sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
};

// --- Desktop Solar System Component ---
// Laser Beam Component
const LaserBeam = () => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <defs>
        <linearGradient id="laserGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor="var(--laser-mid, rgba(56, 189, 248, 0.3))" />
          <stop offset="100%" stopColor="var(--laser-tip, rgba(34, 211, 238, 0.9))" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1="50%" y1="50%"
        x2="50%" y2="0%"
        stroke="url(#laserGradient)"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="animate-pulse"
      />
    </svg>
  );
};

// A single planet node that sits on an orbit
const PlanetNode = ({
  tool,
  baseDiameterClasses,
  baseAngle,
  rotationValue,
}: {
  tool: DisplayTool;
  baseDiameterClasses: string;
  baseAngle: number;
  rotationValue: MotionValue<number>;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const rotate = useTransform(rotationValue, (r) => r + baseAngle);
  const counterRotate = useTransform(rotate, (r) => -r);

  return (
    <motion.div
      className={`absolute top-1/2 left-1/2 pointer-events-none rounded-full ${baseDiameterClasses}`}
      style={{
        x: "-50%",
        y: "-50%",
        rotate: rotate,
      }}
    >
      <div className="absolute inset-0 opacity-30">
        <LaserBeam />
      </div>
      <div
        className="absolute top-0 left-1/2 z-10"
        style={{ 
          transform: "translate(-50%, -50%)",
          transformOrigin: "50% 50%" 
        }}
      >
        <motion.div
          style={{ rotate: counterRotate }}
          className="relative group pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative flex items-center justify-center scale-90 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={tool.image}
                alt={tool.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <div className={`
            absolute left-1/2 -translate-x-1/2 top-full mt-2
            px-2 py-1 bg-[var(--surface-bg)]/90 border border-cyan-500/30 rounded
            text-[10px] sm:text-xs text-foreground whitespace-nowrap pointer-events-none
            opacity-0 transform translate-y-2 transition-all duration-200
            ${isHovered ? "opacity-100 translate-y-0" : ""}
          `}>
            {tool.name}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const DesktopSolarSystem = ({
  innerRing,
  middleRing,
  outerRing,
  containerRef,
}: {
  innerRing: DisplayTool[];
  middleRing: DisplayTool[];
  outerRing: DisplayTool[];
  containerRef: React.RefObject<HTMLElement>;
}) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
    layoutEffect: false // Prevents warning during SSR/initial render
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const baseRotation = useMotionValue(0);
  const speedFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (speedFactor.current > 1) {
      speedFactor.current = Math.max(1, speedFactor.current * 0.95);
    }
    const current = baseRotation.get();
    baseRotation.set(current + delta * 0.005 * speedFactor.current);
  });

  const innerRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => ((base as number) * 3) + ((scroll as number) * 360)
  );

  const middleRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => ((base as number) * -2) + (30 + (scroll as number) * -360)
  );

  const outerRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => ((base as number) * 1) + ((scroll as number) * 180)
  );

  const coreScale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [pulses, setPulses] = useState<number[]>([]);

  const triggerPulse = () => {
    setPulses(prev => [...prev, Date.now()]);
    speedFactor.current = Math.min(20, speedFactor.current + 4);
  };

  const removePulse = (id: number) => {
    setPulses(prev => prev.filter(pulseId => pulseId !== id));
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      animate={{ y: [-10, 10] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
      style={{ willChange: 'transform' }}
      className="relative group w-[240px] h-[240px] sm:w-[400px] sm:h-[400px] md:w-[560px] md:h-[560px] flex items-center justify-center perspective-1000"
    >
      <motion.div
        style={{ scale: coreScale }}
        className="absolute z-20 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center cursor-pointer"
        onClick={triggerPulse}
      >
        <motion.img
          src="/blutech.png"
          alt="Tech Core"
          className="w-full h-full object-contain z-10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {pulses.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 0.8, opacity: 0.8, borderWidth: "4px" }}
            animate={{
              scale: 4.5,
              opacity: 0,
              borderWidth: "0px",
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
            onAnimationComplete={() => removePulse(id)}
            className="absolute inset-0 rounded-full border border-cyan-300 pointer-events-none"
            style={{
              zIndex: -1,
              boxShadow: "var(--pulse-shadow, 0 0 20px 4px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.4))"
            }}
          />
        ))}
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute rounded-full border border-blue-500/10 w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[320px] md:h-[320px]" />
        <div className="absolute rounded-full border border-blue-500/10 w-[260px] h-[260px] sm:w-[390px] sm:h-[390px] md:w-[520px] md:h-[520px]" />
        <div className="absolute rounded-full border border-blue-500/10 w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] md:w-[720px] md:h-[720px]" />
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{
          maskImage: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
        }}
      >
        <div className="absolute rounded-full border border-cyan-400/60 w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[320px] md:h-[320px]" />
        <div className="absolute rounded-full border border-cyan-400/60 w-[260px] h-[260px] sm:w-[390px] sm:h-[390px] md:w-[520px] md:h-[520px]" />
        <div className="absolute rounded-full border border-cyan-400/60 w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] md:w-[720px] md:h-[720px]" />
      </motion.div>

      <div className="absolute inset-0 origin-center pointer-events-none" style={{ willChange: 'transform' }}>
        <div className="absolute inset-0 pointer-events-auto z-30">
          {/* Inner Ring */}
          {innerRing.map((tool, i) => (
            <PlanetNode
              key={tool.name}
              tool={tool}
              baseDiameterClasses="w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[320px] md:h-[320px]"
              baseAngle={(360 / innerRing.length) * i}
              rotationValue={innerRotate}
            />
          ))}
          {/* Middle Ring */}
          {middleRing.map((tool, i) => (
            <PlanetNode
              key={tool.name}
              tool={tool}
              baseDiameterClasses="w-[260px] h-[260px] sm:w-[390px] sm:h-[390px] md:w-[520px] md:h-[520px]"
              baseAngle={(360 / middleRing.length) * i}
              rotationValue={middleRotate}
            />
          ))}
          {/* Outer Ring */}
          {outerRing.map((tool, i) => (
            <PlanetNode
              key={tool.name}
              tool={tool}
              baseDiameterClasses="w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] md:w-[720px] md:h-[720px]"
              baseAngle={(360 / outerRing.length) * i}
              rotationValue={outerRotate}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Component ---
export function ToolsCarousel() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Reactive query — auto-updates when tools are added/removed/toggled in admin
  const data = useQuery(api.tools.listActive);

  const { innerRing, middleRing, outerRing } = useMemo(() => {
    if (!data || data.length === 0) return { innerRing: [], middleRing: [], outerRing: [] };

    const uniqueToolsMap = new Map<string, DisplayTool>();
    data.forEach((t) => {
      if (!uniqueToolsMap.has(t.name)) {
        uniqueToolsMap.set(t.name, { name: t.name, image: t.icon_url });
      }
    });
    const allTools = Array.from(uniqueToolsMap.values());

    const total = allTools.length;
    const innerCount = Math.max(3, Math.floor(total * 0.2));
    const middleCount = Math.max(5, Math.floor(total * 0.35));

    return {
      innerRing: allTools.slice(0, innerCount),
      middleRing: allTools.slice(innerCount, innerCount + middleCount),
      outerRing: allTools.slice(innerCount + middleCount),
    };
  }, [data]);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      ref={containerRef}
      id="tools"
      className="py-20 sm:py-24 relative overflow-hidden bg-transparent min-h-[600px] md:min-h-[1000px] flex flex-col items-center justify-center"
    >
      <motion.div 
        className="container mx-auto px-4 relative z-10 flex flex-col items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.9 }}
      >
        <motion.div 
          className="text-center mb-28 sm:mb-36"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center mx-auto w-fit">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 mb-4 text-center">
              Tools & Technologies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              The technologies and tools I use to build exceptional digital experiences
            </p>
          </div>
        </motion.div>

        <motion.div 
          className={isMobile ? "block" : "hidden"}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <MobileToolsLayout 
            innerRing={innerRing}
            middleRing={middleRing}
            outerRing={outerRing}
          />
        </motion.div>
        <motion.div 
          className={isMobile ? "hidden" : "block"}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <DesktopSolarSystem
            innerRing={innerRing}
            middleRing={middleRing}
            outerRing={outerRing}
            containerRef={containerRef}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
