"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { Calendar, MapPin, Star, Terminal } from "lucide-react";

import { useEducationStore } from "@/stores/useEducationStore";

export function EducationSection() {
  const { education } = useEducationStore();

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.18,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }), []);

  return (
    <section id="education" className="py-24 relative overflow-hidden bg-transparent">
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-16 mx-auto w-fit">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="text-cyan-400">
                Education
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              My academic background and qualifications
            </p>
          </motion.div>

          {/* Card Grid - Consistent with Skills Section */}
          <div className="w-full space-y-8">
            {education.map((edu) => (
              <motion.div
                key={edu.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="transform-gpu"
                style={{ willChange: "transform, opacity" }}
              >
                <div className="relative h-full p-4 md:p-6 border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] overflow-hidden group">
                  {/* Accent gradient top bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3 sm:gap-5 mb-4 sm:mb-6">

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 mb-1">
                            {edu.degree}
                          </h3>
                          <p className="text-sm sm:text-lg font-medium text-foreground/80 mb-2 sm:mb-3">{edu.school}</p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted-foreground/60">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />
                              <span>{edu.period}</span>
                            </div>
                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />
                              <span>{edu.location}</span>
                            </div>
                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase">
                              {edu.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-base text-muted-foreground leading-relaxed mb-5 sm:mb-8 text-center sm:text-left">
                        {edu.description}
                      </p>

                      <div>
                        <h4 className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-3 sm:mb-4">
                          <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          Key Coursework
                        </h4>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2">
                          {edu.coursework.map((course, index) => (
                            <div key={index} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[10px] sm:text-xs font-medium text-muted-foreground hover:text-primary hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-300">
                              {course}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="lg:col-span-1 pt-4 sm:pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] lg:pl-8">
                      <h4 className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-3 sm:mb-5">
                        <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        Achievements
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        {edu.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group/item"
                          >
                            <span className="mt-1.5 sm:mt-2 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary/60 group-hover/item:bg-primary group-hover/item:shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300 shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed group-hover/item:text-muted-foreground/90 transition-colors">
                              {achievement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}