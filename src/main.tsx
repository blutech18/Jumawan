import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for script loading errors (e.g., Vercel Analytics)
// Note: Primary error handler is in index.html <head> to catch errors earlier
window.addEventListener('error', (event) => {
  const filename = String(event.filename || '');
  const message = String(event.message || '');
  
  // Suppress errors from Vercel Analytics webpage_content_reporter script
  if (
    filename.includes('webpage_content_reporter') ||
    filename.includes('vercel') && message.includes('Unexpected token') ||
    (filename.includes('analytics') && message.includes('Unexpected token')) ||
    (message.includes('Unexpected token') && message.includes('export') && (filename.includes('vercel') || filename.includes('analytics')))
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
