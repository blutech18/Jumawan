"use client";

import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-navy-800 text-muted-foreground border-t border-white/10">
      {/* top accent line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <img
                src="/cjj%20logo.png"
                alt="CJJ logo"
                className="h-8 w-auto select-none"
                draggable={false}
              />
              <span className="text-foreground font-semibold">Jumawan Portfolio</span>
            </div>
            <p className="mt-4 text-sm leading-6">
              Crafting clean, performant web experiences with modern tools and thoughtful design.
            </p>

            <div className="mt-5 flex items-center justify-center md:justify-start gap-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/cristan-jade-jumawan-45b27b39b"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:alex@example.com"
                aria-label="Email"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>

            {/* availability status */}
            <div className="mt-4 inline-flex items-center justify-center md:justify-start gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/90">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Available for opportunities
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <p className="text-foreground font-medium">Quick Links</p>
            <ul className="mt-4 flex flex-wrap justify-center md:block space-x-4 md:space-x-0 md:space-y-3 text-sm">
              <li>
                <a href="#home" className="hover:text-foreground transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-foreground transition-colors">About</a>
              </li>
              <li>
                <a href="#skills" className="hover:text-foreground transition-colors">Skills</a>
              </li>
              <li>
                <a href="#projects" className="hover:text-foreground transition-colors">Projects</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <p className="text-foreground font-medium">Resources</p>
            <ul className="mt-4 flex flex-wrap justify-center md:block space-x-4 md:space-x-0 md:space-y-3 text-sm">
              <li>
                <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#support" className="hover:text-foreground transition-colors">Support</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <p className="text-foreground font-medium">Contact</p>
            <ul className="mt-4 flex flex-wrap justify-center md:block space-x-4 md:space-x-0 md:space-y-3 text-sm">
              <li>
                <a href="mailto:alex@example.com" className="hover:text-foreground transition-colors">alex@example.com</a>
              </li>
              <li className="text-foreground/80">Open to freelance and collabs</li>
            </ul>
          </div>

          
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs md:text-sm text-center md:text-left">© {currentYear} Cristan Jade Jumawan. All rights reserved.</p>

          <button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}


