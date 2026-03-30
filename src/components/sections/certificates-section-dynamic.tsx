"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
import { Award, Calendar, ExternalLink, X, BadgeCheck, Building2, Trophy, Medal, ZoomIn, ZoomOut } from "lucide-react";
import { useCertificateStore, Certificate } from "@/stores/useCertificateStore";
import { convexClient } from '@/lib/convexClient';
import { api } from '../../../convex/_generated/api';

export function CertificatesSection() {
  const shouldReduceMotion = useReducedMotion();
  const { certificates, loading, fetchCertificates, subscribeToChanges } = useCertificateStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recognition' | 'participation'>('all');
  const [verificationImageUrl, setVerificationImageUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollLeft = useRef(0);

  useEffect(() => {
    fetchCertificates();
    trackPageView();
    const unsubscribe = subscribeToChanges();
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Sort & filter certificates: "all" shows recognition first then participation, each by order_index
  const filteredCertificates = useMemo(() => {
    if (activeFilter === 'recognition') {
      return certificates
        .filter(c => c.type === 'recognition')
        .sort((a, b) => a.order_index - b.order_index);
    }
    if (activeFilter === 'participation') {
      return certificates
        .filter(c => c.type === 'participation')
        .sort((a, b) => a.order_index - b.order_index);
    }
    // "all": recognition first (sorted), then participation (sorted)
    const recognition = certificates
      .filter(c => c.type === 'recognition')
      .sort((a, b) => a.order_index - b.order_index);
    const participation = certificates
      .filter(c => c.type === 'participation')
      .sort((a, b) => a.order_index - b.order_index);
    const others = certificates
      .filter(c => c.type !== 'recognition' && c.type !== 'participation')
      .sort((a, b) => a.order_index - b.order_index);
    return [...recognition, ...participation, ...others];
  }, [certificates, activeFilter]);

  // Restore scroll position after certificates re-render
  useEffect(() => {
    if (scrollRef.current && filteredCertificates.length > 0 && savedScrollLeft.current > 0) {
      scrollRef.current.scrollLeft = savedScrollLeft.current;
    }
  }, [filteredCertificates]);

  // Reset carousel to first card when filter changes
  useEffect(() => {
    setCurrentCard(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeFilter]);

  const cardsPerPage = isMobile ? 1 : 2;
  const totalPages = Math.ceil(filteredCertificates.length / cardsPerPage);
  const currentPage = Math.floor(currentCard / cardsPerPage);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || filteredCertificates.length === 0) return;
    const el = scrollRef.current;
    savedScrollLeft.current = el.scrollLeft;
    const cardWidth = el.scrollWidth / filteredCertificates.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setCurrentCard(Math.max(0, Math.min(idx, filteredCertificates.length - 1)));
  }, [filteredCertificates.length]);

  const scrollToCard = (idx: number) => {
    if (!scrollRef.current || filteredCertificates.length === 0) return;
    const clamped = Math.max(0, Math.min(idx, filteredCertificates.length - 1));
    const el = scrollRef.current;
    const cardWidth = el.scrollWidth / filteredCertificates.length;
    el.scrollTo({ left: cardWidth * clamped, behavior: 'smooth' });
  };

  const scrollToPage = (page: number) => {
    scrollToCard(page * cardsPerPage);
  };

  const goToPrevPage = () => { if (currentPage > 0) scrollToPage(currentPage - 1); };
  const goToNextPage = () => { if (currentPage < totalPages - 1) scrollToPage(currentPage + 1); };

  // Drag/swipe handling — works for both mouse (desktop) and touch (mobile)
  const isDraggingScroll = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragStartCard = useRef(0);
  const momentumRaf = useRef<number>(0);

  const startDrag = (clientX: number) => {
    if (!scrollRef.current) return;
    cancelAnimationFrame(momentumRaf.current);
    isDraggingScroll.current = true;
    hasDragged.current = false;
    dragStartX.current = clientX;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    dragStartCard.current = currentCard;
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.style.scrollBehavior = 'auto';
    if (!isMobile) scrollRef.current.style.cursor = 'grabbing';
  };

  const moveDrag = (clientX: number) => {
    if (!isDraggingScroll.current || !scrollRef.current) return;
    const walk = clientX - dragStartX.current;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const endDrag = (clientX: number) => {
    if (!isDraggingScroll.current || !scrollRef.current) return;
    isDraggingScroll.current = false;
    const el = scrollRef.current;
    el.style.cursor = '';
    el.style.scrollSnapType = '';
    el.style.scrollBehavior = '';

    const swipeDist = clientX - dragStartX.current;
    const threshold = 30;
    const startPage = Math.floor(dragStartCard.current / cardsPerPage);

    if (Math.abs(swipeDist) > threshold) {
      const targetPage = swipeDist < 0
        ? Math.min(startPage + 1, totalPages - 1)
        : Math.max(startPage - 1, 0);
      scrollToPage(targetPage);
    } else {
      scrollToPage(startPage);
    }
  };

  const onMouseDown = (e: ReactMouseEvent) => {
    if (isMobile) return;
    startDrag(e.pageX);
  };
  const onMouseMove = (e: ReactMouseEvent) => {
    if (!isDraggingScroll.current) return;
    e.preventDefault();
    moveDrag(e.pageX);
  };
  const onMouseUp = (e: ReactMouseEvent) => {
    endDrag(e.pageX);
  };

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
        page_url: '/certificates',
        event_data: { section: 'certificates' },
      });
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  };

  const openModalAt = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
    setZoomLevel(1);
  }, []);

  const safeOpenModal = useCallback((index: number) => {
    if (hasDragged.current) { hasDragged.current = false; return; }
    openModalAt(index);
  }, [openModalAt]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setZoomLevel(1);
    setTimeout(() => { setSelectedIndex(null); }, 150);
  }, []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: shouldReduceMotion ? 0 : 0.18 } },
  }), [shouldReduceMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 80, damping: 12 } },
  }), []);

  // --- Shared card renderer ---
  const renderCard = (cert: Certificate, index: number) => (
    <div
      onClick={() => safeOpenModal(index)}
      className={`h-full relative border border-border/50 rounded-xl transition-all duration-500 ease-in-out hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.1)] overflow-hidden cursor-pointer group ${isMobile ? '' : ''}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

      <div className="relative h-[295px] sm:h-[359px] w-full overflow-hidden">
        {cert.image_url ? (
          <>
            <OptimizedImage
              src={cert.image_url}
              alt={`${cert.title} certificate`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-muted/5"
              draggable={false}
              fallbackIcon={<Award className="h-12 w-12 text-muted-foreground" />}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-overlay-from)] via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/10">
            <Award className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge variant="secondary" className={`backdrop-blur-md border-0 shadow-lg text-[10px] sm:text-xs px-2 py-0.5 ${cert.type === 'recognition' ? 'bg-primary/90 text-primary-foreground' : 'bg-secondary/90 text-secondary-foreground'}`}>
            {cert.type === 'recognition' ? <Trophy className="h-3 w-3 mr-1" /> : <Medal className="h-3 w-3 mr-1" />}
            <span className="capitalize font-medium">{cert.type || 'Participation'}</span>
          </Badge>
        </div>
      </div>

      <div className="p-3.5 sm:p-5 h-[120px] sm:h-[140px] flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2 flex-1">
            {cert.title}
          </h3>
          {(cert.credential_url || cert.verification_image_url) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (cert.verification_image_url) {
                  setVerificationImageUrl(cert.verification_image_url);
                } else if (cert.credential_url) {
                  window.open(cert.credential_url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="shrink-0 inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_8px_rgba(34,211,238,0.15)]"
            >
              <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Verify
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground/70 mt-2 sm:mt-3">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3 text-primary/60 shrink-0" />{cert.issuer}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-primary/60 shrink-0" />
            {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        {cert.description && (
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mt-auto">{cert.description}</p>
        )}
      </div>
    </div>
  );

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
    <>
      <section id="certificates" className="py-24 relative overflow-hidden">
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
            <>
              {/* Filter buttons + See All */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                {([
                  { key: 'all', label: 'All', icon: Award },
                  { key: 'recognition', label: 'Recognition', icon: Trophy },
                  { key: 'participation', label: 'Participation', icon: Medal },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveFilter(key)}
                    className={`text-xs sm:text-sm transition-all duration-300 ${
                      activeFilter === key
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                        : 'border-border/40 hover:border-cyan-400/40 hover:bg-cyan-400/5 text-muted-foreground hover:text-cyan-400'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                    {label}
                    <span className="ml-1.5 text-[10px] sm:text-xs opacity-60">
                      {key === 'all'
                        ? certificates.length
                        : certificates.filter(c => c.type === key).length}
                    </span>
                  </Button>
                ))}

                <div className="w-px h-5 bg-border/30 mx-1 hidden sm:block" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllModal(true)}
                  className="border-border/40 hover:border-cyan-400/40 hover:bg-cyan-400/5 text-muted-foreground hover:text-cyan-400 transition-all duration-300 text-xs sm:text-sm"
                >
                  <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                  See All
                </Button>
              </motion.div>

              {/* Unified swipeable carousel — 1 card mobile, 2 cards desktop */}
              {filteredCertificates.length === 0 ? (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No {activeFilter} certificates found</p>
                </motion.div>
              ) : (
              <motion.div variants={itemVariants} className="relative overflow-hidden -mx-4 md:-mx-6">
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
                  {filteredCertificates.map((cert, index) => (
                    <div
                      key={cert.id}
                      className="shrink-0"
                      style={{ width: isMobile ? 'min(80vw, 340px)' : 'calc(50% - 12px)' }}
                    >
                      {renderCard(cert, index)}
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
              )}
            </>
          )}
        </motion.div>

        {/* Certificate detail modal */}
        <CertificatesModal
          isOpen={isModalOpen}
          onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}
          certificates={filteredCertificates}
          selectedIndex={selectedIndex}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          onVerificationImage={(url) => setVerificationImageUrl(url)}
        />

        {/* See All modal — always shows all certificates with proper sorting */}
        <SeeAllCertificatesModal
          isOpen={showAllModal}
          onOpenChange={setShowAllModal}
          certificates={filteredCertificates}
          onSelect={(index) => {
            openModalAt(index);
          }}
        />
      </div>
    </section>

      <VerificationImageModal
        imageUrl={verificationImageUrl}
        onClose={() => setVerificationImageUrl(null)}
      />
    </>
  );
}

