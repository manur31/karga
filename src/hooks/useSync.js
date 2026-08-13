import { useEffect, useRef } from 'react';
import { onAppOpen } from '../lib/sync/onAppOpen';
import { runSyncNow } from '../lib/sync/syncScheduler';

/**
 * Bootstrap offline sync once the user is authenticated.
 * - onAppOpen: empty Dexie → pull; else → push pending
 * - online event → runSyncNow
 *
 * Does NOT sync on navigation / data reads.
 */
export function useBootstrapSync(isAuthenticated) {
  const booted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      booted.current = false;
      return;
    }

    if (!booted.current) {
      booted.current = true;
      onAppOpen().catch((err) => {
        console.error('Bootstrap sync failed:', err);
      });
    }

    const handleOnline = () => {
      runSyncNow();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated]);
}
export const useSyncSessions = (profile_id) => {
  const { getPendingSessions, replaceLocalSession } = useSessionStore();
  const { mutateAsync: createSession } = useCreateSession(profile_id);

  const sync = async () => {
    if (!profile_id) return;

    const pendingSessions = getPendingSessions();

    if (pendingSessions.length === 0) return;

    const sessionsToSync = pendingSessions.map((session) => ({
      profile_id,
      time_init: new Date(session.startedAt).toISOString(),
      time_end: session.finishedAt
        ? new Date(session.finishedAt).toISOString()
        : null,
      note: session.note || null,
    }));

    try {
      const createdSessions = await createSession(sessionsToSync);

      pendingSessions.forEach((localSession, index) => {
        replaceLocalSession(localSession.id, createdSessions[index]);
      });
    } catch (error) {
      console.log("Error syncing sessions", error);
    }
  };

/** @deprecated Use runSyncNow from syncScheduler or session lifecycle mutations */
export const useSyncSets = () => ({
  sync: async () => {
    await runSyncNow();
  },
});

/** @deprecated Use runSyncNow from syncScheduler or session lifecycle mutations */
export const useSyncSessions = () => ({
  sync: async () => {
    await runSyncNow();
  },
});
