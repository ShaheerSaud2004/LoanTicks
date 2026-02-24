// Service Worker for LOANATICKS PWA
const CACHE_NAME = 'loanticks-v3';
const urlsToCache = [
  '/',
  '/login',
  '/customer/dashboard',
  '/customer/loan-application',
  '/logo.jpg',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Do not intercept navigation requests (page loads). Let the browser handle
  // the main document and redirects (e.g. www -> non-www) to avoid "redirect
  // mode is not follow" network errors that can make the site show as invalid.
  if (request.mode === 'navigate') {
    return;
  }

  // Skip caching for API routes and external resources
  if (
    request.url.includes('/api/') ||
    request.url.includes('_next/') ||
    request.url.startsWith('chrome-extension://') ||
    request.url.startsWith('moz-extension://')
  ) {
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch with redirect mode set to 'follow' to handle redirects
        return fetch(request, {
          redirect: 'follow',
        })
          .then((response) => {
            // Don't cache redirects or non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic' || response.redirected) {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch((error) => {
                console.error('Service Worker: Cache put failed', error);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            // Return offline page if available for document requests
            if (request.destination === 'document') {
              return caches.match('/');
            }
            // For other requests, return the error
            throw error;
          });
      })
      .catch((error) => {
        console.error('Service Worker: Cache match failed', error);
        // Fallback to network fetch with redirect handling
        return fetch(request, {
          redirect: 'follow',
        });
      })
  );
});
