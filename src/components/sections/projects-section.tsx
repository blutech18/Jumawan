import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProjectStore, Project } from "@/stores/useProjectStore";
import { ProjectCard } from "./ProjectCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { convexClient } from '@/lib/convexClient';
import { api } from '../../../convex/_generated/api';
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ChevronLeft, ChevronRight, ExternalLink, FolderOpen, Github, X, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ProjectsSection() {
  const shouldReduceMotion = useReducedMotion();
  const { projects, loading, fetchProjects } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchProjects();
    trackPageView();
  }, [fetchProjects]);

  const trackPageView = async () => {
    try {
      await convexClient.mutation(api.analytics.track, {
        event_type: 'page_view',
        page_url: '/projects',
        event_data: { section: 'projects' },
      });
    } catch (error) {
      console.warn('Analytics tracking error:', error);
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
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, showPrev, showNext]);

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.4,
          staggerChildren: shouldReduceMotion ? 0 : 0.12,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const itemVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : 24,
        scale: shouldReduceMotion ? 1 : 0.98,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: shouldReduceMotion ? 0.3 : 0.5,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
    }),
    [shouldReduceMotion],
  );

  if (loading) {
    return (
      <section
        id="projects"
        className="py-20 bg-transparent relative overflow-hidden"
      >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-full bg-gradient-card border-border/20 shadow-card overflow-hidden rounded-xl">
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 bg-black/5 animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-black/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-6 w-3/5 bg-black/5 animate-pulse rounded-md" />
                      <div className="h-4 w-2/5 bg-black/5 animate-pulse rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-black/5 animate-pulse rounded-md" />
                    <div className="h-4 w-5/6 bg-black/5 animate-pulse rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="py-20 bg-transparent relative overflow-hidden border-none outline-none"
    >
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="flex flex-col items-center mb-16 mx-auto w-fit"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="text-cyan-400">Featured Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
            A showcase of my best work and creative solutions
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground">
              Featured projects will be displayed here once added
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                openModalAt={openModalAt}
              />
            ))}
          </div>
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
      <AlertDialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[1000px] p-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-cyan-500/20 bg-zinc-950/90 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl border-none">
        <AlertDialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-start justify-between gap-4 pointer-events-auto">
            <AlertDialogTitle className="text-base md:text-lg font-bold text-white/90 tracking-tight drop-shadow-md line-clamp-1 mt-1">
              {project.title}
            </AlertDialogTitle>
            <div className="flex items-center gap-2">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                  title="Live Demo"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                  title="Source Code"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              <AlertDialogCancel asChild>
                <button
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex flex-col h-[85vh] md:h-[80vh]">
          <div
            className={`relative flex-1 bg-black/95 flex items-center justify-center group overflow-hidden overscroll-contain`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 to-transparent opacity-50 pointer-events-none" />

            {project.image_url ? (
              <div
                className="relative w-full h-full flex items-center justify-center"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <OptimizedImage
                  src={project.image_url}
                  alt={project.title}
                  className={`select-none shadow-2xl pointer-events-none w-full h-full object-contain`}
                  draggable={false}
                  fallbackIcon={
                    <FolderOpen className="h-20 w-20 text-muted-foreground/30" />
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground/30">
                <FolderOpen className="h-20 w-20" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}
          </div>
          <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-white/5 px-6 py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-primary/5 text-primary border-primary/20"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
