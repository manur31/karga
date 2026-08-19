let restTimeoutId = null;
let scheduledEndsAt = null;

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SCHEDULE_REST') {
    if (restTimeoutId != null) {
      clearTimeout(restTimeoutId);
      restTimeoutId = null;
    }

    const endsAt = Number(data.endsAt) || 0;
    scheduledEndsAt = endsAt;
    const delay = Math.max(0, endsAt - Date.now());
    const title = data.title || 'Descanso terminado';
    const options = data.options || {};

    restTimeoutId = setTimeout(() => {
      restTimeoutId = null;
      if (scheduledEndsAt !== endsAt) return;

      self.registration
        .showNotification(title, {
          ...options,
          tag: options.tag || 'karga-rest-done',
          renotify: options.renotify !== false,
        })
        .catch(() => {});
    }, delay);
    return;
  }

  if (data.type === 'CANCEL_REST') {
    if (restTimeoutId != null) {
      clearTimeout(restTimeoutId);
      restTimeoutId = null;
    }
    scheduledEndsAt = null;
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/rutinas');
      }
    }),
  );
});
