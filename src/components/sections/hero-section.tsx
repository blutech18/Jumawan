"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [displayedName, setDisplayedName] = useState("");
  const fullName = "Cristan Jade Jumawan";
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Use a rAF-driven loop for smoother typing animation and fewer timers
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
            // Pause briefly at full name then start deleting
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

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  // Download CV handler
  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/Jumawan-Resume-UPDATED.png';
    link.download = 'Jumawan-Resume-UPDATED.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="home"
      className="min-h-[100svh] flex items-center justify-center relative overflow-hidden bg-gradient-hero"
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={shouldReduceMotion ? undefined : {
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-glow rounded-full opacity-20"
        />
        <motion.div
          animate={shouldReduceMotion ? undefined : {
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: shouldReduceMotion ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-glow rounded-full opacity-15"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* 2-Column Layout for Desktop, Stacked for Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
            
            {/* Left Column - Content */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center lg:text-left order-2 lg:order-1 will-change-transform"
            >
              {/* Name and Title */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mb-6"
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                    {displayedName}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-primary"
                    >
                      |
                    </motion.span>
                  </span>
                </h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-xl md:text-2xl text-muted-foreground font-medium"
                >
                  BSIT Student | Freelance Full Stack Developer
                </motion.p>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-lg text-muted-foreground mb-8 leading-relaxed lg:max-w-lg"
              >
                Passionate about creating exceptional digital experiences with modern web and mobile technologies. 
                Specialized in Laravel, React, Next.js, React Native, and full-stack development.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col gap-6 justify-center lg:justify-start items-center mb-12 w-full lg:max-w-lg mx-auto lg:mx-0"
              >
                <div className="flex flex-col sm:flex-row gap-6 w-full justify-center lg:justify-start items-center">
                  <Button
                    onClick={scrollToProjects}
                    size="lg"
                    className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-glow hover:shadow-xl transition-all duration-300"
                  >
                    View My Projects
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </Button>

                  <Button
                    onClick={scrollToContact}
                    variant="outline"
                    size="lg"
                    className="group border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-white px-8 py-3 text-lg font-semibold"
                  >
                    Contact Me
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full items-center justify-center lg:justify-start">
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Available for Opportunities
                  </div>
                  <Button
                    onClick={handleDownloadCV}
                    variant="ghost"
                    size="sm"
                    className="px-0 text-sm font-normal hover:bg-transparent hover:underline hover:text-primary hover:shadow-none focus-visible:ring-0 transition-colors"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download CV
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Profile Photo */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative flex justify-center lg:justify-end order-1 lg:order-2"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: shouldReduceMotion ? 0 : [0, -20, 0] // Floating animation
                }}
                transition={{ 
                  scale: {
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.6 
                  },
                  opacity: {
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.6 
                  },
                  y: {
                    duration: 4,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="relative inline-block"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 30px hsl(var(--sky-400) / 0.3)",
                        "0 0 60px hsl(var(--sky-400) / 0.6)",
                        "0 0 30px hsl(var(--sky-400) / 0.3)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-transparent bg-gradient-border p-1"
                  >
                    <motion.img
                      src="/me.jpg"
                      alt="Cristan Jade Jumawan - Full Stack Developer"
                      className="w-full h-full object-cover rounded-full bg-card will-change-transform"
                      loading="lazy"
                      decoding="async"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  </motion.div>
                  
                  {/* Floating particles around photo */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-primary rounded-full hidden lg:block"
                      style={{
                        top: `${30 + Math.cos((i * Math.PI) / 4) * 160}px`,
                        left: `${160 + Math.sin((i * Math.PI) / 4) * 160}px`,
                      }}
                      animate={shouldReduceMotion ? undefined : {
                        scale: [0.5, 1, 0.5],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: shouldReduceMotion ? 0 : Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator - Centered Below */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="flex flex-col items-center mt-16"
          >
            <p className="text-sm text-muted-foreground mb-4">Discover more</p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="cursor-pointer"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ArrowDown className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}