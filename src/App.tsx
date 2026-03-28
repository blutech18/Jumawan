import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import * as React from "react";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import { initPerformanceMonitoring } from "@/lib/performance";

import { GlobalGlow } from "@/components/ui/global-glow";

const queryClient = new QueryClient();
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const App = () => {
  // Initialize performance monitoring in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      initPerformanceMonitoring();
    }
  }, []);

  return (
    <ConvexProvider client={convex}>
      <ReactLenis root options={{
        lerp: 0.08,
        duration: 1.6,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        syncTouch: false,
        infinite: false,
        autoResize: true,
        prevent: (node) => node.classList.contains('no-smooth-scroll'),
      }}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GlobalGlow />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Portfolio />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ReactLenis>
    </ConvexProvider>
  );
};

export default App;
