import { db } from '../db';
import { pullDataFromServer } from './pullDataFromServer';
import { pushPendingData } from './pushPendingData';

/**
 * Bootstrap sync after auth is confirmed.
 * - Offline → no-op
 * - Empty Dexie → full pull
 * - Has data → push pending only
 */
export async function onAppOpen() {
  if (!navigator.onLine) return;

  const [setsCount, sessionsCount] = await Promise.all([
    db.sets.count(),
    db.sessions.count(),
  ]);

  if (setsCount === 0 && sessionsCount === 0) {
    await pullDataFromServer();
  } else {
    await pushPendingData();
  }
}