import { useLenis } from 'lenis/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// See All Certificates Modal — file-manager style grid
function SeeAllCertificatesModal({
  isOpen,
  onOpenChange,
  certificates,
  onSelect,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  certificates: Certificate[];
  onSelect: (index: number) => void;
}) {
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => { lenis?.start(); document.body.style.overflow = ''; };
  }, [isOpen, lenis]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-3xl border-[var(--border-subtle)] bg-[var(--surface-modal)] backdrop-blur-2xl !p-0 !gap-0 [&>button]:z-20 rounded-2xl md:rounded-3xl">
        <div className="flex flex-col h-[85svh] sm:h-[75vh] overflow-hidden rounded-2xl md:rounded-3xl" data-lenis-prevent>
          <div className="relative shrink-0 px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-[var(--border-subtle)] bg-[var(--surface-bg-alt)]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent rounded-t-2xl md:rounded-t-3xl" />
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                All Certificates ({certificates.length})
              </DialogTitle>
            </DialogHeader>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 bg-[var(--surface-bg-alt)]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {certificates.map((cert, index) => (
              <button
                key={cert.id}
                type="button"
                onClick={() => onSelect(index)}
                className="group text-left rounded-xl border border-border/50 overflow-hidden hover:border-cyan-400/50 hover:shadow-[0_0_8px_rgba(34,211,238,0.1)] transition-all duration-300"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/10">
                  {cert.image_url ? (
                    <OptimizedImage
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      draggable={false}
                      fallbackIcon={<Award className="h-8 w-8 text-muted-foreground/30" />}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {cert.type && (
                    <div className="absolute top-1.5 left-1.5">
                      <Badge variant="secondary" className={`backdrop-blur-md border-0 text-[8px] px-1.5 py-0 ${cert.type === 'recognition' ? 'bg-primary/90 text-primary-foreground' : 'bg-secondary/90 text-secondary-foreground'}`}>
                        {cert.type === 'recognition' ? <Trophy className="h-2.5 w-2.5 mr-0.5" /> : <Medal className="h-2.5 w-2.5 mr-0.5" />}
                        <span className="capitalize">{cert.type}</span>
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-3 h-[72px] sm:h-[76px] flex flex-col justify-start">
                  <p className="text-[11px] sm:text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {cert.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 mt-1 truncate">
                    {cert.issuer}
                  </p>
                </div>
              </button>
            ))}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Verification Image Modal — same visual design as resume modal
function VerificationImageModal({
  imageUrl,
  onClose,
}: {
  imageUrl: string | null;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (imageUrl) { lenis?.stop(); document.body.style.overflow = 'hidden'; }
    else { lenis?.start(); document.body.style.overflow = ''; }
    return () => { lenis?.start(); document.body.style.overflow = ''; };
  }, [imageUrl, lenis]);

  // Esc to close
  useEffect(() => {
    if (!imageUrl) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [imageUrl, onClose]);

  useEffect(() => { setZoom(1); setPos({ x: 0, y: 0 }); }, [imageUrl]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); e.stopPropagation();
    const next = Math.min(Math.max(zoom + (e.deltaY > 0 ? -0.1 : 0.1), 1), 4);
    setZoom(next);
    if (next === 1) setPos({ x: 0, y: 0 });
  }, [zoom]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  }, [pos]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    e.preventDefault();
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const stopDrag = useCallback(() => {
    setDragging(false);
    setTimeout(() => setPos({ x: 0, y: 0 }), 50);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          key="verification-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5"
          style={{ background: 'rgba(5, 10, 24, 0.85)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Blur layer — separate so card content is never blurred on mobile */}
          <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} />

          <motion.div
            key="verification-card"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-4xl flex flex-col rounded-xl sm:rounded-2xl"
            style={{
              background: 'var(--surface-modal)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-modal)',
              height: 'min(85dvh, 85vh)',
              overflow: 'hidden',
            }}
          >
            {/* Floating header */}
            <div
              className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, var(--modal-header-bg, hsl(220 40% 6% / 0.95)) 0%, transparent 100%)' }}
            >
              <div className="flex items-center gap-2.5 pointer-events-auto">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(202 85% 55% / 0.15)', border: '1px solid hsl(202 85% 55% / 0.25)' }}
                >
                  <BadgeCheck className="w-3.5 h-3.5" style={{ color: 'hsl(202 85% 65%)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground/90 leading-tight">Verification Proof</p>
                  <p className="text-[10px] sm:text-[11px] text-foreground/50">Certificate verification image</p>
                </div>
              </div>
              <div className="pointer-events-auto">
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:bg-muted/10"
                  style={{ background: 'var(--modal-btn-bg)', border: '1px solid var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
                >
                  <X className="w-4 h-4 text-foreground/70" />
                </button>
              </div>
            </div>

            {/* Image / zoom area */}
            <div
              className={`relative flex-1 min-h-0 bg-[var(--surface-bg)] flex items-center justify-center overflow-hidden overscroll-contain ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  setDragging(true);
                  setDragStart({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y });
                }
              }}
              onTouchMove={(e) => {
                if (!dragging || e.touches.length !== 1) return;
                e.preventDefault();
                setPos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
              }}
              onTouchEnd={stopDrag}
              onDoubleClick={() => { const next = zoom > 1 ? 1 : 2; setZoom(next); if (next === 1) setPos({ x: 0, y: 0 }); }}
            >
              {/* Radial glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, hsl(202 85% 30% / 0.06) 0%, transparent 70%)' }} />

              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{ padding: '52px 12px 48px' }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <img
                  src={imageUrl}
                  alt="Verification proof"
                  draggable={false}
                  className={`select-none max-w-full max-h-full object-contain shadow-2xl pointer-events-none ${dragging ? '' : 'transition-transform duration-700'}`}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transitionTimingFunction: dragging ? 'none' : 'cubic-bezier(0.19, 1, 0.22, 1)',
                  }}
                />
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => { const z = Math.max(zoom - 0.25, 1); setZoom(z); if (z === 1) setPos({ x: 0, y: 0 }); }}
                  className="p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 border hover:bg-muted/10"
                  style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div
                  className="text-xs px-3 py-1.5 rounded-full border pointer-events-none min-w-[52px] text-center backdrop-blur-sm"
                  style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
                >
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(zoom + 0.25, 4))}
                  className="p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 border hover:bg-muted/10"
                  style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Enhanced Modal
export function CertificatesModal({
  isOpen,
  onOpenChange,
  certificates,
  selectedIndex,
  zoomLevel,
  setZoomLevel,
  onVerificationImage,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  certificates: Certificate[];
  selectedIndex: number | null;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  onVerificationImage?: (url: string) => void;
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
      <AlertDialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[1000px] p-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl ring-1 ring-cyan-500/20 bg-[var(--surface-modal)] border-none">

        {/* Header - Transparent and Minimal */}
        <AlertDialogHeader className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-[var(--modal-header-bg)] to-transparent pointer-events-none">
          <div className="flex items-start justify-between gap-4 pointer-events-auto">
            {/* Title with consistent typography */}
            <AlertDialogTitle className="text-base md:text-lg font-bold text-foreground/90 tracking-tight drop-shadow-md line-clamp-1 mt-1">
              {cert.title}
            </AlertDialogTitle>

            {/* Action Buttons - Premium styling */}
            <div className="flex items-center gap-2">
              <AlertDialogCancel asChild>
                <button
                  className="p-2 rounded-full transition-all duration-300 backdrop-blur-sm hover:bg-muted/10 border"
                  style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
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
            className={`relative flex-1 bg-[var(--surface-bg)] flex items-center justify-center group overflow-hidden overscroll-contain ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                  className={`select-none shadow-2xl pointer-events-none w-full h-full object-contain ${isDragging ? '' : 'transition-transform duration-700'}`}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
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

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => { const z = Math.max(zoomLevel - 0.25, 1); setZoomLevel(z); if (z === 1) setPosition({ x: 0, y: 0 }); }}
                className="p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 border hover:bg-muted/10"
                style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <div
                className="text-xs px-3 py-1.5 rounded-full border pointer-events-none min-w-[52px] text-center backdrop-blur-sm"
                style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
              >
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                type="button"
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 4))}
                className="p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 border hover:bg-muted/10"
                style={{ background: 'var(--modal-btn-bg)', borderColor: 'var(--modal-btn-border)', color: 'var(--modal-btn-text)' }}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Footer - Glassmorphism details panel */}
          <div className="shrink-0 bg-background border-t border-border/10 px-6 py-5 md:px-8 md:py-6">
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
                  <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs bg-muted/5 px-2 py-0.5 rounded border border-border/10">
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
