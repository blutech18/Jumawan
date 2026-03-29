"use client";

import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowDown, Download, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useHeroSettingsStore } from "@/stores/useHeroSettingsStore";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [displayedName, setDisplayedName] = useState("");
  const fullName = "Cristan Jade Jumawan";
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic hero settings
  const { badges, resumeUrl, profileImageUrl, hoverLogoUrl, fetchSettings, loading } = useHeroSettingsStore();

  // Detect mobile/tablet for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Only disable for very small mobile devices
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dynamicPhrases = [
    "Crafting exceptional digital experiences that drive business growth and user engagement.",
    "Building scalable, high-performance applications with clean architecture and modern practices.",
    "Transforming complex ideas into elegant, intuitive solutions that users love.",
    "Delivering end-to-end digital products from concept to deployment with precision.",
    "Passionate about creating seamless experiences across web and mobile platforms.",
  ];
  const { toast } = useToast();
  const { scrollToSection } = useSmoothScroll();

  // Parallax effect
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll-based parallax transforms — lighter on mobile for smooth feel
  const backgroundY = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "5%"] : ["0%", "25%"]);
  const avatarY = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "8%"] : ["0%", "35%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "4%"] : ["0%", "18%"]);
  const avatarScale = useTransform(scrollYProgress, [0, 0.6], isMobile ? [1, 0.97] : [1, 0.88]);
  const floatingElementsY = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "10%"] : ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.3, 0]);
  const nameX = useTransform(scrollYProgress, [0, 0.5], isMobile ? ["0%", "0%"] : ["0%", "-3%"]);
  const fadeGradientOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, 0.8, 1]);

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

  // Fetch hero settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Dismiss avatar logo on outside tap (mobile)
  useEffect(() => {
    if (!isMobile || !isAvatarHovered) return;
    const handleOutsideTap = (e: TouchEvent | MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setIsAvatarHovered(false);
      }
    };
    document.addEventListener('touchstart', handleOutsideTap);
    return () => document.removeEventListener('touchstart', handleOutsideTap);
  }, [isMobile, isAvatarHovered]);

  // Delay heavy animations until after initial render
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleAnimations = () => {
      // Longer delay on mobile for better initial load
      const delay = isMobile ? 800 : 500;
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setAnimationsReady(true), { timeout: delay + 500 });
      } else {
        setTimeout(() => setAnimationsReady(true), delay);
      }
    };

    scheduleAnimations();
  }, [isMobile]);

  const scrollToProjects = () => {
    scrollToSection("projects");
  };

  const scrollToContact = () => {
    scrollToSection("contact");
  };

  const handleDownloadCV = async () => {
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
      // Derive extension from Content-Type after fetching, not from the URL
      const filename = `Jumawan-Resume`; // extension appended after we know the type

      // Proxy through Convex HTTP action to bypass CORS and force download
      const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;
      const proxyUrl = `${convexSiteUrl}/downloadFile?url=${encodeURIComponent(resumeUrl)}&filename=${encodeURIComponent(filename)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Server responded ${response.status}`);

      const blob = await response.blob();

      // Derive extension from actual Content-Type
      const contentType = blob.type || response.headers.get('content-type') || '';
      const mimeToExt: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      const ext = mimeToExt[contentType.split(';')[0].trim()] || 'pdf';
      const finalFilename = `${filename}.${ext}`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the resume. Please try again.",
        variant: "destructive",
      });
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
      transition: { staggerChildren: 0.18, delayChildren: 0.3 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 1.05, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1, scale: 1,
      transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <section
      ref={sectionRef}
      id="home"
      className="min-h-[100svh] flex flex-col relative overflow-hidden bg-[var(--surface-bg)]"
    >
      {/* Background with Mesh Gradient */}
      <motion.div
        className="absolute inset-0 bg-[var(--surface-bg)]"
        style={{ y: backgroundY, willChange: 'transform' }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-20" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(at 15% 25%, hsl(202 85% 55% / 0.15) 0%, transparent 55%),
              radial-gradient(at 85% 15%, hsl(197 100% 70% / 0.1) 0%, transparent 55%),
              radial-gradient(at 50% 60%, hsl(227 85% 18% / 0.2) 0%, transparent 50%)
            `
          }}
        />
        {/* Fade-out mask so highlights don't create a hard edge at section bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, var(--surface-bg) 100%)',
          }}
        />
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(to bottom, white 0%, white 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, white 0%, white 70%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* Floating Background Elements with Parallax */}
      {animationsReady && (
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ y: floatingElementsY, willChange: 'transform' }}
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : {
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ 
            background: 'hsl(197 100% 70%)',
            filter: 'blur(150px)',
            willChange: 'transform'
          }}
        />
      </motion.div>
      )}

      {/* Main Content - 2 Column Layout */}
      <motion.div
        className="flex-1 flex flex-col justify-center relative z-10 px-5 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8"
        style={{ opacity: heroOpacity, willChange: 'opacity' }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center min-h-[65vh]">

            {/* Left Column - Text & Buttons */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left order-2 lg:order-1"
              style={{ y: contentY, willChange: 'transform' }}
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
                {badges.map((role) => (
                  <span
                    key={role}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium text-muted-foreground/90 bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all duration-300 cursor-default"
                  >
                    {role}
                  </span>
                ))}
              </motion.div>

              {/* Description - Dynamic rotating phrases */}
              <motion.div
                variants={fadeUp}
                className="text-[15px] sm:text-base text-muted-foreground/70 mb-9 sm:mb-10 leading-[1.7] max-w-lg mx-auto lg:mx-0 min-h-[5.1em] sm:min-h-[3.4em]"
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

              {/* CTA Buttons - Inline on mobile, styled on desktop */}
              <motion.div
                variants={fadeUp}
                className="flex flex-row flex-wrap gap-4 sm:gap-6 items-center justify-center lg:justify-start"
              >
                <Button
                  onClick={scrollToProjects}
                  variant="ghost"
                  size="sm"
                  className="group relative bg-transparent hover:bg-transparent text-muted-foreground/70 hover:text-primary !h-auto px-0 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 transition-transform group-hover:rotate-[-8deg]" />
                  <span>Projects</span>
                </Button>

                <Button
                  onClick={scrollToContact}
                  variant="ghost"
                  size="sm"
                  className="group relative bg-transparent hover:bg-transparent text-muted-foreground/70 hover:text-primary !h-auto px-0 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300"
                >
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 transition-transform group-hover:scale-110" />
                  <span>Contact</span>
                </Button>

                {resumeUrl && (
                  <Button
                    onClick={handleDownloadCV}
                    disabled={isDownloading}
                    variant="ghost"
                    size="sm"
                    className="group relative bg-transparent hover:bg-transparent text-muted-foreground/70 hover:text-primary !h-auto px-0 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-50"
                    title="Download Resume"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 transition-transform group-hover:scale-110" />
                    <span>Resume</span>
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* Right Column - Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ scale: avatarScale, y: avatarY, willChange: 'transform' }}
              className="relative flex justify-center lg:justify-end order-1 lg:order-2"
            >
              {/* Float animation wraps everything */}
              <motion.div
                animate={shouldReduceMotion || !animationsReady ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[250px] h-[250px] sm:w-[288px] sm:h-[288px] md:w-[336px] md:h-[336px] lg:w-[384px] lg:h-[384px]"
              >
                {/* Ambient glow - breathing */}
                <motion.div
                  animate={shouldReduceMotion || !animationsReady ? undefined : {
                    opacity: [0.6, 0.8, 0.6],
                    scale: [1.1, 1.25, 1.1],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, var(--avatar-glow-1), var(--avatar-glow-2), var(--avatar-glow-3), transparent 70%)',
                    filter: 'blur(60px)',
                    mixBlendMode: 'screen',
                    willChange: animationsReady ? 'opacity, transform' : 'auto'
                  }}
                />

                {/* SVG Loading Rings & Effects */}
                {animationsReady && (
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
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
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
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
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
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Tick marks - reduced to 24 ticks for better performance */}
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * 15 * Math.PI) / 180;
                    const r1 = 176;
                    const isMajor = i % 3 === 0;
                    const r2 = isMajor ? 171 : 173.5;
                    return (
                      <line
                        key={`tick-${i}`}
                        x1={200 + Math.cos(angle) * r1}
                        y1={200 + Math.sin(angle) * r1}
                        x2={200 + Math.cos(angle) * r2}
                        y2={200 + Math.sin(angle) * r2}
                        stroke={isMajor ? 'hsl(197 100% 70%)' : 'hsl(202 85% 55%)'}
                        strokeWidth={isMajor ? '1.2' : '0.4'}
                        strokeLinecap="round"
                        opacity={isMajor ? 0.3 : 0.1}
                      />
                    );
                  })}

                  {/* Inner data ring - dotted */}
                  <circle
                    cx="200" cy="200" r="167"
                    fill="none"
                    stroke="hsl(220 80% 60%)"
                    strokeWidth="0.5"
                    strokeDasharray="2 8"
                    opacity="0.15"
                  />

                </svg>
                )}

                {/* Orbiting dots - reduced to 2 for better performance */}
                {animationsReady && [
                  { delay: 0, dur: 6, size: 6, color: 'var(--avatar-dot-1)', glow: 'var(--avatar-dot-1-glow)' },
                  { delay: 3, dur: 6, size: 5, color: 'var(--avatar-dot-2)', glow: 'var(--avatar-dot-2-glow)' },
                ].map((dot, i) => (
                  <div
                    key={`orbit-dot-${i}`}
                    className="absolute -inset-6 sm:-inset-8 md:-inset-10"
                    style={{ 
                      transformOrigin: 'center center',
                      animation: shouldReduceMotion ? 'none' : `spin-orbit ${dot.dur}s linear infinite`,
                      animationDelay: `${dot.delay}s`
                    }}
                  >
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: `${dot.size}px`,
                        height: `${dot.size}px`,
                        top: '0px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: dot.color,
                        boxShadow: `0 0 10px 3px ${dot.glow}`,
                      }}
                    />
                  </div>
                ))}

                {/* Pulse rings - reduced to 2 for better performance */}
                {animationsReady && [0, 1].map((i) => (
                  <motion.div
                    key={`pulse-${i}`}
                    animate={shouldReduceMotion ? undefined : {
                      scale: [1, 1.15],
                      opacity: [0.15, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1.5,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-full border pointer-events-none"
                    style={{
                      borderColor: ['var(--avatar-pulse-1)', 'var(--avatar-pulse-2)'][i],
                      willChange: 'transform, opacity'
                    }}
                  />
                ))}

                {/* Primary comet-trail spinning border */}
                {animationsReady && (
                <motion.div
                  animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    padding: '3px',
                    background: 'var(--avatar-comet)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    willChange: 'transform'
                  }}
                />
                )}

                {/* Counter-rotating accent border */}
                {animationsReady && (
                <motion.div
                  animate={shouldReduceMotion ? undefined : { rotate: [360, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    padding: '3px',
                    background: 'var(--avatar-comet-accent)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    willChange: 'transform'
                  }}
                />
                )}

                {/* Photo - seamless against border */}
                <div
                  ref={avatarRef}
                  className="absolute inset-[3px] rounded-full overflow-hidden cursor-pointer"
                  onMouseEnter={() => { if (!isMobile) setIsAvatarHovered(true); }}
                  onMouseLeave={() => { if (!isMobile) setIsAvatarHovered(false); }}
                  onClick={() => { if (isMobile && hoverLogoUrl) setIsAvatarHovered(prev => !prev); }}
                >
                  {loading ? (
                    <Skeleton className="w-full h-full rounded-full bg-primary/10" />
                  ) : imageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-full">
                      <div className="text-4xl font-bold text-primary/60">CJ</div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {/* Profile image */}
                      <motion.img
                        src={profileImageUrl}
                        alt="Cristan Jade Jumawan - Full Stack Developer"
                        className="absolute inset-0 w-full h-full object-cover rounded-full"
                        loading="eager"
                        animate={{
                          opacity: isAvatarHovered && hoverLogoUrl ? 0 : 1,
                          scale: isAvatarHovered && hoverLogoUrl ? 0.9 : 1,
                        }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        onError={() => setImageError(true)}
                        style={{ willChange: 'transform, opacity' }}
                      />
                      {/* Hover logo (BluTech) */}
                      {hoverLogoUrl && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--surface-bg)]/80 backdrop-blur-sm"
                          animate={{
                            opacity: isAvatarHovered ? 1 : 0,
                            scale: isAvatarHovered ? 1 : 1.1,
                          }}
                          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                          style={{ willChange: 'transform, opacity' }}
                        >
                          <motion.img
                            src={hoverLogoUrl}
                            alt="BluTech Logo"
                            className="w-[65%] h-[65%] object-contain drop-shadow-[0_0_20px_hsl(202,85%,55%,0.4)]"
                            animate={{
                              scale: isAvatarHovered ? 1 : 0.7,
                              rotate: isAvatarHovered ? 0 : -10,
                            }}
                            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                            style={{ willChange: 'transform' }}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Breathing outer glow */}
                {animationsReady && (
                <motion.div
                  animate={shouldReduceMotion ? undefined : {
                    boxShadow: [
                      'var(--avatar-shadow-1)',
                      'var(--avatar-shadow-2)',
                      'var(--avatar-shadow-1)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ willChange: 'box-shadow' }}
                />
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator - Refined */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center mt-12 sm:mt-16 lg:mt-20 gap-2"
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/30 font-medium">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer w-6 h-10 rounded-full border border-border/20 flex items-start justify-center pt-2 hover:border-primary/20 transition-colors"
              onClick={() => scrollToSection("about")}
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
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-72 sm:h-80 md:h-72 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, var(--surface-bg) 80%)',
          opacity: fadeGradientOpacity,
          willChange: 'opacity'
        }}
      />
    </section>
    </>
  );
}
