import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress Vite WebSocket connection errors
const suppressWebSocketError = (event: ErrorEvent | PromiseRejectionEvent) => {
  const errorMsg = 'reason' in event ? (event as PromiseRejectionEvent).reason?.message : (event as ErrorEvent).message;
  const reasonStr = 'reason' in event ? String((event as PromiseRejectionEvent).reason) : String(event);
  if (
    (errorMsg && typeof errorMsg === 'string' && errorMsg.includes('WebSocket')) ||
    (reasonStr && typeof reasonStr === 'string' && reasonStr.includes('WebSocket'))
  ) {
    event.preventDefault();
  }
};

window.addEventListener('error', suppressWebSocketError);
window.addEventListener('unhandledrejection', suppressWebSocketError);

// Also intercept console.error for the specific Vite error
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('[vite] failed to connect to websocket')) {
    return; // Ignore
  }
  originalConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

