"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Award, Calendar, ExternalLink, X, Download, BadgeCheck, Building2, Trophy, Medal } from "lucide-react";
import { supabase, Certificate } from "@/lib/supabase";
import { useCertificateStore } from "@/stores/useCertificateStore";

export function CertificatesSection() {
  const shouldReduceMotion = useReducedMotion();
  const { certificates, loading, fetchCertificates, subscribeToChanges } = useCertificateStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetchCertificates();
    trackPageView();

    // Subscribe to realtime changes
    const unsubscribe = subscribeToChanges();

    return () => {
      unsubscribe();
    };
  }, [fetchCertificates, subscribeToChanges]);

  const trackPageView = async () => {
    try {
      await supabase
        .from('analytics')
        .insert([{
          event_type: 'page_view',
          page_url: '/certificates',
          event_data: { section: 'certificates' }
        }]);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const openModalAt = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    setZoomLevel(1);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setZoomLevel(1);
    setTimeout(() => {
      setSelectedIndex(null);
    }, 300);
  }, []);



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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  }), []);

  if (loading) {
    return (
      <section id="certificates" className="py-20 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-16 mx-auto w-fit">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="text-cyan-400">
                Certificates & Achievements
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              Professional certifications that validate my technical expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, idx) => (
              <Card key={idx} className="h-full bg-gradient-card border-border/20 shadow-card overflow-hidden">
                <div className="relative h-48 w-full">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/5" />
                      <Skeleton className="h-4 w-2/5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
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
    <section id="certificates" className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-16 mx-auto w-fit">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              <span className="text-cyan-400">
                Certificates & Achievements
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center font-medium">
              Professional certifications that validate my technical expertise
            </p>
          </motion.div>

          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No certificates yet</h3>
              <p className="text-muted-foreground">Certificates will be displayed here once added</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {certificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  variants={itemVariants}
                  className="transform-gpu"
                  style={{ willChange: "transform, opacity" }}
                >
                  <div
                    className="h-full relative border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] overflow-hidden group"
                  >
                    {/* Accent gradient top bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                    {/* Type Overlay */}
                    <div className="absolute top-3 left-3 z-30 pointer-events-none">
                      <Badge variant="secondary" className={`backdrop-blur-md border-0 shadow-lg ${cert.type === 'recognition'
                        ? 'bg-primary/90 text-primary-foreground shadow-primary/20'
                        : 'bg-secondary/90 text-secondary-foreground shadow-secondary/20'
                        }`}>
                        {cert.type === 'recognition' ? (
                          <Trophy className="h-3.5 w-3.5 mr-1.5" />
                        ) : (
                          <Medal className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        <span className="capitalize font-medium text-xs">{cert.type || 'Participation'}</span>
                      </Badge>
                    </div>

                    {/* Certificate Image */}
                    {cert.image_url ? (
                      <button
                        type="button"
                        className="relative h-48 w-full overflow-hidden will-change-transform transform-gpu text-left select-none"
                        onClick={() => openModalAt(index)}
                        aria-label={`View ${cert.title} certificate`}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <OptimizedImage
                          src={cert.image_url}
                          alt={`${cert.title} certificate`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-black/5"
                          draggable={false}
                          fallbackIcon={<Award className="h-12 w-12 text-muted-foreground" />}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-10 transition-opacity duration-500" />
                      </button>
                    ) : (
                      <div className="relative h-48 w-full overflow-hidden flex items-center justify-center bg-muted/10 border-b border-border/10">
                        <Award className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Header with Icon */}
                      <div className="flex flex-col gap-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2">
                          {/* Left Column: Title & Issuer - Span 7 */}
                          <div className="md:col-span-7 flex flex-col gap-3">
                            <h3 className="text-xl font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 leading-tight mb-2">
                              {cert.title}
                            </h3>

                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-sm text-foreground/90 font-medium">
                                <Building2 className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">{cert.issuer}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                                <span className="whitespace-nowrap">
                                  {new Date(cert.issue_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-5 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 mt-2 md:mt-0">
                            <div className="flex gap-4">
                              {cert.credential_url && (
                                <Badge variant="secondary" className="shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] sm:text-xs px-2 py-0.5">
                                  <BadgeCheck className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {cert.description && (
                        <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed">
                          {cert.description}
                        </p>
                      )}

                      {/* Action Button */}
                      <div className="flex gap-3 mt-auto pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-300"
                          onClick={() => openModalAt(index)}
                        >
                          View Details
                        </Button>
                        {cert.credential_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 border-border/40 hover:border-primary/40 hover:bg-primary/5"
                            asChild
                          >
                            <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modal */}
        < CertificatesModal
          isOpen={isModalOpen}
          onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}
          certificates={certificates}
          selectedIndex={selectedIndex}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </div >
    </section >
  );
}

import { useLenis } from 'lenis/react';

// Enhanced Modal
export function CertificatesModal({
  isOpen,
  onOpenChange,
  certificates,
  selectedIndex,
  zoomLevel,
  setZoomLevel,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  certificates: Certificate[];
  selectedIndex: number | null;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
}) {
  const cert = selectedIndex !== null ? certificates[selectedIndex] : null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      lenis?.start();
    };
  }, [isOpen, lenis]);

  useEffect(() => {
    if (!isOpen || zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, zoomLevel, cert]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 1), 4);
    setZoomLevel(newZoom);
    if (newZoom === 1) setPosition({ x: 0, y: 0 });
  }, [zoomLevel, setZoomLevel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    // Magnet effect: Snap back to center
    setTimeout(() => {
      setPosition({ x: 0, y: 0 });
    }, 50); // Small delay for feel
  }, []);

  if (!cert) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[1000px] p-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-cyan-500/20 bg-zinc-950/90 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl border-none">

        {/* Header - Transparent and Minimal */}
        <AlertDialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-start justify-between gap-4 pointer-events-auto">
            {/* Title with consistent typography */}
            <AlertDialogTitle className="text-base md:text-lg font-bold text-white/90 tracking-tight drop-shadow-md line-clamp-1 mt-1">
              {cert.title}
            </AlertDialogTitle>

            {/* Action Buttons - Premium styling */}
            <div className="flex items-center gap-2">
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                  title="Verify Credential"
                >
                  <ExternalLink className="h-4 w-4" />
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

        {/* Content Container */}
        <div className="flex flex-col h-[85vh] md:h-[80vh]">
          {/* Image Area - Dark neutral background */}
          <div
            ref={containerRef}
            className={`relative flex-1 bg-black/95 flex items-center justify-center group overflow-hidden overscroll-contain ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onDoubleClick={() => setZoomLevel(zoomLevel > 1 ? 1 : 2)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 to-transparent opacity-50 pointer-events-none" />

            {cert.image_url ? (
              <div
                className="relative w-full h-full flex items-center justify-center"
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <OptimizedImage
                  src={cert.image_url}
                  alt={`${cert.title} certificate`}
                  className={`select-none shadow-2xl pointer-events-none ${isDragging ? '' : 'transition-transform duration-700'}`}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transitionTimingFunction: isDragging ? 'none' : 'cubic-bezier(0.19, 1, 0.22, 1)'
                  }}
                  draggable={false}
                  fallbackIcon={<Award className="h-20 w-20 text-muted-foreground/30" />}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground/30">
                <Award className="h-20 w-20" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}

            {/* Zoom indicator */}
            {zoomLevel > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                {Math.round(zoomLevel * 100)}%
              </div>
            )}
          </div>

          {/* Footer - Glassmorphism details panel */}
          <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-white/5 px-6 py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground/90 font-medium">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  {cert.issuer}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-cyan-400/70" />
                  {new Date(cert.issue_date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>

                {cert.credential_id && (
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    <BadgeCheck className="h-3.5 w-3.5 text-cyan-400/50" />
                    ID: {cert.credential_id}
                  </div>
                )}
              </div>

              {cert.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  {cert.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
