"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Award, Calendar, ExternalLink, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, BadgeCheck } from "lucide-react";
import { supabase, Certificate } from "@/lib/supabase";

export function CertificatesSection() {
  const shouldReduceMotion = useReducedMotion();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchCertificates();
    trackPageView();
  }, []);

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

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
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
    if (selectedIndex === null || certificates.length === 0) return;
    setSelectedIndex((prev) => {
      const nextIndex = (Number(prev) - 1 + certificates.length) % certificates.length;
      return nextIndex;
    });
  }, [selectedIndex, certificates.length]);

  const showNext = useCallback(() => {
    if (selectedIndex === null || certificates.length === 0) return;
    setSelectedIndex((prev) => {
      const nextIndex = (Number(prev) + 1) % certificates.length;
      return nextIndex;
    });
  }, [selectedIndex, certificates.length]);

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
      <section id="certificates" className="py-20 relative overflow-hidden" style={{ backgroundColor: 'hsl(227 100% 8% / 0.5)' }}>
        <div className="w-full px-6 md:px-10 lg:px-16 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Certificates & Achievements
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional certifications and achievements that validate my technical expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
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
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                    </div>
                  </div>
                  <div className="h-px w-full bg-border/20" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
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
    <section id="certificates" className="py-20 relative overflow-hidden" style={{ backgroundColor: 'hsl(227 100% 8% / 0.5)' }}>
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
              Certificates & Achievements
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional certifications and achievements that validate my technical expertise
          </p>
        </motion.div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No certificates yet</h3>
            <p className="text-muted-foreground">Certificates will be displayed here once added</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
          >
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="transform-gpu"
                style={{ willChange: "transform, opacity" }}
              >
                <Card className="h-full bg-gradient-card border-border/20 shadow-card hover:shadow-glow transition-all duration-300 group overflow-hidden">
                  {/* Certificate Image (no inner padding, object-cover like Featured Projects) */}
                  {cert.image_url ? (
                    <div className="relative h-48 overflow-hidden cursor-zoom-in will-change-transform transform-gpu" onClick={() => openModalAt(index)}>
                      <OptimizedImage
                        src={cert.image_url}
                        alt={`${cert.title} certificate`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackIcon={<Award className="h-12 w-12 text-muted-foreground" />}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded-md bg-black/40 border border-border/30 text-white/80">
                        Click to view
                      </div>
                    </div>
                  ) : (
                    // Maintain standard certificate aspect ratio for placeholder only
                    <div className="relative w-full aspect-[11/8.5] overflow-hidden flex items-center justify-center bg-muted/20">
                      <div className="absolute inset-4 bg-white/80 rounded-md border border-border/30" />
                      <Award className="h-12 w-12 text-muted-foreground relative z-10" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {cert.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-primary font-medium">{cert.issuer}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-border/20 mb-4" />
                    {/* Professional meta */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
                      <span className="rounded-md bg-primary/5 px-2 py-1 border border-border/30">
                        {new Date(cert.issue_date).getFullYear()}
                      </span>
                      <span className="rounded-md bg-indigo-500/10 text-indigo-400 px-2 py-1 border border-indigo-500/20">
                        {cert.issuer}
                      </span>
                      {cert.credential_url && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-1 border border-emerald-500/20">
                          <BadgeCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {cert.credential_id && (
                        <span className="rounded-md bg-primary/5 px-2 py-1 border border-primary/20">
                          ID: {cert.credential_id}
                        </span>
                      )}
                    </div>
                    
                    {cert.description && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {cert.description}
                      </p>
                    )}
                    
                    {cert.credential_id && (
                      <div className="text-sm text-muted-foreground mb-4">
                        <span className="font-medium">Credential ID:</span> {cert.credential_id}
                      </div>
                    )}
                    
                    {/* Action buttons removed by request */}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        {/* Modal mount */}
        <CertificatesModal
          isOpen={isModalOpen}
          onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}
          certificates={certificates}
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

// Enhanced Modal mounted once for controlled navigation across certificates
export function CertificatesModal({
  isOpen,
  onOpenChange,
  certificates,
  selectedIndex,
  onPrev,
  onNext,
  isZoomed,
  setIsZoomed,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  certificates: Certificate[];
  selectedIndex: number | null;
  onPrev: () => void;
  onNext: () => void;
  isZoomed: boolean;
  setIsZoomed: (z: boolean) => void;
}) {
  const cert = selectedIndex !== null ? certificates[selectedIndex] : null;
  if (!cert) return null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-[92vw] md:w-[90vw] max-w-[95vw] sm:max-w-[92vw] md:max-w-[900px] lg:max-w-[1100px] max-h-[86vh] p-0 overflow-hidden sm:rounded-xl shadow-2xl ring-1 ring-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <AlertDialogHeader className="px-2 py-1 sm:px-3 sm:py-2 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <AlertDialogTitle className="text-xs sm:text-sm font-medium truncate">
              {cert.title}
            </AlertDialogTitle>
            <div className="flex items-center gap-1 flex-nowrap overflow-x-auto">
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title="Verify">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {cert.image_url && (
                <a href={cert.image_url} download className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title="Download">
                  <Download className="h-4 w-4" />
                </a>
              )}
              <button onClick={() => setIsZoomed(!isZoomed)} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title={isZoomed ? 'Zoom out' : 'Zoom in'}>
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </button>
              <AlertDialogCancel asChild>
                <button className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-muted/40 hover:bg-muted/60 text-foreground/80 hover:text-foreground transition-colors" title="Close">
                  <X className="h-4 w-4" />
                </button>
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="relative w-full">
          <div className={`relative w-full h-[70vh] sm:h-[72vh] md:h-[65vh] lg:h-[70vh] bg-background border-t border-border/30 overflow-hidden`}> 
            {cert.image_url ? (
              <OptimizedImage
                src={cert.image_url}
                alt={`${cert.title} certificate full size`}
                className={`w-full h-full ${isZoomed ? 'object-cover' : 'object-contain'}`}
                fallbackIcon={<Award className="h-12 w-12 text-muted-foreground" />}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Award className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {/* Navigation controls */}
            <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-black/40 hover:bg-black/55 text-white border border-white/20">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-black/40 hover:bg-black/55 text-white border border-white/20">
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-2 py-0.5 rounded bg-black/45 text-white border border-white/20">
              {(Number(selectedIndex) + 1)} / {certificates.length}
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

