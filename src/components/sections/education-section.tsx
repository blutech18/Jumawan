"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, MapPin, Star } from "lucide-react";

const education = [
  {
    id: 1,
    degree: "Bachelor of Science in Information Technology",
    school: "Liceo de Cagayan University",
    location: "Cagayan de Oro, Misamis Oriental",
    period: "2022 - 2026",
    gpa: "",
    status: "In Progress",
    description: "Pursuing comprehensive education in Information Technology with focus on software development, database management, and modern web technologies. Building expertise in full-stack development and emerging technologies.",
    coursework: [
      "Software Development",
      "Database Management Systems",
      "Web Technologies",
      "Mobile Application Development",
      "System Analysis & Design",
      "Network Administration"
    ],
    achievements: [
      "Consistent Dean's Lister (8 semesters)",
      "President, Wizardry Society (2024 - 2025)",
      "Vice President, Wizardry Society (2025 - 2026)",
      "Participant, Hack4Gov (2024)"
    ]
  },
  {
    id: 2,
    degree: "Information Communication Technology (ICT) Strand",
    school: "Liceo de Cagayan University",
    location: "Cagayan de Oro, Misamis Oriental",
    period: "2020 - 2022",
    gpa: "",
    status: "Graduated",
    description: "Completed Senior High School with specialization in Information Communication Technology, focusing on computer programming, web development, and IT fundamentals.",
    coursework: [
      "Computer Programming",
      "Web Development",
      "Database Fundamentals",
      "Networking Basics",
      "IT Fundamentals",
      "Digital Design"
    ],
    achievements: [
      "ICT Strand Graduate",
      "Foundation in IT Technologies"
    ]
  }
];

export function EducationSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.12,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }), []);

  return (
    <section id="education" className="py-20 relative overflow-hidden" style={{ backgroundColor: 'hsl(227 100% 8% / 0.5)' }}>
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Academic foundation and continuous learning journey that built my technical expertise
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="w-full space-y-8"
        >
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
              <Card className="p-8 bg-gradient-card border-border/20 shadow-card hover:shadow-glow transition-all duration-300 group">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 mb-6">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:shadow-glow transition-all duration-300 will-change-transform transform-gpu">
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center sm:text-left leading-tight flex-1 min-w-0">
                            {edu.degree}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className="bg-primary/10 text-primary border-primary/20 font-medium text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 flex-shrink-0 whitespace-nowrap"
                          >
                            {edu.status}
                          </Badge>
                        </div>
                        <p className="text-primary font-semibold text-lg sm:text-xl mb-4 text-center sm:text-left">{edu.school}</p>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 place-items-center sm:place-items-start">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{edu.period}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{edu.location}</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed mb-6 text-center sm:text-left">
                      {edu.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-4 text-center sm:text-left">Key Coursework:</h4>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="flex flex-wrap justify-center sm:justify-start gap-2"
                      >
                        {edu.coursework.map((course, index) => (
                          <motion.div key={index} variants={itemVariants}>
                            <Badge
                              variant="outline"
                              className="border-accent/30 text-accent hover:bg-accent/10 transition-colors will-change-transform transform-gpu"
                            >
                              {course}
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Achievements */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-foreground mb-5 flex items-center justify-center sm:justify-start gap-2">
                      <Star className="h-5 w-5 text-accent" />
                      Achievements
                    </h4>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      className="space-y-3"
                    >
                      {edu.achievements.map((achievement, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors will-change-transform transform-gpu"
                          whileHover={{ x: 5 }}
                        >
                          <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground leading-relaxed">
                            {achievement}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}