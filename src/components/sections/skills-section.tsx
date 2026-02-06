"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useSkillStore } from "@/stores/useSkillStore";


export function SkillsSection() {
  const { skillCategories } = useSkillStore();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Header - Centered to match Certificates */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-16 mx-auto w-fit"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Skills
              </span>
            </h2>
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/70" />
            </div>
          </motion.div>

          {/* Skills Grid - Minimalist Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => (
              <motion.div key={category.title} variants={itemVariants}>
                <div className="p-6 h-full border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                  <div className="space-y-6">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                      <category.icon className={`h-5 w-5 ${category.color.replace('bg-', 'text-').replace('-500', '-500')}`} />
                      <h3 className="text-xl font-semibold text-foreground tracking-tight">
                        {category.title}
                      </h3>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, skillIndex) => (
                        <motion.span
                          key={skill}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-secondary/40 text-muted-foreground border border-transparent hover:border-primary/20 hover:bg-secondary/60 hover:text-foreground transition-all duration-300 cursor-default shadow-sm"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="mt-20 pt-10 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <p className="text-muted-foreground text-lg">
              Ready to deploy these technologies on your next project?
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-full transition-all duration-300"
            >
              View My Projects
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}