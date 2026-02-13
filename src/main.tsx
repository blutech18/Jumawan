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
    return false;
  }
  
  // Suppress WebSocket connection errors from Supabase
  if (event.message && (
    event.message.includes('WebSocket') ||
    event.message.includes('websocket') ||
    event.message.includes('wss://') ||
    event.message.includes('realtime')
  )) {
    event.preventDefault();
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
