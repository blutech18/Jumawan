/**
 * Performance monitoring utilities
 * Helps identify performance bottlenecks in production
 */

export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Disable performance monitoring in development to reduce console noise
  // Re-enable when specifically debugging performance issues
  const ENABLE_PERF_MONITORING = false;

  // Monitor long tasks (tasks taking > 50ms)
  if (ENABLE_PERF_MONITORING && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only log in development
          if (import.meta.env.DEV && entry.duration > 50) {
            console.warn('Long task detected:', {
              duration: `${entry.duration.toFixed(2)}ms`,
              startTime: `${entry.startTime.toFixed(2)}ms`,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
  }

  // Monitor layout shifts
  if (ENABLE_PERF_MONITORING && 'PerformanceObserver' in window) {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (import.meta.env.DEV && (entry as any).hadRecentInput === false) {
            const clsValue = (entry as any).value;
            if (clsValue > 0.1) {
              console.warn('Layout shift detected:', {
                value: clsValue.toFixed(4),
                sources: (entry as any).sources,
              });
            }
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift API not supported
    }
  }

  // Log initial page load metrics
  if (ENABLE_PERF_MONITORING) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (perfData && import.meta.env.DEV) {
          console.log('Page Load Metrics:', {
            'DNS Lookup': `${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2)}ms`,
            'TCP Connection': `${(perfData.connectEnd - perfData.connectStart).toFixed(2)}ms`,
            'Request Time': `${(perfData.responseStart - perfData.requestStart).toFixed(2)}ms`,
            'Response Time': `${(perfData.responseEnd - perfData.responseStart).toFixed(2)}ms`,
            'DOM Interactive': `${(perfData.domInteractive - perfData.fetchStart).toFixed(2)}ms`,
            'DOM Complete': `${(perfData.domComplete - perfData.fetchStart).toFixed(2)}ms`,
            'Total Load Time': `${(perfData.loadEventEnd - perfData.fetchStart).toFixed(2)}ms`,
          });
        }
      }, 0);
    });
  }
};

/**
 * Debounce function for scroll events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);
