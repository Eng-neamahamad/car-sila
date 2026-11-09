self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'CAR-SILA';
  const tag = data.tag || `carsila-${Date.now()}`;
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [400, 200, 400, 200, 400, 200, 800],
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const windowClient of windows) {
      if (!windowClient.url.startsWith(self.location.origin)) continue;
      windowClient.postMessage({ type: 'carsila-open', url: target });
      await windowClient.focus();
      return;
    }
    await self.clients.openWindow(target);
  })());
});
