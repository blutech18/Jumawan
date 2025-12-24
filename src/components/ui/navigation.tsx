"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateOnScroll = () => {
      const scrolled = window.scrollY > 50;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);

      const sections = navigationItems.map(item => item.href.substring(1));
      const scrollPosition = window.scrollY + 150;

      let currentSection = "home";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;
        const offsetTop = element.offsetTop;
        if (scrollPosition >= offsetTop) currentSection = section;
      }

      if (currentSection !== activeSection) setActiveSection(currentSection);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateOnScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to initialize state correctly
    updateOnScroll();
    return () => window.removeEventListener("scroll", handleScroll as EventListener);
  }, [activeSection, isScrolled]);

  const scrollToSection = (href: string) => {
    const sectionId = href.substring(1);

    const performScroll = () => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      const header = document.querySelector("header");
      const headerHeight = (header as HTMLElement | null)?.offsetHeight ?? 0;
      const targetY = element.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      
      window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
      
      // Update active section after scroll animation completes
      setTimeout(() => {
        setActiveSection(sectionId);
      }, 800); // Wait for smooth scroll to complete
    };

    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      // Wait for the mobile menu close animation to finish before scrolling
      setTimeout(performScroll, 300);
    } else {
      performScroll();
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, type: "spring", stiffness: 80, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/10 backdrop-blur-md shadow-lg" 
          : "bg-transparent py-4"
      )}
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <nav className="container mx-auto px-6 py-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="select-none group"
          >
            <img
              src="/cjj logo.png"
              alt="@cjj logo"
              className="block h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.65)] transition duration-300 group-hover:drop-shadow-[0_0_18px_rgba(59,130,246,0.9)] group-hover:brightness-110"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors duration-200",
                  "hover:text-primary",
                  activeSection === item.href.substring(1)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
            
            {/* Social Icons */}
            <div className="flex items-center gap-4 ml-6 border-l border-border/20 pl-6">
              <a
                href="https://github.com/blutech18"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:shadow-glow transition-all duration-300 hover:scale-110"
              >
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com/in/cristan-jade-jumawan-45b27b39b"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:shadow-glow transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0.0, 0.2, 1],
                opacity: { duration: 0.2 },
                height: { duration: 0.3 },
                y: { duration: 0.3 }
              }}
              className="md:hidden mt-4 py-4 border-t border-border/20 bg-slate-900/70 backdrop-blur-md rounded-lg"
            >
              <div className="flex flex-row justify-center space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                      "hover:text-white hover:bg-white/10",
                      activeSection === item.href.substring(1)
                        ? "text-sky-400 font-bold"
                        : "text-white/70"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}


