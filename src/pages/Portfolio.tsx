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
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import "@/styles/galaxy-background.css";


const Portfolio = () => {
  const galaxyRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: galaxyRef,
    offset: ["start start", "end end"]
  });
  
  // Scroll-based parallax transforms for star layers
  const starsLayer1Y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const starsLayer2Y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const starsLayer3Y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // Nebula parallax (slower movement for depth)
  const nebulaY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

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
              style={{ y: starsLayer1Y }}
            />
            {/* Layer 2 - Medium parallax stars */}
            <motion.div 
              className="stars-layer stars-layer-2" 
              style={{ y: starsLayer2Y }}
            />
            {/* Layer 3 - Fast parallax stars with twinkle */}
            <motion.div 
              className="stars-layer stars-layer-3" 
              style={{ y: starsLayer3Y }}
            />
            
            {/* Nebula glow effects - scroll-based parallax */}
            <motion.div style={{ y: nebulaY }}>
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