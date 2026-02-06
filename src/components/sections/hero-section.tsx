"use client";

import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Download, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [displayedName, setDisplayedName] = useState("");
  const fullName = "Cristan Jade Jumawan";
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const dynamicPhrases = [
    "Crafting exceptional digital experiences that drive business growth and user engagement.",
    "Building scalable, high-performance applications with clean architecture and modern practices.",
    "Transforming complex ideas into elegant, intuitive solutions that users love.",
    "Delivering end-to-end digital products from concept to deployment with precision.",
    "Passionate about creating seamless experiences across web and mobile platforms.",
  ];
  const { toast } = useToast();

  // Parallax effect
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Scroll-based parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const avatarScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const avatarY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const floatingElementsY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const nameX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-5%"]);
  const buttonsY = useTransform(scrollYProgress, [0, 0.6], ["0%", "30%"]);
  const buttonsOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    let frameId: number | null = null;
    let lastTime = 0;
    const typingIntervalMs = isDeleting ? 80 : 120;
    let pauseTimeout: number | null = null;

    const tick = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const elapsed = time - lastTime;
      if (elapsed >= typingIntervalMs) {
        lastTime = time;
        if (!isDeleting) {
          if (currentIndex < fullName.length) {
            setDisplayedName(fullName.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else {
            if (!pauseTimeout) {
              pauseTimeout = window.setTimeout(() => setIsDeleting(true), 1200);
            }
          }
        } else {
          if (currentIndex > 0) {
            setDisplayedName(fullName.slice(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            setIsDeleting(false);
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (pauseTimeout) window.clearTimeout(pauseTimeout);
    };
  }, [currentIndex, isDeleting, fullName]);

  // Rotate dynamic phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % dynamicPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dynamicPhrases.length]);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadCV = () => {
    if (isDownloading) {
      toast({
        title: "Download already in progress",
        description: "Your CV download has already started. Please check your browser's downloads.",
      });
      return;
    }

    setIsDownloading(true);

    const currentToast = toast({
      title: "Downloading CV",
      description: "Resume download has started.",
    });

    try {
      const link = document.createElement("a");
      link.href = "/Jumawan-Resume-UPDATED.png";
      link.download = "Jumawan-Resume";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => {
        currentToast.dismiss();
        setIsDownloading(false);
      }, 2500);
    }
  };

  // Stagger animation config
  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="min-h-[100svh] flex flex-col relative overflow-hidden"
    >
      {/* Background with Mesh Gradient */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(at 15% 25%, hsl(202 85% 55% / 0.12) 0%, transparent 55%),
              radial-gradient(at 85% 15%, hsl(197 100% 70% / 0.08) 0%, transparent 55%),
              radial-gradient(at 50% 85%, hsl(227 85% 18% / 0.25) 0%, transparent 55%)
            `
          }}
        />
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </motion.div>

      {/* Floating Background Elements with Parallax */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ y: floatingElementsY }}
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : {
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: 'hsl(202 85% 55%)' }}
        />
        <motion.div
          animate={shouldReduceMotion ? undefined : {
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: 'hsl(197 100% 70%)' }}
        />
      </motion.div>

      {/* Main Content - 2 Column Layout */}
      <motion.div
        className="flex-1 flex flex-col justify-center relative z-10 px-5 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8"
        style={{ opacity: heroOpacity }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center min-h-[65vh]">

            {/* Left Column - Text & Buttons */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left order-2 lg:order-1 will-change-transform"
              style={{ y: contentY }}
            >
              {/* Typing Name */}
              <motion.div variants={fadeUp} style={{ x: nameX }}>
                <h1 className="text-[clamp(1.5rem,5vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight whitespace-nowrap">
                  <span className="bg-gradient-to-r from-[hsl(197,100%,85%)] via-[hsl(202,85%,70%)] to-[hsl(197,100%,60%)] bg-clip-text text-transparent">
                    {displayedName}
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-primary ml-0.5"
                  >
                    |
                  </motion.span>
                </h1>
              </motion.div>

              {/* Role Tags - Refined pill design */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2 sm:gap-2.5 justify-center lg:justify-start mt-5 sm:mt-6 mb-6 sm:mb-7">
                {["BSIT Student", "Full Stack Developer", "Freelancer"].map((role) => (
                  <span 
                    key={role}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium text-muted-foreground/90 bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default"
                  >
                    {role}
                  </span>
                ))}
              </motion.div>

              {/* Description - Dynamic rotating phrases */}
              <motion.div
                variants={fadeUp}
                className="text-[15px] sm:text-base text-muted-foreground/70 mb-9 sm:mb-10 leading-[1.7] max-w-lg mx-auto lg:mx-0 min-h-[3.4em]"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentPhraseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {dynamicPhrases[currentPhraseIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>

              {/* CTA Buttons - Enhanced sophisticated design */}
              <motion.div 
                variants={fadeUp} 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full sm:w-auto"
                style={{ y: buttonsY, opacity: buttonsOpacity }}
              >
                <Button
                  onClick={scrollToProjects}
                  size="lg"
                  className="group relative bg-white/[0.02] hover:bg-white/[0.06] text-foreground hover:text-white border border-white/[0.08] hover:border-primary/40 !h-12 sm:!h-[52px] px-8 sm:px-10 text-sm font-semibold tracking-wide backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 rounded-xl w-full sm:w-auto overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <ExternalLink className="h-4 w-4 mr-2.5 transition-transform group-hover:rotate-[-8deg] relative z-10" />
                  <span className="relative z-10">View My Projects</span>
                </Button>

                <Button
                  onClick={scrollToContact}
                  variant="outline"
                  size="lg"
                  className="group relative bg-white/[0.02] hover:bg-white/[0.06] text-foreground hover:text-white border border-white/[0.08] hover:border-primary/40 !h-12 sm:!h-[52px] px-8 sm:px-10 text-sm font-semibold tracking-wide backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 rounded-xl w-full sm:w-auto overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Mail className="h-4 w-4 mr-2.5 transition-transform group-hover:scale-110 relative z-10" />
                  <span className="relative z-10">Contact Me</span>
                </Button>

                {/* Download Resume - Icon only */}
                <button
                  onClick={handleDownloadCV}
                  disabled={isDownloading}
                  className="group flex items-center justify-center w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-primary/40 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 disabled:opacity-50"
                  title="Download Resume"
                >
                  <Download className="h-[18px] w-[18px] text-foreground group-hover:text-white transition-colors duration-300" />
                </button>
              </motion.div>
            </motion.div>

            {/* Right Column - Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ scale: avatarScale, y: avatarY }}
              className="relative flex justify-center lg:justify-end order-1 lg:order-2"
            >
              {/* Float animation wraps everything */}
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[250px] h-[250px] sm:w-[288px] sm:h-[288px] md:w-[336px] md:h-[336px] lg:w-[384px] lg:h-[384px]"
              >
                {/* Ambient glow - breathing */}
                <motion.div
                  animate={shouldReduceMotion ? undefined : {
                    opacity: [0.1, 0.25, 0.1],
                    scale: [1.2, 1.4, 1.2],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, hsl(202 85% 55% / 0.5), hsl(260 70% 60% / 0.2), hsl(197 100% 70% / 0.3), transparent 70%)' }}
                />

                {/* SVG Loading Rings & Effects */}
                <svg className="absolute -inset-6 sm:-inset-8 md:-inset-10 w-[calc(100%+48px)] h-[calc(100%+48px)] sm:w-[calc(100%+64px)] sm:h-[calc(100%+64px)] md:w-[calc(100%+80px)] md:h-[calc(100%+80px)]" viewBox="0 0 400 400">
                  <defs>
                    <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(202 85% 55%)" stopOpacity="0" />
                      <stop offset="40%" stopColor="hsl(202 85% 55%)" stopOpacity="1" />
                      <stop offset="100%" stopColor="hsl(197 100% 70%)" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="arcGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(260 70% 60%)" stopOpacity="0" />
                      <stop offset="50%" stopColor="hsl(260 70% 60%)" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="hsl(220 80% 60%)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="arcGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(197 100% 70%)" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="hsl(202 85% 55%)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Outermost faint ring */}
                  <circle cx="200" cy="200" r="198" fill="none" stroke="hsl(202 85% 55%)" strokeWidth="0.3" opacity="0.06" />

                  {/* Outer loading arc 1 */}
                  <motion.circle
                    cx="200" cy="200" r="195"
                    fill="none"
                    stroke="url(#arcGrad1)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="320 900"
                    animate={shouldReduceMotion ? undefined : {
                      strokeDashoffset: [0, -1220],
                      opacity: [0.9, 0.4, 0.9],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Outer loading arc 2 - counter */}
                  <motion.circle
                    cx="200" cy="200" r="191"
                    fill="none"
                    stroke="url(#arcGrad2)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="150 1050"
                    animate={shouldReduceMotion ? undefined : {
                      strokeDashoffset: [1200, 0],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Third arc - fast short segment */}
                  <motion.circle
                    cx="200" cy="200" r="187"
                    fill="none"
                    stroke="hsl(197 100% 70%)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray="60 1120"
                    animate={shouldReduceMotion ? undefined : {
                      strokeDashoffset: [0, -1180],
                      opacity: [0.6, 0.2, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Segmented progress ring */}
                  <motion.circle
                    cx="200" cy="200" r="182"
                    fill="none"
                    stroke="url(#arcGrad3)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray="40 25 80 25 20 25"
                    animate={shouldReduceMotion ? undefined : {
                      strokeDashoffset: [0, -215],
                      opacity: [0.5, 0.25, 0.5],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Tick marks - 48 ticks */}
                  {[...Array(48)].map((_, i) => {
                    const angle = (i * 7.5 * Math.PI) / 180;
                    const r1 = 176;
                    const isMajor = i % 4 === 0;
                    const r2 = isMajor ? 171 : 173.5;
                    return (
                      <motion.line
                        key={`tick-${i}`}
                        x1={200 + Math.cos(angle) * r1}
                        y1={200 + Math.sin(angle) * r1}
                        x2={200 + Math.cos(angle) * r2}
                        y2={200 + Math.sin(angle) * r2}
                        stroke={isMajor ? 'hsl(197 100% 70%)' : 'hsl(202 85% 55%)'}
                        strokeWidth={isMajor ? '1.2' : '0.4'}
                        strokeLinecap="round"
                        animate={shouldReduceMotion ? undefined : {
                          opacity: [0.06, isMajor ? 0.4 : 0.15, 0.06],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.06,
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}

                  {/* Inner data ring - dotted */}
                  <motion.circle
                    cx="200" cy="200" r="167"
                    fill="none"
                    stroke="hsl(220 80% 60%)"
                    strokeWidth="0.5"
                    strokeDasharray="2 8"
                    animate={shouldReduceMotion ? undefined : {
                      strokeDashoffset: [0, 50],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    opacity="0.2"
                  />

                </svg>

                {/* Orbiting dots - 3 at different speeds */}
                {[
                  { start: 0, dur: 5, size: 7, color: 'hsl(197 100% 70%)', glow: 'hsl(197 100% 70% / 0.6)' },
                  { start: 120, dur: 8, size: 5, color: 'hsl(220 80% 65%)', glow: 'hsl(220 80% 65% / 0.5)' },
                  { start: 240, dur: 11, size: 4, color: 'hsl(260 70% 60%)', glow: 'hsl(260 70% 60% / 0.5)' },
                ].map((dot, i) => (
                  <motion.div
                    key={`orbit-dot-${i}`}
                    animate={shouldReduceMotion ? undefined : { rotate: [dot.start, dot.start + 360] }}
                    transition={{ duration: dot.dur, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-6 sm:-inset-8 md:-inset-10"
                    style={{ transformOrigin: 'center center' }}
                  >
                    <motion.div
                      animate={shouldReduceMotion ? undefined : {
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute rounded-full"
                      style={{
                        width: `${dot.size}px`,
                        height: `${dot.size}px`,
                        top: '0px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: dot.color,
                        boxShadow: `0 0 12px 4px ${dot.glow}, 0 0 24px 8px ${dot.glow.replace('0.6', '0.2').replace('0.5', '0.15')}`,
                      }}
                    />
                  </motion.div>
                ))}

                {/* Pulse rings that expand outward */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={`pulse-${i}`}
                    animate={shouldReduceMotion ? undefined : {
                      scale: [1, 1.2],
                      opacity: [0.18, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.7,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-full border pointer-events-none"
                    style={{
                      borderColor: ['hsl(202 85% 55% / 0.3)', 'hsl(197 100% 70% / 0.2)', 'hsl(260 70% 60% / 0.15)', 'hsl(220 80% 60% / 0.1)'][i],
                    }}
                  />
                ))}

                {/* Primary comet-trail spinning border */}
                <motion.div
                  animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    padding: '3px',
                    background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, hsl(260 70% 60% / 0.08) 30%, hsl(202 85% 55% / 0.15) 45%, hsl(197 100% 70% / 0.5) 60%, hsl(202 85% 55%) 75%, hsl(197 100% 70%) 88%, hsl(260 70% 60% / 0.6) 95%, transparent 100%)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />

                {/* Counter-rotating accent border */}
                <motion.div
                  animate={shouldReduceMotion ? undefined : { rotate: [360, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    padding: '3px',
                    background: 'conic-gradient(from 180deg, transparent 0%, transparent 70%, hsl(260 70% 60% / 0.2) 80%, hsl(220 80% 60% / 0.35) 90%, transparent 100%)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />

                {/* Photo - seamless against border */}
                <div className="absolute inset-[3px] rounded-full overflow-hidden">
                  <motion.img
                    src="/me.jpg"
                    alt="Cristan Jade Jumawan - Full Stack Developer"
                    className="w-full h-full object-cover rounded-full will-change-transform"
                    loading="eager"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>

                {/* Breathing outer glow */}
                <motion.div
                  animate={shouldReduceMotion ? undefined : {
                    boxShadow: [
                      '0 0 20px 2px hsl(202 85% 55% / 0.08), 0 0 50px 6px hsl(202 85% 55% / 0.04)',
                      '0 0 40px 8px hsl(197 100% 70% / 0.2), 0 0 80px 14px hsl(260 70% 60% / 0.06)',
                      '0 0 20px 2px hsl(202 85% 55% / 0.08), 0 0 50px 6px hsl(202 85% 55% / 0.04)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator - Refined */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center mt-6 sm:mt-10 lg:mt-12 gap-2"
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/30 font-medium">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer w-6 h-10 rounded-full border border-white/[0.08] flex items-start justify-center pt-2 hover:border-primary/20 transition-colors"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-2 rounded-full bg-primary/50"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade gradient for smooth transition to about section */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #030014 100%)'
        }}
      />
    </section>
  );
}
