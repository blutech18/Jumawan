import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for script loading errors (e.g., Vercel Analytics)
window.addEventListener('error', (event) => {
  // Suppress errors from Vercel Analytics or other third-party scripts
  if (event.filename && (
    event.filename.includes('webpage_content_reporter') ||
    event.filename.includes('vercel') ||
    event.filename.includes('analytics')
  )) {
    event.preventDefault();
    console.warn('Suppressed script error:', event.filename);
    return false;
  }
}, true);

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Suppress network errors from Supabase when offline/unreachable
  if (event.reason?.message?.includes('Failed to fetch') ||
      event.reason?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
    event.preventDefault();
    console.warn('Suppressed network error:', event.reason);
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
