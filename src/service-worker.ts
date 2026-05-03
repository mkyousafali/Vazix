/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE = `vazix-${version}`;

// Assets to cache immediately on install
const ASSETS = [
  ...build, // JS/CSS built files
  ...files  // static files (logo, icons, manifest)
];

self.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }
  event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }
  event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and auth/api routes
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip auth callbacks and API routes — always fetch live
  if (url.pathname.startsWith('/auth') || url.pathname.startsWith('/api')) return;

  async function respond() {
    const cache = await caches.open(CACHE);

    // Serve cached static assets directly
    if (ASSETS.includes(url.pathname)) {
      const cachedResponse = await cache.match(url.pathname);
      if (cachedResponse) return cachedResponse;
    }

    // Network-first for everything else
    try {
      const response = await fetch(event.request);
      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      // Fallback to cache if offline
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;
      return new Response('Offline', { status: 503 });
    }
  }

  event.respondWith(respond());
});
