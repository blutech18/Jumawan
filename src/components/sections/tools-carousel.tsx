"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValue, useAnimationFrame, useMotionTemplate } from "framer-motion";
import { convexClient } from '@/lib/convexClient';
import { api } from '../../../convex/_generated/api';

// --- Types ---
interface DisplayTool {
  name: string;
  image: string;
}

// --- Marquee Row with pixel-based CSS animation for seamless loop ---
const MarqueeRow = ({ tools, reverse = false, speedMultiplier = 1 }: { 
  tools: DisplayTool[]; 
  reverse?: boolean;
  speedMultiplier?: number;
}) => {
  const uniqueId = useRef(`marquee-${Math.random().toString(36).substr(2, 9)}`).current;
  
  if (tools.length === 0) return null;
  
  // Create enough icons to fill viewport
  // speedMultiplier increases icon count = more distance = faster visual speed
  const baseMinIcons = 20;
  const minIcons = Math.ceil(baseMinIcons * speedMultiplier);
  const repeatCount = Math.max(1, Math.ceil(minIcons / Math.max(1, tools.length)));
  const oneSet = Array(repeatCount).fill(tools).flat();
  
  // Each icon: 3rem (48px) width + 1.5rem (24px) margin on each side = 96px total
  const iconTotalWidth = 96;
  const oneSetWidth = oneSet.length * iconTotalWidth;
  
  // Duration: 10 minutes (600 seconds) per full cycle
  // Speed is controlled by icon count, not duration
  const duration = 600;

  return (
    <div style={{ height: '5rem', overflow: 'hidden', borderTop: '1px solid rgba(6,182,212,0.2)', borderBottom: '1px solid rgba(6,182,212,0.2)' }}>
      <style>{`
        @keyframes ${uniqueId} {
          from { transform: translateX(0px); }
          to { transform: translateX(${reverse ? oneSetWidth : -oneSetWidth}px); }
        }
      `}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        animation: `${uniqueId} ${duration}s linear infinite`
      }}>
        {/* First set */}
        {oneSet.map((tool, i) => (
          <div key={`a-${i}`} style={{ flexShrink: 0, width: '3rem', height: '3rem', margin: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={tool.image} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ))}
        {/* Second set (identical copy for seamless loop) */}
        {oneSet.map((tool, i) => (
          <div key={`b-${i}`} style={{ flexShrink: 0, width: '3rem', height: '3rem', margin: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={tool.image} alt={tool.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
  const allTools = [...innerRing, ...middleRing, ...outerRing];
  const toolsPerLine = Math.ceil(allTools.length / 3);
  
  const line1 = allTools.slice(0, toolsPerLine);
  const line2 = allTools.slice(toolsPerLine, toolsPerLine * 2);
  const line3 = allTools.slice(toolsPerLine * 2);

  return (
    <motion.div 
      className="w-full relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <motion.div 
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <MarqueeRow tools={line1} speedMultiplier={2.0} />
        <MarqueeRow tools={line2} reverse speedMultiplier={2.0} />
        <MarqueeRow tools={line3} speedMultiplier={2.0} />
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
          className="w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain"
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
          <stop offset="20%" stopColor="rgba(56, 189, 248, 0.3)" />
          <stop offset="100%" stopColor="rgba(34, 211, 238, 0.9)" />
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
            px-2 py-1 bg-black/90 border border-cyan-500/30 rounded
            text-[10px] sm:text-xs text-cyan-50 whitespace-nowrap pointer-events-none
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
              boxShadow: "0 0 20px 4px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.4)"
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
  const [innerRing, setInnerRing] = useState<DisplayTool[]>([]);
  const [middleRing, setMiddleRing] = useState<DisplayTool[]>([]);
  const [outerRing, setOuterRing] = useState<DisplayTool[]>([]);
  
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

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await convexClient.query(api.tools.listActive);

        if (data && data.length > 0) {
          const uniqueToolsMap = new Map();
          data.forEach((t: any) => {
            if (!uniqueToolsMap.has(t.name)) {
              uniqueToolsMap.set(t.name, {
                name: t.name,
                image: t.icon_url
              });
            }
          });
          const allTools = Array.from(uniqueToolsMap.values());

          const total = allTools.length;
          const innerCount = Math.max(3, Math.floor(total * 0.2));
          const middleCount = Math.max(5, Math.floor(total * 0.35));

          setInnerRing(allTools.slice(0, innerCount));
          setMiddleRing(allTools.slice(innerCount, innerCount + middleCount));
          setOuterRing(allTools.slice(innerCount + middleCount));
        }
      } catch (error) {
        console.warn('Failed to fetch tools:', error);
      }
    };

    fetchTools();
  }, []);

  return (
    <section
      ref={containerRef}
      id="tools"
      className="py-20 sm:py-24 relative overflow-hidden bg-transparent min-h-[1000px] flex flex-col items-center justify-center"
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
