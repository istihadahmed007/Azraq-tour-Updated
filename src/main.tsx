import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle external third-party script fetch rejections (e.g. Travelpayouts widget partner URL fetches)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event?.reason?.message || event?.reason || '');
    if (
      reasonStr.includes('partner URLs') ||
      reasonStr.includes('Failed to fetch') ||
      reasonStr.includes('tpwidg') ||
      reasonStr.includes('travelpayouts')
    ) {
      // Prevent console crash/error overlay for non-critical third-party analytics/partner URL requests
      event.preventDefault();
      console.warn('Handled external partner network notice:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event?.message || '');
    if (msg.includes('partner URLs') || msg.includes('tpwidg')) {
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

