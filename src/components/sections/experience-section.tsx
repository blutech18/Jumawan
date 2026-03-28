"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, Star, Code, Globe, Clock } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useExperienceStore, WorkExperience } from "@/stores/useExperienceStore";
import { convexClient } from '@/lib/convexClient';
import { api } from '../../../convex/_generated/api';
import { useLenis } from "lenis/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ExperienceSection() {
  const { experiences, loading, fetchExperiences } = useExperienceStore();
  const [selectedExp, setSelectedExp] = useState<WorkExperience | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (selectedExp) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [selectedExp, lenis]);

  useEffect(() => {
    fetchExperiences();
    trackPageView();
  }, []);

  const trackPageView = async () => {
    try {
      await convexClient.mutation(api.analytics.track, {
        event_type: 'page_view',
        page_url: '/experience',
        event_data: { section: 'experience' },
      });
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  };

  const formatPeriod = (startDate: string, endDate?: string, current?: boolean) => {
    const start = new Date(startDate).getFullYear();
    const end = current ? 'Present' : endDate ? new Date(endDate).getFullYear() : 'Present';
    return `${start} - ${end}`;
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.18 } },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] as const } },
  }), []);

  const renderCard = (exp: WorkExperience) => {
    const period = formatPeriod(exp.start_date, exp.end_date, exp.current);

    return (
      <div
        onClick={() => setSelectedExp(exp)}
        className="relative h-full p-4 md:p-6 border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] overflow-hidden cursor-pointer group"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3 sm:gap-5 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 mb-1">
                  {exp.position}
                </h3>
                <p className="text-sm sm:text-lg font-medium text-foreground/80 mb-2 sm:mb-3">{exp.company}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />{period}
                  </span>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />{exp.location}
                  </span>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />{exp.type}
                  </span>
                </div>
              </div>
            </div>

            <h4 className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-3 sm:mb-4">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />Key Achievements
            </h4>
            <div className="space-y-2 sm:space-y-3">
              {exp.achievements.slice(0, 3).map((a, idx) => (
                <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/5 border border-border/10 hover:bg-muted/10 transition-colors group/item">
                  <span className="mt-1.5 sm:mt-2 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary/60 group-hover/item:bg-primary transition-all duration-300 shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">{a}</span>
                </div>
              ))}
              {exp.achievements.length > 3 && (
                <p className="text-[10px] sm:text-xs text-primary/60 italic mt-2 text-center sm:text-left">
                  Tap to view all {exp.achievements.length} achievements
                </p>
              )}
            </div>
          </div>

          {/* Technologies */}
          {exp.technologies && exp.technologies.length > 0 && (
            <div className="lg:col-span-1 pt-4 sm:pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border/10 lg:pl-8">
              <h4 className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-3 sm:mb-5">
                <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />Technologies Used
              </h4>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2">
                {exp.technologies.map((tech, idx) => (
                  <div key={idx} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-muted/10 border border-border/20 text-[10px] sm:text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
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
              <span className="text-cyan-400">Work Experience</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              My professional journey and career milestones
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading work experience...</p>
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No work experience yet</h3>
              <p className="text-muted-foreground">Work experience will be displayed here once added</p>
            </div>
          ) : (
            <div className="w-full space-y-8">
              {experiences.map((exp) => (
                <motion.div
                  key={exp.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="transform-gpu"
                  style={{ willChange: "transform, opacity" }}
                >
                  {renderCard(exp)}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Experience Detail Modal */}
      <Dialog open={!!selectedExp} onOpenChange={(open) => !open && setSelectedExp(null)}>
        <DialogContent className="w-[92vw] max-w-4xl max-h-[85vh] flex flex-col border-[var(--border-subtle)] bg-[var(--surface-modal)] backdrop-blur-2xl !p-0 !gap-0 [&>button]:z-20 overflow-hidden rounded-2xl md:rounded-3xl">
          {selectedExp && (
            <>
              <div className="relative shrink-0 px-5 sm:px-8 pt-5 sm:pt-8 pb-4 border-b border-[var(--border-subtle)] bg-[var(--surface-bg-alt)] rounded-t-2xl md:rounded-t-3xl">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent rounded-t-2xl md:rounded-t-3xl" />
                <DialogHeader className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pr-8">
                    <DialogTitle className="text-lg sm:text-2xl font-bold text-foreground leading-snug">
                      {selectedExp.position}
                    </DialogTitle>
                  </div>
                  <DialogDescription asChild>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-foreground/90">
                        <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />{selectedExp.company}
                      </span>
                      <span className="text-white/10">|</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />{selectedExp.location}
                      </span>
                      <span className="text-white/10">|</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />{selectedExp.type}
                      </span>
                      {selectedExp.duration && (
                        <>
                          <span className="text-white/10">|</span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />{selectedExp.duration}
                          </span>
                        </>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div
                className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 bg-[var(--surface-bg-alt)] overscroll-contain"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
              >
                <h4 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-5">
                  <Code className="w-4 h-4 text-primary" />Key Responsibilities
                </h4>

                {selectedExp.responsibilities && selectedExp.responsibilities.length > 0 ? (
                  <ul className="space-y-2.5">
                    {selectedExp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-muted/5 border border-border/10 hover:bg-muted/10 transition-colors">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground/50">No responsibilities listed.</div>
                )}

                {(selectedExp.team_size || selectedExp.company_size) && (
                  <div className="mt-6 pt-5 border-t border-border/10 flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-muted-foreground/60">
                    {selectedExp.team_size && (
                      <div className="flex items-center gap-2">
                        <span>Team Size:</span>
                        <span className="text-foreground/80">{selectedExp.team_size}</span>
                      </div>
                    )}
                    {selectedExp.company_size && (
                      <div className="flex items-center gap-2">
                        <span>Company Size:</span>
                        <span className="text-foreground/80">{selectedExp.company_size}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
