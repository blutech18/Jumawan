"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";

// Tools and Technologies data - optimized with lazy loading
const toolsAndTechnologies = [
  { name: "Visual Studio Code", image: "/vscode.png", category: "IDE" },
  { name: "Cursor", image: "/cursor.png", category: "AI IDE" },
  { name: "Android Studio", image: "/androidstudio.png", category: "Mobile IDE" },
  { name: "Visual Studio", image: "/visualstudio.png", category: "IDE" },
  { name: "NetBeans", image: "/netbeans.png", category: "IDE" },
  { name: "XAMPP", image: "/xampp.png", category: "Development Environment" },
  { name: "GitHub", image: "/github.png", category: "Version Control" },
  { name: "GitLab", image: "/gitlab.png", category: "Version Control" },
  { name: "Firebase", image: "/firebase.png", category: "Backend Service" },
  { name: "Supabase", image: "/supabase.png", category: "Backend Service" },
  { name: "Vercel", image: "/vercel.png", category: "Deployment" },
  { name: "Netlify", image: "/netlify.png", category: "Deployment" },
  { name: "Railway", image: "/railway.png", category: "Deployment" },
  { name: "ChatGPT", image: "/chatgpt.png", category: "AI Assistant" },
  { name: "Claude", image: "/claude.png", category: "AI Assistant" },
  { name: "Gemini", image: "/gemini.png", category: "AI Assistant" },
  { name: "DeepSeek", image: "/deepseek.png", category: "AI Assistant" },
  { name: "Windsurf", image: "/windsurf.png", category: "AI IDE" },
  { name: "AugmentCode", image: "/augmentcode.png", category: "AI Tool" },
  { name: "Canva", image: "/canva.png", category: "Design Tool" },
  { name: "LaTeX Code", image: "/latexcode.png", category: "Documentation" },
  { name: "Packet Tracer", image: "/packettracer.png", category: "Network Simulation" },
  { name: "Kimik2", image: "/kimik2.png", category: "Chemistry Tool" },
];

export function ToolsCarousel() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = React.useState<number | null>(null);
  const scrollPositionRef = useRef(0);
  const animationIdRef = useRef<number>();
  const isScrollingRef = useRef(true);

  // Memoize the infinite tools array to prevent unnecessary re-renders
  const infiniteTools = useMemo(() => [
    ...toolsAndTechnologies, 
    ...toolsAndTechnologies, 
    ...toolsAndTechnologies
  ], []);

  // Optimized scroll effect with throttling
  const scroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const scrollContainer = scrollRef.current;
    const scrollSpeed = 1.2;
    const maxScroll = scrollContainer.scrollWidth / 3;

    if (isScrollingRef.current) {
      scrollPositionRef.current += scrollSpeed;
      if (scrollPositionRef.current >= maxScroll) {
        scrollPositionRef.current = 0;
      }
      scrollContainer.scrollLeft = scrollPositionRef.current;
    }
    
    animationIdRef.current = requestAnimationFrame(scroll);
  }, []);

  // Auto-scroll effect with optimized performance
  useEffect(() => {
    if (!scrollRef.current || !inView) return;

    animationIdRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [inView, scroll]);

  // Optimized hover handlers with useCallback
  const handleCardMouseEnter = useCallback((index: number) => {
    setHoveredCardIndex(index);
    isScrollingRef.current = false;
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setHoveredCardIndex(null);
    isScrollingRef.current = true;
  }, []);

  // Memoized animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }), []);

  return (
    <section ref={ref} className="py-20 bg-navy-800/20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 leading-tight pb-2"
          >
            Tools & Technologies
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            The modern development stack and AI-powered tools I use to bring ideas to life
          </motion.p>
        </motion.div>

        {/* Infinite Scrolling Carousel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="relative"
        >
          <div 
            ref={scrollRef}
            className="flex overflow-x-hidden gap-4 py-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {infiniteTools.map((tool, index) => (
              <motion.div
                key={`${tool.name}-${index}`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
                className="flex-shrink-0 w-36 sm:w-44 md:w-48"
                onMouseEnter={() => handleCardMouseEnter(index)}
                onMouseLeave={handleCardMouseLeave}
              >
                <Card className={`group relative h-32 bg-gradient-card border-border/20 transition-all duration-300 overflow-hidden ${
                  hoveredCardIndex === index ? 'border-primary/50 shadow-lg' : 'hover:border-primary/30'
                }`}>
                  {/* Hover Effect Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                    hoveredCardIndex === index ? 'opacity-15' : 'opacity-0 group-hover:opacity-10'
                  }`}
                       style={{ backgroundImage: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))` }} />
                  
                  <div className="relative p-4 h-full flex flex-col items-center justify-center">
                    {/* Tool Icon */}
                    <div className="relative mb-3">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="h-12 w-12 object-contain filter group-hover:brightness-110 transition-all duration-300"
                        loading="lazy"
                        decoding="async"
                        width="48"
                        height="48"
                      />
                    </div>
                    
                    {/* Tool Name */}
                    <div className="text-center">
                      <h3 className={`text-sm font-semibold transition-colors duration-300 line-clamp-2 ${
                        hoveredCardIndex === index ? 'text-primary' : 'text-foreground group-hover:text-primary'
                      }`}>
                        {tool.name}
                      </h3>
                      <p className={`text-xs text-muted-foreground mt-1 transition-opacity duration-300 ${
                        hoveredCardIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {tool.category}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gradient overlays for smooth edges - optimized */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-navy-800/20 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-navy-800/20 to-transparent pointer-events-none z-10"></div>
        </motion.div>

        {/* Professional Learning Statement */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-8 backdrop-blur-sm">
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-3 sm:gap-0"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center sm:mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground text-center sm:text-left">
                  Continuous Learning & Growth
                </h3>
              </motion.div>
              
              <motion.p
                variants={itemVariants}
                className="text-base text-muted-foreground leading-relaxed mb-4"
              >
                These tools represent my current expertise and ongoing learning journey. I'm constantly exploring new technologies, 
                frameworks, and methodologies to stay at the forefront of software development.
              </motion.p>
              
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap justify-center gap-2"
              >
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
                  Always Learning
                </span>
                <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full border border-accent/20">
                  Adapting Quickly
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
                  Tech Enthusiast
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}