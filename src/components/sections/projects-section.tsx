import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectStore, Project } from "@/stores/useProjectStore";
import { ProjectCard } from "./ProjectCard";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { convexClient } from '@/lib/convexClient';
import { api } from '../../../convex/_generated/api';
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ExternalLink, FolderOpen, Github, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLenis } from "lenis/react";

export function ProjectsSection() {
  const shouldReduceMotion = useReducedMotion();
  const { projects, loading, fetchProjects } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollLeft = useRef(0);

  useEffect(() => {
    fetchProjects();
    trackPageView();
  }, []);

  // Restore scroll position after projects re-render
  useEffect(() => {
    if (scrollRef.current && projects.length > 0 && savedScrollLeft.current > 0) {
      scrollRef.current.scrollLeft = savedScrollLeft.current;
    }
  }, [projects]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cardsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(projects.length / cardsPerPage);
  const currentPage = Math.floor(currentCard / cardsPerPage);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || projects.length === 0) return;
    const el = scrollRef.current;
    savedScrollLeft.current = el.scrollLeft;
    const cardWidth = el.scrollWidth / projects.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setCurrentCard(Math.max(0, Math.min(idx, projects.length - 1)));
  }, [projects.length]);

  const scrollToCard = (idx: number) => {
    if (!scrollRef.current || projects.length === 0) return;
    const clamped = Math.max(0, Math.min(idx, projects.length - 1));
    const el = scrollRef.current;
    const cardWidth = el.scrollWidth / projects.length;
    el.scrollTo({ left: cardWidth * clamped, behavior: 'smooth' });
  };

  const scrollToPage = (page: number) => {
    scrollToCard(page * cardsPerPage);
  };

  const goToPrevPage = () => { if (currentPage > 0) scrollToPage(currentPage - 1); };
  const goToNextPage = () => { if (currentPage < totalPages - 1) scrollToPage(currentPage + 1); };

  // Drag/swipe handling — works for both mouse (desktop) and touch (mobile)
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragStartCard = useRef(0);
  const momentumRaf = useRef<number>(0);

  const startDrag = (clientX: number) => {
    if (!scrollRef.current) return;
    cancelAnimationFrame(momentumRaf.current);
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = clientX;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    dragStartCard.current = currentCard;
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.style.scrollBehavior = 'auto';
    if (!isMobile) scrollRef.current.style.cursor = 'grabbing';
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging.current || !scrollRef.current) return;
    const walk = clientX - dragStartX.current;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const endDrag = (clientX: number) => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    const el = scrollRef.current;
    el.style.cursor = '';
    el.style.scrollSnapType = '';
    el.style.scrollBehavior = '';

    const swipeDist = clientX - dragStartX.current;
    const threshold = 30; // px — sensitive swipe
    const startPage = Math.floor(dragStartCard.current / cardsPerPage);

    if (Math.abs(swipeDist) > threshold) {
      // Swiped far enough — commit to next/prev page
      const targetPage = swipeDist < 0
        ? Math.min(startPage + 1, totalPages - 1)
        : Math.max(startPage - 1, 0);
      scrollToPage(targetPage);
    } else {
      // Didn't swipe far enough — snap back to original page
      scrollToPage(startPage);
    }
  };

  // Mouse events (desktop)
  const onMouseDown = (e: ReactMouseEvent) => {
    if (isMobile) return;
    startDrag(e.pageX);
  };
  const onMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    moveDrag(e.pageX);
  };
  const onMouseUp = (e: ReactMouseEvent) => {
    endDrag(e.pageX);
  };

  // Touch events (mobile) — override CSS snap for controlled swiping
  const onTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    moveDrag(e.touches[0].clientX);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    endDrag(e.changedTouches[0].clientX);
  };

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

  const safeOpenModal = useCallback((index: number) => {
    if (hasDragged.current) { hasDragged.current = false; return; }
    openModalAt(index);
  }, [openModalAt]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsZoomed(false);
    setTimeout(() => { setSelectedIndex(null); }, 150);
  }, []);

  const showPrev = useCallback(() => {
    if (selectedIndex === null || projects.length === 0) return;
    setSelectedIndex((prev) => (Number(prev) - 1 + projects.length) % projects.length);
  }, [selectedIndex, projects.length]);

  const showNext = useCallback(() => {
    if (selectedIndex === null || projects.length === 0) return;
    setSelectedIndex((prev) => (Number(prev) + 1) % projects.length);
  }, [selectedIndex, projects.length]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); showPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); showNext(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, showPrev, showNext]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: shouldReduceMotion ? 0 : 0.18 } },
  }), [shouldReduceMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: shouldReduceMotion ? 1 : 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: shouldReduceMotion ? 0.45 : 0.75, ease: [0.4, 0, 0.2, 1] as const } },
  }), [shouldReduceMotion]);

  // --- Shared mobile card renderer ---
  const renderMobileCard = (project: Project, index: number) => (
    <div
      onClick={() => safeOpenModal(index)}
      className="h-full relative border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] overflow-hidden cursor-pointer group"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

      {project.image_url && (
        <div className="relative h-[295px] sm:h-[359px] w-full overflow-hidden">
          <OptimizedImage
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-muted/5"
            draggable={false}
            fallbackIcon={<FolderOpen className="w-12 h-12 text-muted-foreground" />}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-overlay-from)] via-transparent to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-3 text-center">
        <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {project.technologies.slice(0, 4).map((tech, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-muted/5 border border-[var(--border-subtle)] text-[10px] font-medium text-muted-foreground">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-0.5 text-[10px] text-primary/60">+{project.technologies.length - 4}</span>
          )}
        </div>
        <p className="text-[10px] text-primary/60 italic">Tap to view details</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16 mx-auto w-fit">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="text-cyan-400">Featured Projects</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              A showcase of my best work and creative solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-full bg-gradient-card border-border/20 shadow-card overflow-hidden rounded-xl">
                <div className="relative h-48 w-full"><div className="absolute inset-0 bg-muted/5 animate-pulse" /></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-6 w-3/5 bg-muted/5 animate-pulse rounded-md" />
                      <div className="h-4 w-2/5 bg-muted/5 animate-pulse rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/5 animate-pulse rounded-md" />
                    <div className="h-4 w-5/6 bg-muted/5 animate-pulse rounded-md" />
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
    <section id="projects" className="py-20 bg-transparent relative overflow-hidden border-none outline-none">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-16 mx-auto w-fit">
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
              <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
              <p className="text-muted-foreground">Featured projects will be displayed here once added</p>
            </div>
          ) : (
            <>
              {/* See All button */}
              {projects.length > 0 && (
                <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllModal(true)}
                    className="border-border/40 hover:border-cyan-400/40 hover:bg-cyan-400/5 text-muted-foreground hover:text-cyan-400 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <FolderOpen className="h-3.5 w-3.5 mr-2" />
                    See All {projects.length} Projects
                  </Button>
                </motion.div>
              )}

              {/* Unified swipeable carousel — 1 card mobile, 2 cards desktop */}
              <motion.div variants={itemVariants} className="relative overflow-hidden -mx-6">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth ${!isMobile ? 'cursor-grab' : ''}`}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    overscrollBehaviorX: 'contain',
                    overscrollBehaviorY: 'auto',
                    paddingLeft: isMobile ? 'calc((100vw - min(80vw, 340px)) / 2)' : '24px',
                    paddingRight: isMobile ? 'calc((100vw - min(80vw, 340px)) / 2)' : '24px',
                  }}
                >
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="shrink-0"
                      style={{ width: isMobile ? 'min(80vw, 340px)' : 'calc(50% - 12px)' }}
                    >
                      {isMobile ? renderMobileCard(project, index) : (
                        <ProjectCard project={project} index={index} openModalAt={safeOpenModal} />
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to page ${i + 1}`}
                          onClick={() => scrollToPage(i)}
                          className={`rounded-full transition-all duration-300 ${i === currentPage ? "w-6 h-2 bg-cyan-400" : "w-2 h-2 bg-border/20 hover:bg-border/40"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground/40 italic">{isMobile ? 'Swipe' : 'Drag'} to explore · {currentPage + 1} / {totalPages}</span>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Project detail modal */}
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

        {/* See All modal */}
        <SeeAllProjectsModal
          isOpen={showAllModal}
          onOpenChange={setShowAllModal}
          projects={projects}
          onSelect={(index) => { openModalAt(index); }}
        />
      </div>
    </section>
  );
}

// See All Projects Modal
function SeeAllProjectsModal({
  isOpen,
  onOpenChange,
  projects,
  onSelect,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onSelect: (index: number) => void;
}) {
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) { lenis?.stop(); document.body.style.overflow = 'hidden'; }
    else { lenis?.start(); document.body.style.overflow = ''; }
    return () => { lenis?.start(); document.body.style.overflow = ''; };
  }, [isOpen, lenis]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-3xl h-[75vh] flex flex-col border-[var(--border-subtle)] bg-[var(--surface-modal)] backdrop-blur-2xl !p-0 !gap-0 [&>button]:z-20 overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="relative shrink-0 px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-[var(--border-subtle)] bg-[var(--surface-bg-alt)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent rounded-t-2xl md:rounded-t-3xl" />
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              All Projects ({projects.length})
            </DialogTitle>
          </DialogHeader>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 bg-[var(--surface-bg-alt)] overscroll-contain"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {projects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelect(index)}
                className="group text-left rounded-xl border border-border/50 overflow-hidden hover:border-cyan-400/50 hover:shadow-[0_0_8px_rgba(34,211,238,0.1)] transition-all duration-300"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/10">
                  {project.image_url ? (
                    <OptimizedImage
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                      fallbackIcon={<FolderOpen className="h-8 w-8 text-muted-foreground/30" />}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-3 h-[72px] sm:h-[76px] flex flex-col justify-start">
                  <p className="text-[11px] sm:text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 mt-1 truncate">
                    {project.technologies.slice(0, 3).join(' · ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Project detail modal
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
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) { lenis?.stop(); document.body.style.overflow = 'hidden'; }
    else { lenis?.start(); document.body.style.overflow = ''; }
    return () => { lenis?.start(); document.body.style.overflow = ''; };
  }, [isOpen, lenis]);

  if (!project) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[1000px] p-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-cyan-500/20 bg-[var(--surface-modal)]/90 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl border-none">
        <AlertDialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-[var(--overlay-bg)] to-transparent pointer-events-none">
          <div className="flex items-start justify-between gap-4 pointer-events-auto">
            <AlertDialogTitle className="text-base md:text-lg font-bold text-white/90 tracking-tight drop-shadow-md line-clamp-1 mt-1">
              {project.title}
            </AlertDialogTitle>
            <div className="flex items-center gap-2">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--overlay-light)] hover:bg-[var(--overlay-light)] text-[var(--text-on-overlay)] hover:text-[var(--text-on-overlay-hover)] transition-all duration-300 backdrop-blur-sm" title="Live Demo">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[var(--overlay-light)] hover:bg-[var(--overlay-light)] text-[var(--text-on-overlay)] hover:text-[var(--text-on-overlay-hover)] transition-all duration-300 backdrop-blur-sm" title="Source Code">
                  <Github className="h-4 w-4" />
                </a>
              )}
              <AlertDialogCancel asChild>
                <button className="p-2 rounded-full bg-[var(--overlay-light)] hover:bg-[var(--overlay-light)] text-[var(--text-on-overlay)] hover:text-[var(--text-on-overlay-hover)] transition-all duration-300 backdrop-blur-sm" title="Close">
                  <X className="h-4 w-4" />
                </button>
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="flex flex-col h-[85vh] md:h-[80vh]">
          <div className="relative flex-1 bg-[var(--surface-bg)]/95 flex items-center justify-center group overflow-hidden overscroll-contain">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 to-transparent opacity-50 pointer-events-none" />
            {project.image_url ? (
              <div className="relative w-full h-full flex items-center justify-center" onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <OptimizedImage
                  src={project.image_url}
                  alt={project.title}
                  className="select-none shadow-2xl pointer-events-none w-full h-full object-contain"
                  draggable={false}
                  fallbackIcon={<FolderOpen className="h-20 w-20 text-muted-foreground/30" />}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground/30">
                <FolderOpen className="h-20 w-20" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}
          </div>

          <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-border/10 px-6 py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
