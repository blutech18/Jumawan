"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, MapPin, ChevronDown, ChevronUp, Star, Clock, Users, Award } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { supabase, WorkExperience } from "@/lib/supabase";

export function ExperienceSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchExperiences();
    trackPageView();
  }, []);

  const trackPageView = async () => {
    try {
      await supabase
        .from('analytics')
        .insert([{
          event_type: 'page_view',
          page_url: '/experience',
          event_data: { section: 'experience' }
        }]);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .order('order_index', { ascending: true })
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching work experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const formatPeriod = (startDate: string, endDate?: string, current?: boolean) => {
    const start = new Date(startDate).getFullYear();
    const end = current ? 'Present' : endDate ? new Date(endDate).getFullYear() : 'Present';
    return `${start} - ${end}`;
  };

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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'freelance':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'part-time':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  return (
    <section id="experience" className="py-16 bg-gradient-to-b from-navy-900/30 to-navy-900/60 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent"></div>
      
      <div className="w-full px-6 md:px-10 lg:px-16 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Professional Journey</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Work Experience
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive overview of my professional journey, showcasing growth, achievements, and the diverse experiences that shaped my expertise
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading work experience...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No work experience yet</h3>
            <p className="text-muted-foreground">Work experience will be displayed here once added</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="w-full space-y-8"
          >
            {experiences.map((exp, index) => {
              const isExpanded = expandedCards.has(exp.id);
              const isCurrent = exp.current;
              const period = formatPeriod(exp.start_date, exp.end_date, exp.current);
            
            return (
              <motion.div
                key={exp.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="transform-gpu"
                style={{ willChange: "transform, opacity" }}
              >
                <Card className="group relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 border-2 border-border/40 shadow-elegant hover:shadow-glow transition-all duration-500 backdrop-blur-sm">
                  {/* Progress indicator */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 to-accent/30 shadow-sm"></div>
                  
                  <div className="p-6 lg:p-8">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 mb-6">
                      {/* Company Icon & Basic Info */}
                      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 w-full">
                        <motion.div 
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:shadow-glow transition-all duration-300 border-2 border-primary/20 shadow-lg will-change-transform transform-gpu">
                            <Briefcase className="h-8 w-8 text-primary" />
                          </div>
                          
                        </motion.div>
                        
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors text-center sm:text-left leading-tight">
                              {exp.position}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={`${getTypeColor(exp.type)} font-medium text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1`}
                            >
                              {exp.type}
                            </Badge>
                          </div>
                          
                          <p className="text-primary font-semibold text-lg sm:text-xl mb-4 text-center sm:text-left">{exp.company}</p>
                          
                          {/* Meta Information Grid */}
                            <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-3 rounded-lg bg-gradient-to-br from-muted/10 to-muted/5 border border-border/20 shadow-sm">
                            <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-md bg-background/50 border border-border/10 shadow-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-xs sm:text-sm font-medium text-center flex-1">{period}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-md bg-background/50 border border-border/10 shadow-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-xs sm:text-sm font-medium text-center flex-1">{exp.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-md bg-background/50 border border-border/10 shadow-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-xs sm:text-sm font-medium text-center flex-1">{exp.duration || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-md bg-background/50 border border-border/10 shadow-sm">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="text-xs sm:text-sm font-medium text-center flex-1">{exp.team_size || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="mb-6">
                      <h4 className="flex items-center justify-center sm:justify-start gap-2 text-lg font-semibold text-foreground mb-4">
                        <Award className="h-5 w-5 text-accent" />
                        Key Achievements
                      </h4>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3"
                      >
                        {exp.achievements.map((achievement, idx) => (
                          <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl will-change-transform transform-gpu"
                            whileHover={{ y: -2, scale: 1.02 }}
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0 border border-background shadow-sm"></div>
                            <span className="text-sm text-muted-foreground leading-relaxed font-medium">
                              {achievement}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Technologies Section */}
                    <div className="mb-6">
                      <h4 className="flex items-center justify-center sm:justify-start gap-2 text-lg font-semibold text-foreground mb-4">
                        <Star className="h-5 w-5 text-accent" />
                        Technologies & Tools
                      </h4>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="flex flex-wrap justify-center sm:justify-start gap-1.5"
                      >
                        {exp.technologies.map((tech, idx) => (
                          <motion.div key={idx} variants={itemVariants}>
                            <Badge
                              variant="outline"
                              className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 px-2.5 py-1 font-medium will-change-transform transform-gpu"
                            >
                              {tech}
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Expandable Responsibilities */}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <div className="border-t border-border/30 pt-4 shadow-sm">
                        <Button
                          variant="ghost"
                          onClick={() => toggleExpanded(exp.id)}
                          className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/5 transition-all duration-300"
                        >
                          <span className="font-medium">
                            {isExpanded ? 'Show Less' : 'View All Responsibilities'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <motion.div
                          initial={false}
                          animate={{
                            height: isExpanded ? 'auto' : 0,
                            opacity: isExpanded ? 1 : 0,
                          }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden will-change-transform transform-gpu"
                        >
                          <div className="mt-4 space-y-2">
                            <h4 className="text-lg font-semibold text-foreground mb-4 text-center sm:text-left">Detailed Responsibilities</h4>
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true, amount: 0.2 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-3"
                            >
                              {exp.responsibilities.map((responsibility, idx) => (
                                <motion.div
                                  key={idx}
                                  variants={itemVariants}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border-2 border-border/30 hover:bg-muted/50 transition-colors shadow-md hover:shadow-lg will-change-transform transform-gpu"
                                >
                                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 border border-background shadow-sm"></div>
                                  <span className="text-sm text-muted-foreground leading-relaxed">
                                    {responsibility}
                                  </span>
                                </motion.div>
                              ))}
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
          </motion.div>
        )}
      </div>
    </section>
  );
}