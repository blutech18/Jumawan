"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValue, useAnimationFrame, useMotionTemplate } from "framer-motion";
import { supabase } from "@/lib/supabase";

// --- Types ---
interface Tool {
  id: string;
  name: string;
  icon_url: string;
  category: string;
  ring: 'inner' | 'outer';
  order_index: number;
  is_active: boolean;
}

interface DisplayTool {
  name: string;
  image: string;
}

// --- Components ---

// Laser Beam Component
const LaserBeam = () => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      {/* 
         The container matches the PlanetNode size.
         PlanetNode is: top-0 left-1/2 (relative to rotation center).
         So we draw line from center (50%, 50%) to top (50%, 0%).
      */}
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
      {/* Lightning effect - random jagged path could go here, but dashed line is a good 'tech' connector */}
    </svg>
  );
};

// A single planet node that sits on an orbit
const PlanetNode = ({
  tool,
  radius,
  baseAngle, // The starting angle offset for this specific planet
  rotationValue, // The MotionValue driving the ring's rotation
}: {
  tool: DisplayTool;
  radius: number;
  baseAngle: number;
  rotationValue: MotionValue<number>;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // We combine the ring's rotation with the planet's base angle
  const rotate = useTransform(rotationValue, (r) => r + baseAngle);

  // Counter-rotate the icon so it stays upright
  const counterRotate = useTransform(rotate, (r) => -r);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        width: radius * 2,
        height: radius * 2,
        x: "-50%",
        y: "-50%",
        rotate: rotate,
      }}
    >
      {/* Laser Connection to Core */}
      <div className="absolute inset-0 opacity-30">
        <LaserBeam />
      </div>

      {/* The Planet Container - Orbiting */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ transformOrigin: "50% 50%" }}
      >
        {/* Counter-rotation Wrapper - Keeps icon upright */}
        <motion.div
          style={{ rotate: counterRotate }}
          className="relative group pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Icon Circle - Container Removed, Scaled Down 10% */}
          <div className={`
             relative flex items-center justify-center scale-90
             ${radius < 100 ? "w-8 h-8 sm:w-10 sm:h-10" : "w-10 h-10 sm:w-12 sm:h-12"}
          `}>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={tool.image}
                alt={tool.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Tooltip */}
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

