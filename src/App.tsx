import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

import { GlobalGlow } from "@/components/ui/global-glow";

const queryClient = new QueryClient();
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const App = () => (
  <ConvexProvider client={convex}>
    <ReactLenis root options={{
      lerp: 0.1,
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      syncTouch: true,
      syncTouchLerp: 0.06,
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

export default App;
