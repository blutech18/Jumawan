"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  Award,
  Users,
  Briefcase,
  GraduationCap
} from "lucide-react";

const professionalStats = [
  {
    icon: GraduationCap,
    title: "BSIT Graduate",
    subtitle: "Information Technology"
  },
  {
    icon: Briefcase,
    title: "Full Stack Developer",
    subtitle: "React & Node.js"
  },
  {
    icon: Award,
    title: "Problem Solver",
    subtitle: "Clean, Scalable Code"
  },
  {
    icon: Users,
    title: "Team Collaborator",
    subtitle: "Agile Development"
  }
];

export function AboutSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="about" className="py-16 bg-navy-800/20">
      <div className="w-full px-6 md:px-10 lg:px-16">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="w-full"
        >
          {/* Compact Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About Me
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Full Stack Developer specializing in modern web technologies with a focus on scalable, user-centric solutions.
            </p>
          </motion.div>

          {/* Main Content - More Compact Layout */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {/* Professional Gallery - 3-image carousel, image fully fills container */}
            <motion.div variants={itemVariants} className="lg:col-span-1 flex h-full">
              <Card className="p-0 bg-transparent border-none shadow-none w-full h-full min-h-[320px] flex">
                <div className="relative w-full h-full overflow-hidden rounded-xl shadow-[var(--shadow-card)]">
                  <Carousel className="w-full h-full flex flex-col">
                    <CarouselContent className="-ml-0 h-full flex items-stretch">
                      <CarouselItem className="pl-0 h-full">
                        <div className="relative w-full h-full">
                          <img
                            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=900&fit=crop&q=80"
                            alt="Development Environment"
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                          <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-foreground font-medium text-sm bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                              Development Environment
                            </p>
                          </div>
                        </div>
                      </CarouselItem>
                      <CarouselItem className="pl-0 h-full">
                        <div className="relative w-full h-full">
                          <img
                            src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&h=900&fit=crop&q=80"
                            alt="Web Applications"
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20" />
                          <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-foreground font-medium text-sm bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                              Web Applications
                            </p>
                          </div>
                        </div>
                      </CarouselItem>
                      <CarouselItem className="pl-0 h-full">
                        <div className="relative w-full h-full">
                          <img
                            src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=900&fit=crop&q=80"
                            alt="Innovation Focus"
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-600/20" />
                          <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-foreground font-medium text-sm bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                              Innovation Focus
                            </p>
                          </div>
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background" />
                    <CarouselNext className="right-3 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background" />
                  </Carousel>
                </div>
              </Card>
            </motion.div>

            {/* Professional Summary - More Concise */}
            <motion.div variants={itemVariants} className="lg:col-span-2 flex h-full">
              <Card className="p-6 bg-gradient-card border-border/20 flex-1 h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Professional Summary</h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                  <p>
                    Current Bachelor of Science in Information Technology student at Liceo de Cagayan University with hands-on experience 
                    as a Freelance Software Developer. Proficient in full-stack development using Laravel, React, Next.js, React Native, 
                    Python, Kotlin, and JavaScript.
                  </p>
                  <p>
                    Demonstrated ability to develop web and mobile applications, implement APIs, authentication, database integration, 
                    and responsive user interfaces. Experienced in converting client requirements into functional and maintainable software 
                    solutions with ongoing technical support.
                  </p>
                </div>
                
                {/* Core Competencies */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Core Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Laravel", "React/Next.js", "React Native", "Python", "Kotlin", "Full-Stack Development", "API Development", "Mobile Development"].map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Professional Stats - Compact Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 items-stretch">
            {professionalStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                custom={index}
                className="group h-full"
              >
                <Card className="p-4 bg-gradient-card border-border/20 hover:border-primary/30 transition-all duration-300 text-center h-full flex flex-col">
                  <div className="mb-3">
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {stat.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Professional Actions */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {/* No actions here per latest layout change */}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}