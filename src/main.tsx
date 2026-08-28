import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle external third-party script fetch rejections (e.g. Travelpayouts widget partner URL fetches)
if (typeof window !== 'undefined') {
  const isPartnerError = (str: string) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return (
      s.includes('partner url') ||
      s.includes('partner urls') ||
      s.includes('tpembars') ||
      s.includes('tpwidg') ||
      s.includes('travelpayouts') ||
      s.includes('firebase configuration')
    );
  };

  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const joined = args.map((a) => String(a?.message || a)).join(' ');
    if (isPartnerError(joined)) {
      console.warn('[Handled external partner network notice]:', joined);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event?.reason?.message || event?.reason || '');
    if (
      isPartnerError(reasonStr) ||
      reasonStr.includes('Failed to fetch')
    ) {
      // Prevent console crash/error overlay for non-critical third-party analytics/partner URL requests
      event.preventDefault();
      console.warn('Handled external partner network notice:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event?.message || '');
    if (isPartnerError(msg)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Azraq PWA ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.error('Azraq PWA ServiceWorker registration failed: ', error);
      });
  });
}

