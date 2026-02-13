"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Briefcase, Calendar, MapPin, ArrowRight, Globe, Clock, Star, Code } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { WorkExperience } from "@/lib/supabase";
import { safeSupabase } from "@/lib/supabase-safe";
import { useExperienceStore } from "@/stores/useExperienceStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


export function ExperienceSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { experiences, loading, fetchExperiences } = useExperienceStore();
  const [selectedExp, setSelectedExp] = useState<WorkExperience | null>(null);

  useEffect(() => {
    fetchExperiences();
    trackPageView();
  }, [fetchExperiences]);

  const trackPageView = async () => {
    if (!safeSupabase.isAvailable()) return;
    try {
      await safeSupabase.client!
        .from('analytics')
        .insert([{
          event_type: 'page_view',
          page_url: '/experience',
          event_data: { section: 'experience' }
        }]);
    } catch (error) {
      // Silently fail analytics - don't break the app
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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  }), []);

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Header - Consistent with Skills Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-16 mx-auto w-fit">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="text-cyan-400">
                Work Experience
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              My professional journey and career milestones
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
            <>
              {/* Card Grid - Consistent with Skills Section */}
              <div className="w-full space-y-8">
                {experiences.map((exp, index) => {
                  const period = formatPeriod(exp.start_date, exp.end_date, exp.current);

                  return (
                    <motion.div key={exp.id} variants={itemVariants}>
                      <div
                        onClick={() => setSelectedExp(exp)}
                        className="relative h-full p-6 border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] overflow-hidden cursor-pointer group"
                      >
                        {/* Accent gradient top bar */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Main Info */}
                          <div className="lg:col-span-2">
                            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5 mb-6">

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                                    {exp.position}
                                  </h3>
                                </div>
                                <p className="text-lg font-medium text-foreground/80 mb-3">{exp.company}</p>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground/60">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-primary/60" />
                                    <span>{period}</span>
                                  </div>
                                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-primary/60" />
                                    <span>{exp.location}</span>
                                  </div>
                                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase">
                                    {exp.type}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Achievements (Moved to Main Col) */}
                            <h4 className="flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-5">
                              <Star className="h-4 w-4 text-primary" />
                              Key Achievements
                            </h4>
                            <div className="space-y-3">
                              {exp.achievements.slice(0, 3).map((achievement, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group/item"
                                >
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover/item:bg-primary group-hover/item:shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300 shrink-0" />
                                  <span className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-muted-foreground/90 transition-colors line-clamp-3">
                                    {achievement}
                                  </span>
                                </div>
                              ))}
                              {exp.achievements.length > 3 && (
                                <p className="text-xs text-center sm:text-left text-primary/60 italic mt-2">
                                  Click to view all {exp.achievements.length} achievements...
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Achievements (Right Col) */}
                          <div className="lg:col-span-1 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] lg:pl-8 lg:flex lg:flex-col lg:h-full">
                            {/* Technologies (Moved to Right Col) */}
                            {exp.technologies && exp.technologies.length > 0 && (
                              <div className="w-full lg:flex-1 lg:flex lg:flex-col">
                                <h4 className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-4 text-center w-full shrink-0">
                                  <Code className="w-4 h-4 text-primary" />
                                  Technologies Used
                                </h4>
                                <motion.div
                                  className="grid grid-cols-2 gap-2 lg:h-full lg:auto-rows-[1fr]"
                                >
                                  {exp.technologies.map((tech, idx) => (
                                    <div key={idx} className="w-full h-full flex items-center justify-center px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-muted-foreground text-center hover:text-primary hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-300">
                                      {tech}
                                    </div>
                                  ))}
                                </motion.div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Experience Detail Modal */}
      <Dialog open={!!selectedExp} onOpenChange={(open) => !open && setSelectedExp(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col border-white/[0.06] bg-[#000212]/95 backdrop-blur-2xl !p-0 !gap-0 [&>button]:z-20 overflow-hidden">
          {selectedExp && (
            <>
              {/* Modal Header - Fixed */}
              <div className="relative shrink-0 px-5 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-white/[0.06] bg-[#010626]/80">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent" />

                <DialogHeader className="space-y-3">
                  {/* Title + Period row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pr-8">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                      {selectedExp.position}
                    </DialogTitle>
                  </div>

                  <DialogDescription asChild>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                      {/* Employer/Company */}
                      <span className="flex items-center gap-1.5 font-medium text-foreground/90">
                        <Briefcase className="w-4 h-4 text-primary" />
                        {selectedExp.company}
                      </span>

                      <span className="text-white/10">|</span>

                      {/* Location */}
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        {selectedExp.location}
                      </span>

                      <span className="text-white/10">|</span>

                      {/* Type */}
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="w-4 h-4 text-primary" />
                        {selectedExp.type}
                      </span>

                      {selectedExp.duration && (
                        <>
                          <span className="text-white/10">|</span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            {selectedExp.duration}
                          </span>
                        </>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Modal Body - Scrollable */}
              <div
                className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-6 bg-[#010626]/50"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                }}
              >
                <div className="flex-col h-full">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/90 uppercase tracking-wider mb-6">
                    <Code className="w-4 h-4 text-primary" />
                    Key Responsibilities
                  </h4>

                  {/* Responsibilities List */}
                  {selectedExp.responsibilities && selectedExp.responsibilities.length > 0 ? (
                    <div className="animate-in fade-in duration-300">
                      <ul className="space-y-3">
                        {selectedExp.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                            <span className="text-sm text-muted-foreground leading-relaxed">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground/50">
                      No responsibilities listed.
                    </div>
                  )}
                </div>

                {/* Footer Stats - Only Team/Company Size remains */}
                {(selectedExp.team_size || selectedExp.company_size) && (
                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap justify-center gap-6 text-sm text-muted-foreground/60">
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