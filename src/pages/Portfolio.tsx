import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ToolsCarousel } from "@/components/sections/tools-carousel";
import { CertificatesSection } from "@/components/sections/certificates-section-dynamic";
import { ExperienceSection } from "@/components/sections/experience-section";
import { EducationSection } from "@/components/sections/education-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section-dynamic";
import { Footer } from "@/components/sections/footer";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import "@/styles/galaxy-background.css";


const Portfolio = () => {
  const galaxyRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: galaxyRef,
    offset: ["start start", "end end"],
    layoutEffect: false // Prevents warning during SSR/initial render
  });

  // Spring-smoothed scroll progress — prevents choppy jumps on fast scroll
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: isMobile ? 60 : 60,
    damping: isMobile ? 30 : 30,
    restDelta: 0.001,
  });

  // Scroll-based parallax transforms for star layers (slightly reduced on mobile for performance)
  const starsLayer1Y = useTransform(smoothScroll, [0, 1], isMobile ? ["0%", "8%"] : ["0%", "10%"]);
  const starsLayer2Y = useTransform(smoothScroll, [0, 1], isMobile ? ["0%", "15%"] : ["0%", "18%"]);
  const starsLayer3Y = useTransform(smoothScroll, [0, 1], isMobile ? ["0%", "24%"] : ["0%", "28%"]);

  // Nebula parallax (slower movement for depth and smoothness)
  const nebulaY = useTransform(smoothScroll, [0, 1], isMobile ? ["0%", "6%"] : ["0%", "8%"]);

  return (
    <div className="min-h-screen bg-[#030014] text-foreground">
      <Navigation />

      <main>
        <HeroSection />

        {/* Unified Space/Galaxy Background for all sections */}
        <div ref={galaxyRef} className="relative bg-[#030014]">
          {/* Scroll-based Animated Stars layers */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Layer 1 - Slow parallax stars */}
            <motion.div
              className="stars-layer stars-layer-1"
              style={{ y: starsLayer1Y, willChange: 'transform' }}
            />
            {/* Layer 2 - Medium parallax stars */}
            <motion.div
              className="stars-layer stars-layer-2"
              style={{ y: starsLayer2Y, willChange: 'transform' }}
            />
            {/* Layer 3 - Fast parallax stars with twinkle */}
            <motion.div
              className="stars-layer stars-layer-3"
              style={{ y: starsLayer3Y, willChange: 'transform' }}
            />

            {/* Nebula glow effects - scroll-based parallax */}
            <motion.div style={{ y: nebulaY, willChange: 'transform' }}>
              <div className="nebula-glow nebula-1" />
              <div className="nebula-glow nebula-2" />
              <div className="nebula-glow nebula-3" />
              <div className="nebula-glow nebula-4" />
            </motion.div>
          </div>

          {/* Content sections - seamless flow */}
          <div className="relative z-10">
            <AboutSection />
            <SkillsSection />
            <ToolsCarousel />
            <CertificatesSection />
            <ExperienceSection />
            <EducationSection />
            <ProjectsSection />
            <ContactSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Portfolio;