export function ToolsCarousel() {
  const containerRef = useRef<HTMLElement>(null);
  const [innerRing, setInnerRing] = useState<DisplayTool[]>([]);
  const [middleRing, setMiddleRing] = useState<DisplayTool[]>([]);
  const [outerRing, setOuterRing] = useState<DisplayTool[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tools from Supabase
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true }); // Prefer explicitly ordered tools

        if (error) throw error;

        if (data && data.length > 0) {            // Transform data for display and Deduplicate by name
          const uniqueToolsMap = new Map();
          data.forEach((t: Tool) => {
            if (!uniqueToolsMap.has(t.name)) {
              uniqueToolsMap.set(t.name, {
                name: t.name,
                image: t.icon_url
              });
            }
          });
          const allTools = Array.from(uniqueToolsMap.values());

          // Smart Distrubution Logic (Automatic 3-Ring Split)
          // Goal: ~20% Inner, ~35% Middle, ~45% Outer
          const total = allTools.length;
          const innerCount = Math.max(3, Math.floor(total * 0.2));
          const middleCount = Math.max(5, Math.floor(total * 0.35));
          // Remaining goes to outer

          setInnerRing(allTools.slice(0, innerCount));
          setMiddleRing(allTools.slice(innerCount, innerCount + middleCount));
          setOuterRing(allTools.slice(innerCount + middleCount));
        }
      } catch (err) {
        console.error("Error fetching tools:", err);
        // Fallback or empty state could go here, but leaving empty is fine as per requirements
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);


  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // --- Passive Rotation Logic ---
  // We use a MotionValue to track time/passive rotation
  const baseRotation = useMotionValue(0);
  const speedFactor = useRef(1);

  // Update base rotation on every animation frame
  // 360 degrees every ~40 seconds as a baseline speed
  useAnimationFrame((time, delta) => {
    // delta is in ms. 0.01 degrees per ms = 10 degrees per second = 36s per full rotation

    // Decay speed factor back to 1
    if (speedFactor.current > 1) {
      speedFactor.current = Math.max(1, speedFactor.current * 0.95); // Faster decay for responsiveness
    }

    const current = baseRotation.get();
    baseRotation.set(current + delta * 0.005 * speedFactor.current);
  });

  // Create combined rotation values for each ring
  // We mix the passive rotation (baseRotation) with the scroll progress (smoothProgress)

  // Inner Ring: Fast passive + Scroll
  const innerRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => {
      // Base speed: 1x
      // Scroll influence: 0 -> 360 (1 full rotation over the scroll distance)
      return ((base as number) * 3) + ((scroll as number) * 360);
    }
  );

  // Middle Ring: Medium passive (Counter-Rotating) + Scroll (Counter)
  const middleRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => {
      // Base speed: -0.8x
      // Scroll influence: 30 -> -330 (Counter rotation)
      return ((base as number) * -2) + (30 + (scroll as number) * -360);
    }
  );

  // Outer Ring: Slow passive + Scroll
  const outerRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => {
      // Base speed: 0.5x
      // Scroll influence: 0 -> 180 (Slower scroll rotation)
      return ((base as number) * 1) + ((scroll as number) * 180);
    }
  );

  // Core Pulse Effect
  const coreScale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);
  const coreGlow = useTransform(smoothProgress, [0, 0.5, 1], [
    "0px 0px 20px rgba(37,99,235,0.2)",
    "0px 0px 60px rgba(37,99,235,0.8)",
    "0px 0px 20px rgba(37,99,235,0.2)"
  ]);

  // Flashlight Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Electric Pulse Logic
  const [pulses, setPulses] = useState<number[]>([]);

  const triggerPulse = () => {
    setPulses(prev => [...prev, Date.now()]);
    // Additive speed boost: Each click adds speed, up to a max limit (e.g., 20x)
    speedFactor.current = Math.min(20, speedFactor.current + 4);
  };

  const removePulse = (id: number) => {
    setPulses(prev => prev.filter(pulseId => pulseId !== id));
  };

  return (
    <section
      ref={containerRef}
      id="tools"
      className="py-20 sm:py-24 relative overflow-hidden bg-transparent min-h-[1000px] flex flex-col items-center justify-center"
    >
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-28 sm:mb-36">
          <div className="flex flex-col items-center mx-auto w-fit">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-400 mb-4 text-center">
              Tools & Technologies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              The technologies and tools I use to build exceptional digital experiences
            </p>
          </div>
        </div>

        {/* Solar System Container */}
        {/* We use a scaling container to handle responsiveness easily */}
        <motion.div
          onMouseMove={handleMouseMove}
          animate={{
            y: [-10, 10]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="relative group w-[240px] h-[240px] sm:w-[400px] sm:h-[400px] md:w-[560px] md:h-[560px] flex items-center justify-center perspective-1000"
        >
          {/* Central Sun / Core */}
          <motion.div
            style={{
              scale: coreScale,
            }}
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

            {/* Electric Pulse Effects */}
            {pulses.map((id) => (
              <motion.div
                key={id}
                initial={{ scale: 0.8, opacity: 0.8, borderWidth: "4px" }}
                animate={{
                  scale: 4.5, // Exact match for outer ring (approx 720px / 160px)
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
                  boxShadow: "0 0 20px 4px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.4)" // Electric glow
                }}
              />
            ))}
          </motion.div>

          {/* --- ORBITS --- */}

          {/* 
            Background Ring Sizing Math:
            Radii: Inner=160, Middle=260, Outer=360
            Dia (Unscaled): 320, 520, 720

            Mobile (Scale 0.5): 160, 260, 360
            Tablet (Scale 0.75): 240, 390, 540
            Desktop (Scale 1): 320, 520, 720
          */}

          {/* Base Rings (Always visible, faint) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute rounded-full border border-blue-500/10 w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[320px] md:h-[320px]" />
            <div className="absolute rounded-full border border-blue-500/10 w-[260px] h-[260px] sm:w-[390px] sm:h-[390px] md:w-[520px] md:h-[520px]" />
            <div className="absolute rounded-full border border-blue-500/10 w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] md:w-[720px] md:h-[720px]" />
          </div>

          {/* Highlight Rings (Visible only under flashlight) */}
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


          {/* --- PLANETS --- */}

          <div className="absolute inset-0 scale-[0.5] sm:scale-[0.75] md:scale-100 origin-center pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto z-30">
              {/* Inner Ring - Base Radius 160 */}
              {innerRing.map((tool, i) => (
                <PlanetNode
                  key={tool.name}
                  tool={tool}
                  radius={160}
                  baseAngle={(360 / innerRing.length) * i}
                  rotationValue={innerRotate}
                />
              ))}

              {/* Middle Ring - Base Radius 260 */}
              {middleRing.map((tool, i) => (
                <PlanetNode
                  key={tool.name}
                  tool={tool}
                  radius={260}
                  baseAngle={(360 / middleRing.length) * i}
                  rotationValue={middleRotate}
                />
              ))}

              {/* Outer Ring - Base Radius 360 */}
              {outerRing.map((tool, i) => (
                <PlanetNode
                  key={tool.name}
                  tool={tool}
                  radius={360}
                  baseAngle={(360 / outerRing.length) * i}
                  rotationValue={outerRotate}
                />
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
