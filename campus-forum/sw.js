'use strict';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// No caching of authenticated API responses or credentials.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data.json(); } catch {}
  const base = new URL('./', self.registration.scope);
  let target = base.href;
  try { const u = new URL(data.url, base); if (u.origin === base.origin && u.pathname === base.pathname) target = u.href; } catch {}
  event.waitUntil(self.registration.showNotification(data.title || '校园论坛提醒', {
    body: data.body || '有新的浏览增速提醒', tag: data.tag || 'forum-growth',
    icon: new URL('icon-192.png', base).href, data: {url: target}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
