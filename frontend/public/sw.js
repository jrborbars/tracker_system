/**
 * Service Worker — Betterdays PWA
 * Versão: 1.0.0
 * Suporte offline, cache de assets e instalação PWA no Android, iOS e Desktop.
 */

const CACHE_NAME = 'betterdays-cache-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/og-image.png',
  '/screenshots/desktop-preview.png',
  '/screenshots/mobile-preview.png',
];

// Instalação do Service Worker & Precache de assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Erro ao pré-armazenar alguns assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Não interceptar requisições WebSocket ou requisições não GET
  if (request.method !== 'GET' || url.protocol.startsWith('ws')) {
    return;
  }

  // Requisições para API Backend (Network-First com fallback)
  if (url.port === '8000' || url.pathname.startsWith('/api') || url.pathname.startsWith('/devices') || url.pathname.startsWith('/profile') || url.pathname.startsWith('/messages')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Assets Estáticos (CSS, JS, Fontes, Imagens) — Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline caso não haja rede
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Clique na Notificação Nativa do Sistema
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já existe uma janela aberta, focar nela e navegar
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Se não houver janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Suporte a Mensagens Push do Servidor
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Betterdays';
    const options = {
      body: data.body || 'Nova notificação de monitoramento',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      data: { url: data.url || '/' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Betterdays', {
        body: text,
        icon: '/android-chrome-192x192.png',
      })
    );
  }
});
