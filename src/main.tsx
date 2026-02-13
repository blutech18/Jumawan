import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for script loading errors (e.g., Vercel Analytics)
window.addEventListener('error', (event) => {
  const filename = event.filename || '';
  const message = event.message || '';
  
  // Suppress errors from Vercel Analytics webpage_content_reporter script
  if (
    filename.includes('webpage_content_reporter') ||
    filename.includes('vercel') ||
    (filename.includes('analytics') && message.includes('Unexpected token')) ||
    (message.includes('Unexpected token') && message.includes('export') && filename.includes('vercel'))
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  // Suppress WebSocket connection errors from Supabase
  if (
    message.includes('WebSocket') ||
    message.includes('websocket') ||
    message.includes('wss://') ||
    message.includes('realtime')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || reason?.toString() || '';
  
  // Suppress network errors from Supabase when offline/unreachable
  if (
    message.includes('Failed to fetch') ||
    message.includes('ERR_NAME_NOT_RESOLVED') ||
    message.includes('NetworkError') ||
    message.includes('WebSocket') ||
    message.includes('websocket') ||
    message.includes('realtime')
  ) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
