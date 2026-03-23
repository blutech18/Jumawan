"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

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
  const { scrollToSection: smoothScrollTo, scrollToTop } = useSmoothScroll();

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

        const offsetTop = element.getBoundingClientRect().top + window.scrollY;
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
      if (sectionId === "home") {
        scrollToTop();
      } else {
        smoothScrollTo(sectionId);
      }

      // Update active section after scroll animation completes
      setTimeout(() => {
        setActiveSection(sectionId);
      }, 1000);
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
          ? "bg-[#021021]/80 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent py-3 sm:py-4"
      )}
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <nav className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-auto">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="select-none group"
          >
            <img
              src="/cjj logo.png"
              alt="@cjj logo"
              className="block h-10 sm:h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.65)] transition duration-300 group-hover:drop-shadow-[0_0_18px_rgba(59,130,246,0.9)] group-hover:brightness-110"
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
                  "text-sm font-medium transition-colors hover:text-primary relative group",
                  activeSection === item.href.substring(1)
                    ? "text-primary"
                    : "text-foreground/80"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                  activeSection === item.href.substring(1) && "w-full"
                )} />
              </button>
            ))}

            {/* Social Icons */}
            <div className="flex items-center space-x-4 ml-2 border-l border-white/10 pl-6">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-foreground/70 hover:text-primary transition-colors duration-300"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/cristan-jade-jumawan-45b27b39b"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-foreground/70 hover:text-primary transition-colors duration-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.3 }
            }}
            className="md:hidden bg-[#021021]/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
          >
            <motion.div 
              className="container mx-auto px-4 sm:px-6 py-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                delay: 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              {/* Navigation Links and Social Icons in Row */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      duration: 0.3,
                      delay: 0.1 + (index * 0.05),
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className={cn(
                      "px-4 py-2 h-10 text-sm font-medium transition-all duration-300 rounded-lg border flex items-center justify-center",
                      activeSection === item.href.substring(1)
                        ? "text-primary border-primary/40 bg-primary/10"
                        : "text-foreground/80 border-white/10 hover:text-primary hover:border-primary/30 hover:bg-white/5"
                    )}
                  >
                    {item.name}
                  </motion.button>
                ))}

                {/* Social Icons as buttons with same style and height */}
                <motion.a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3,
                    delay: 0.1 + (navigationItems.length * 0.05),
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="px-4 py-2 h-10 text-sm font-medium transition-all duration-300 rounded-lg border text-foreground/80 border-white/10 hover:text-primary hover:border-primary/30 hover:bg-white/5 flex items-center justify-center"
                >
                  <Github className="h-4 w-4" />
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/in/cristan-jade-jumawan-45b27b39b"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3,
                    delay: 0.1 + ((navigationItems.length + 1) * 0.05),
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="px-4 py-2 h-10 text-sm font-medium transition-all duration-300 rounded-lg border text-foreground/80 border-white/10 hover:text-primary hover:border-primary/30 hover:bg-white/5 flex items-center justify-center"
                >
                  <Linkedin className="h-4 w-4" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


