import { useSettingsStore } from '../stores/settingsStore';

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

function formatWeight(weightKg, unit) {
  const value = Number(weightKg) || 0;
  if (unit === 'lb') {
    return `${Number((value * 2.20462).toFixed(1))} lb`;
  }
  return `${Number(value.toFixed(2))} kg`;
}

export function buildRestNotificationPayload(lastSet) {
  const { weightUnit } = useSettingsStore.getState();
  const exerciseName = lastSet?.exerciseName || 'Ejercicio';
  const reps = lastSet?.reps ?? 0;
  const body = `${exerciseName} · ${formatWeight(lastSet?.weightKg, weightUnit)} × ${reps}`;

  return {
    title: 'Descanso terminado',
    options: {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'karga-rest-done',
      renotify: true,
      data: { type: 'rest-done' },
    },
  };
}

async function getServiceWorkerRegistration() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;

    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
  } catch {
    return null;
  }
}

export async function postToServiceWorker(message) {
  const reg = await getServiceWorkerRegistration();
  const worker = reg?.active || reg?.waiting || reg?.installing;
  if (!worker) return false;

  try {
    worker.postMessage(message);
    return true;
  } catch {
    return false;
  }
}

export async function scheduleRestNotification({ endsAt, lastSet }) {
  const { restNotificationsEnabled } = useSettingsStore.getState();
  if (!restNotificationsEnabled) return;
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const payload = buildRestNotificationPayload(lastSet);
  await postToServiceWorker({
    type: 'SCHEDULE_REST',
    endsAt,
    title: payload.title,
    options: payload.options,
  });
}

export async function cancelScheduledRestNotification() {
  await postToServiceWorker({ type: 'CANCEL_REST' });
}

export async function notifyRestDone(lastSet) {
  const { restNotificationsEnabled } = useSettingsStore.getState();
  if (!restNotificationsEnabled) return;
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // ignore
    }
  }

  const { title, options } = buildRestNotificationPayload(lastSet);

  try {
    const reg = await getServiceWorkerRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    // fallback below
  }

  try {
    new Notification(title, options);
  } catch {
    // ignore
  }
}
