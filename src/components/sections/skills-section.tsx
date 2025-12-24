"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import {
  Code2,
  Server,
  Database,
  Cloud,
  TestTube,
  GitBranch,
} from "lucide-react";

const skillCategories = [
  {
    title: "Languages",
    icon: Code2,
    color: "from-sky-400 to-blue-600",
    skills: [
      "HTML/CSS", "JavaScript", "Python", "PHP", 
      "SQL", "TypeScript", "Kotlin"
    ]
  },
  {
    title: "Frameworks & Libraries",
    icon: Server,
    color: "from-blue-600 to-primary",
    skills: [
      "Laravel", "React", "Next.js", "React Native", 
      "Node.js", "Express.js"
    ]
  },
  {
    title: "Tools & Platforms",
    icon: Database,
    color: "from-primary to-accent",
    skills: [
      "Linux", "Git", "Docker", "Node.js", "XAMPP"
    ]
  },
  {
    title: "Deployment & Cloud",
    icon: Cloud,
    color: "from-accent to-sky-300",
    skills: [
      "Vercel", "Netlify", "Railway", "Firebase", "Supabase"
    ]
  },
  {
    title: "Databases",
    icon: TestTube,
    color: "from-sky-300 to-sky-400",
    skills: [
      "MySQL", "PostgreSQL", "Firebase", "Supabase"
    ]
  },
  {
    title: "Version Control",
    icon: GitBranch,
    color: "from-navy-700 to-navy-800",
    skills: [
      "Git", "GitHub", "GitLab"
    ]
  }
];

export function SkillsSection() {
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
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="skills" className="py-20 relative overflow-hidden" style={{ backgroundColor: 'hsl(227 100% 8% / 0.5)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full px-6 md:px-10 lg:px-16 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="w-full"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Full Stack Skills
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive tech stack covering modern web development, 
              from frontend frameworks to cloud deployment.
            </p>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {skillCategories.map((category, index) => (
              <motion.div key={category.title} variants={itemVariants}>
                <Card className="group relative h-full bg-gradient-card border-border/20 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                       style={{ backgroundImage: `linear-gradient(135deg, hsl(var(--sky-400)), hsl(var(--primary)))` }} />
                  
                  <div className="relative p-6 h-full">
                    {/* Category Header */}
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} mr-4`}>
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {category.title}
                      </h3>
                    </div>

                    {/* Skills List */}
                    <div className="space-y-2">
                      {category.skills.map((skill, skillIndex) => (
                        <motion.div
                          key={skill}
                          initial={{ x: -20, opacity: 0 }}
                          animate={inView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                          transition={{ delay: index * 0.1 + skillIndex * 0.05 }}
                          className="flex items-center"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            {skill}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress Bar Animation */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent origin-left"
                      initial={{ scaleX: 0 }}
                      animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-6">
              Ready to bring your ideas to life with these technologies?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
            >
              View My Projects
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}