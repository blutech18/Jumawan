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


const Portfolio = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-foreground">
      <Navigation />
      
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ToolsCarousel />
        <CertificatesSection />
        <ExperienceSection />
        <EducationSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Portfolio;