import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Registro do Service Worker para PWA (Progressive Web App)
if (
  'serviceWorker' in navigator &&
  (window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Força atualização imediata para descartar caches legados
        registration.update();
        console.log('Betterdays PWA Service Worker ativo:', registration.scope);
      })
      .catch((error) => {
        console.warn('Falha ao registrar Betterdays PWA Service Worker:', error);
      });
  });
}


