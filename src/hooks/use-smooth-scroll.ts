import { useCallback } from "react";
import { useLenis } from "lenis/react";

/**
 * Provides a consistent, Lenis-powered smooth scroll function
 * for navigating to sections or the top of the page.
 */
export function useSmoothScroll() {
  const lenis = useLenis();

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => {
      const { offset = 0, duration } = options ?? {};

      if (lenis) {
        lenis.scrollTo(target, {
          offset,
          ...(duration != null ? { duration } : {}),
        });
      } else {
        // Fallback for edge cases where Lenis isn't available
        if (typeof target === "number") {
          window.scrollTo({ top: Math.max(target + offset, 0), behavior: "smooth" });
        } else {
          const el = typeof target === "string" ? document.getElementById(target.replace("#", "")) : target;
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
          }
        }
      }
    },
    [lenis]
  );

  const scrollToTop = useCallback(
    (options?: { duration?: number }) => {
      scrollTo(0, { offset: 0, ...options });
    },
    [scrollTo]
  );

  const scrollToSection = useCallback(
    (sectionId: string, options?: { offset?: number; duration?: number }) => {
      const id = sectionId.replace("#", "");
      const el = document.getElementById(id);
      if (!el) return;

      // Account for fixed header height
      const header = document.querySelector("header");
      const headerHeight = (header as HTMLElement | null)?.offsetHeight ?? 0;
      const defaultOffset = -headerHeight - 8;

      scrollTo(el, { offset: options?.offset ?? defaultOffset, duration: options?.duration });
    },
    [scrollTo]
  );

  return { scrollTo, scrollToTop, scrollToSection, lenis };
}
