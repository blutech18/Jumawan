"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ExternalLink, Github, FolderOpen, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { supabase, Project } from "@/lib/supabase";

export function ProjectsSection() {
  const shouldReduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchProjects();
    trackPageView();
  }, []);

  const trackPageView = async () => {
    try {
      await supabase
        .from('analytics')
        .insert([{
          event_type: 'page_view',
          page_url: '/projects',
          event_data: { section: 'projects' }
        }]);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModalAt = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    setIsZoomed(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsZoomed(false);
    // Delay clearing selection to allow close animation to play smoothly
    setTimeout(() => {
      setSelectedIndex(null);
    }, 300);
  }, []);

  const showPrev = useCallback(() => {
    if (selectedIndex === null || projects.length === 0) return;
    setSelectedIndex((prev) => {
      const nextIndex = (Number(prev) - 1 + projects.length) % projects.length;
      return nextIndex;
    });
  }, [selectedIndex, projects.length]);

  const showNext = useCallback(() => {
    if (selectedIndex === null || projects.length === 0) return;
    setSelectedIndex((prev) => {
      const nextIndex = (Number(prev) + 1) % projects.length;
      return nextIndex;
    });
  }, [selectedIndex, projects.length]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, showPrev, showNext]);

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
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  }), [shouldReduceMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: shouldReduceMotion ? 1 : 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }), [shouldReduceMotion]);

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-navy-800/30 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Featured Projects
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A showcase of my best work and creative solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, idx) => (
              <Card key={idx} className="h-full bg-gradient-card border-border/20 shadow-card overflow-hidden">
                <div className="relative h-48 w-full">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-6 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-navy-800/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A showcase of my best work and creative solutions
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
            <p className="text-muted-foreground">Featured projects will be displayed here once added</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="transform-gpu"
                style={{ willChange: "transform, opacity" }}
              >
                <Card className="h-full bg-gradient-card border-border/20 shadow-card hover:shadow-glow transition-all duration-300 group overflow-hidden">
                  {/* Project Image */}
                  {project.image_url && (
                    <button
                      type="button"
                      className="relative h-48 w-full overflow-hidden will-change-transform transform-gpu text-left"
                      onClick={() => openModalAt(index)}
                      aria-label={`View details for ${project.title}`}
                    >
                      <OptimizedImage
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackIcon={<FolderOpen className="w-12 h-12 text-muted-foreground" />}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 right-3">
                        <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-md bg-background/80 backdrop-blur border border-border/40 text-foreground/90 shadow-sm">
                          View Details
                        </span>
                      </div>
                    </button>
                  )}

                  <div className="p-6">
                    <div className="mb-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {project.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs px-2 py-0.5">Featured</Badge>
                          {project.github_url && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">Open Source</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      {project.created_at && (
                        <span className="rounded-md bg-primary/5 px-2 py-1 border border-border/30">
                          {new Date(project.created_at).getFullYear()}
                        </span>
                      )}
                      {project.live_url && (
                        <span className="rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-1 border border-emerald-500/20">Live</span>
                      )}
                      {project.github_url && (
                        <span className="rounded-md bg-indigo-500/10 text-indigo-400 px-2 py-1 border border-indigo-500/20">Code</span>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.slice(0, 4).map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-primary/5 text-primary border-primary/20"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => openModalAt(index)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        {/* Modal mount */}
        <ProjectsModal
          isOpen={isModalOpen}
          onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}
          projects={projects}
          selectedIndex={selectedIndex}
          onPrev={showPrev}
          onNext={showNext}
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
        />
      </div>
    </section>
  );
}

// Modal for project details mirroring certificates behavior
export function ProjectsModal({
  isOpen,
  onOpenChange,
  projects,
  selectedIndex,
  onPrev,
  onNext,
  isZoomed,
  setIsZoomed,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  selectedIndex: number | null;
  onPrev: () => void;
  onNext: () => void;
  isZoomed: boolean;
  setIsZoomed: (z: boolean) => void;
}) {
  const project = selectedIndex !== null ? projects[selectedIndex] : null;
  if (!project) return null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-[92vw] md:w-[90vw] max-w-[95vw] sm:max-w-[92vw] md:max-w-[900px] lg:max-w-[1100px] max-h-[86vh] p-0 overflow-hidden sm:rounded-xl shadow-2xl ring-1 ring-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <AlertDialogHeader className="px-2 py-1 sm:px-3 sm:py-2 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <AlertDialogTitle className="text-xs sm:text-sm font-medium truncate">
              {project.title}
            </AlertDialogTitle>
            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title="Live Demo">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title="Source Code">
                  <Github className="h-4 w-4" />
                </a>
              )}
              {project.image_url && (
                <button onClick={() => setIsZoomed(!isZoomed)} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title={isZoomed ? 'Zoom out' : 'Zoom in'}>
                  {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </button>
              )}
              <AlertDialogCancel asChild>
                <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title="Close">
                  <X className="h-4 w-4" />
                </button>
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="relative w-full">
          {/* Media */}
          {project.image_url ? (
            <div className="relative w-full bg-black/60">
              <div className="relative mx-auto max-w-[92vw] sm:max-w-[88vw] md:max-w-[860px] lg:max-w-[1040px] aspect-[16/9]">
                <OptimizedImage
                  src={project.image_url}
                  alt={project.title}
                  className={`absolute inset-0 w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-100' : 'scale-95'}`}
                  fallbackIcon={<FolderOpen className="w-12 h-12 text-muted-foreground" />}
                />
              </div>
              {/* Navigation */}
              <button
                onClick={onPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <FolderOpen className="w-10 h-10" />
            </div>
          )}
          {/* Details */}
          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
