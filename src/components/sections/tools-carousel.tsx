"use client";

import React, { useState, useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValue, useAnimationFrame, useMotionTemplate } from "framer-motion";


// --- Tool Data Groups ---

// Inner Ring: Core Essentials (High frequency use)
const innerRingTools = [
  { name: "Visual Studio Code", image: "/vscode.png" },
  { name: "Cursor", image: "/cursor.png" },
  { name: "Git", image: "/github.png" }, // Using github icon for git broadly
  { name: "Visual Studio", image: "/visualstudio.png" },
];

// Middle Ring: Frameworks, Backend, Deployment (The "Planets")
const middleRingTools = [
  { name: "Firebase", image: "/firebase.png" },
  { name: "Supabase", image: "/supabase.png" },
  { name: "Vercel", image: "/vercel.png" },
  { name: "Netlify", image: "/netlify.png" },
  { name: "XAMPP", image: "/xampp.png" },
  { name: "Android Studio", image: "/androidstudio.png" },
  { name: "GitLab", image: "/gitlab.png" },
  { name: "Railway", image: "/railway.png" },
];

// Outer Ring: AI, Design, Specialized (The "Outer Rim")
const outerRingTools = [
  { name: "ChatGPT", image: "/chatgpt.png" },
  { name: "Claude", image: "/claude.png" },
  { name: "Gemini", image: "/gemini.png" },
  { name: "DeepSeek", image: "/deepseek.png" },
  { name: "Windsurf", image: "/windsurf.png" },
  { name: "AugmentCode", image: "/augmentcode.png" },
  { name: "Canva", image: "/canva.png" },
  { name: "Packet Tracer", image: "/packettracer.png" },
  { name: "LaTeX", image: "/latexcode.png" },
  { name: "Kimik2", image: "/kimik2.png" },
];

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
  tool: { name: string; image: string };
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
      className="absolute top-1/2 left-1/2"
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
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Icon Circle */}
          <div className={`
             relative flex items-center justify-center rounded-full
             ${radius < 100 ? "w-8 h-8 sm:w-10 sm:h-10" : "w-10 h-10 sm:w-12 sm:h-12"}
          `}>
            <img
              src={tool.image}
              alt={tool.name}
              className={`object-contain
                ${radius < 100 ? "w-6 h-6 sm:w-8 sm:h-8" : "w-8 h-8 sm:w-10 sm:h-10"}
              `}
            />
          </div>

          {/* Tooltip */}
          <div className={`
            absolute left-1/2 -translate-x-1/2 top-full mt-2
            px-2 py-1 bg-navy-950/90 border border-blue-500/20 rounded
            text-[10px] sm:text-xs text-blue-100 whitespace-nowrap pointer-events-none
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
      return (base * 3) + (scroll * 360);
    }
  );

  // Middle Ring: Medium passive (Counter-Rotating) + Scroll (Counter)
  const middleRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => {
      // Base speed: -0.8x
      // Scroll influence: 30 -> -330 (Counter rotation)
      return (base * -2) + (30 + scroll * -360);
    }
  );

  // Outer Ring: Slow passive + Scroll
  const outerRotate = useTransform(
    [baseRotation, smoothProgress],
    ([base, scroll]) => {
      // Base speed: 0.5x
      // Scroll influence: 0 -> 180 (Slower scroll rotation)
      return (base * 1) + (scroll * 180);
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6 text-center">
              Tools & Technologies
            </h2>
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/70" />
            </div>
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

          {/* Base Rings (Always visible, faint) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute rounded-full border border-blue-500/10 w-[160px] h-[160px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px]" />
            <div className="absolute rounded-full border border-blue-500/10 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px]" />
            <div className="absolute rounded-full border border-blue-500/10 w-[400px] h-[400px] sm:w-[580px] sm:h-[580px] md:w-[720px] md:h-[720px]" />
          </div>

          {/* Highlight Rings (Visible only under flashlight) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{
              maskImage: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
              WebkitMaskImage: useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
            }}
          >
            <div className="absolute rounded-full border border-blue-400/60 w-[160px] h-[160px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px]" />
            <div className="absolute rounded-full border border-blue-400/60 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px]" />
            <div className="absolute rounded-full border border-blue-400/60 w-[400px] h-[400px] sm:w-[580px] sm:h-[580px] md:w-[720px] md:h-[720px]" />
          </motion.div>


          {/* --- PLANETS --- */}

          <div className="absolute inset-0 scale-[0.45] sm:scale-[0.7] md:scale-100 origin-center pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto">
              {/* Inner Ring - Base Radius 160 */}
              {innerRingTools.map((tool, i) => (
                <PlanetNode
                  key={tool.name}
                  tool={tool}
                  radius={160}
                  baseAngle={(360 / innerRingTools.length) * i}
                  rotationValue={innerRotate}
                />
              ))}

              {/* Middle Ring - Base Radius 260 */}
              {middleRingTools.map((tool, i) => (
                <PlanetNode
                  key={tool.name}
                  tool={tool}
                  radius={260}
                  baseAngle={(360 / middleRingTools.length) * i}
                  rotationValue={middleRotate}
                />
              ))}

              {/* Outer Ring - Base Radius 360 */}
              {outerRingTools.map((tool, i) => (
                <PlanetNode
                  key={tool.name}
                  tool={tool}
                  radius={360}
                  baseAngle={(360 / outerRingTools.length) * i}
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
