import { useMutation } from '@tanstack/react-query';
import { sessionsRepository } from '../../lib/local/sessionsRepository';
import { setsRepository } from '../../lib/local/setsRepository';
import { db } from '../../lib/db';
import { runSyncNow } from '../../lib/sync/syncScheduler';
import { useSessionStore } from '../../stores/sessionStore';
import { getCachedProfile } from '../../storage/profile-storage';

function toIso(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return new Date(value).toISOString();
}

function resolveProfileId(explicit) {
  if (explicit) return explicit;
  return getCachedProfile()?.profile_id ?? null;
}

export const useCreateSession = (_profile_id) => {
  return useMutation({
    mutationFn: async (data) => {
      const profileId = resolveProfileId(_profile_id);
      const items = Array.isArray(data) ? data : [data];
      const ids = [];

      for (const item of items) {
        const startedAt = toIso(item.startedAt || item.time_init);
        const finishedAt = toIso(item.finishedAt || item.time_end);
        const createdAt =
          toIso(item.created_at || item.createdAt || item.createAt) ||
          finishedAt ||
          new Date().toISOString();

        const id = await sessionsRepository.add({
          profileId: item.profile_id || item.profileId || profileId,
          startedAt,
          finishedAt,
          note: item.note ?? null,
          createdAt,
        });
        ids.push(id);
      }

      return ids;
    },
  });
};

export const useDeleteSession = () => {
  return useMutation({
    mutationFn: async (session_id) => {
      await sessionsRepository.remove(session_id);
    },
  });
};

export const useUpdateSession = () => {
  return useMutation({
    mutationFn: async ({
      session_id,
      time_end,
      time_init,
      startedAt,
      finishedAt,
      note,
    }) => {
      const changes = {};
      if (startedAt !== undefined || time_init !== undefined) {
        changes.startedAt = toIso(startedAt || time_init);
      }
      if (finishedAt !== undefined || time_end !== undefined) {
        changes.finishedAt = toIso(finishedAt || time_end);
      }
      if (note !== undefined) {
        changes.note = note;
      }
      await sessionsRepository.update(session_id, changes);
    },
  });
};

/**
 * Finish active session: persist to Dexie, sync if online, reset timer.
 */
export const useFinishSession = (profile_id) => {
  return useMutation({
    mutationFn: async () => {
      const pid = resolveProfileId(profile_id);
      const state = useSessionStore.getState();
      if (!state.isStarted) return null;

      const now = Date.now();
      const startedAt = toIso(state.startedAt);
      const finishedAt = toIso(now);

      const id = await sessionsRepository.add({
        profileId: pid,
        startedAt,
        finishedAt,
        note: state.note || null,
        createdAt: finishedAt,
      });

      state.resetTimer();

      if (navigator.onLine) {
        await runSyncNow();
      }

      return id;
    },
  });
};

/**
 * Discard active session.
 * @param {{ keepSets: boolean }} opts
 */
export const useDiscardSession = () => {
  return useMutation({
    mutationFn: async ({ keepSets } = { keepSets: true }) => {
      const state = useSessionStore.getState();
      const setIds = [...(state.sessionSetIds || [])];

      if (!keepSets && setIds.length > 0) {
        await db.transaction('rw', db.sets, async () => {
          for (const id of setIds) {
            await setsRepository.remove(id);
          }
        });
      } else if (keepSets && navigator.onLine) {
        await runSyncNow();
      }

      state.resetTimer();
    },
  });
};

/**
 * Edit a past session + its sets in Dexie (local-first).
 */
export const useUpdateSessionWithSets = (profile_id) => {
  return useMutation({
    mutationFn: async ({
      session_id,
      startedAt,
      finishedAt,
      note,
      sets = [],
      deletedSetIds = [],
    }) => {
      const pid = resolveProfileId(profile_id);
      if (!session_id) throw new Error('session_id is required');

      await sessionsRepository.update(session_id, {
        startedAt: toIso(startedAt),
        finishedAt: toIso(finishedAt),
        note: note ?? null,
      });

      for (const setId of deletedSetIds || []) {
        if (setId) await setsRepository.remove(setId);
      }

      for (const set of sets) {
        const setId = set.set_id || set.id || null;
        const payload = {
          weight: Number(set.weight ?? 0),
          rep: Number(set.rep ?? set.reps ?? 0),
          createdAt: toIso(set.created_at || set.createdAt) || new Date().toISOString(),
          exerciseId: set.exercise_id || set.exerciseId,
          profileId: set.profile_id || set.profileId || pid,
        };

        if (setId) {
          const existing = await setsRepository.getById(setId);
          if (existing) {
            await setsRepository.update(setId, {
              weight: payload.weight,
              rep: payload.rep,
              createdAt: payload.createdAt,
              exerciseId: payload.exerciseId || existing.exerciseId,
            });
            continue;
          }
        }

        const addPayload = {
          profileId: payload.profileId,
          exerciseId: payload.exerciseId,
          weight: payload.weight,
          rep: payload.rep,
          createdAt: payload.createdAt,
        };
        if (setId) addPayload.id = setId;
        await setsRepository.add(addPayload);
      }

      if (navigator.onLine) {
        await runSyncNow();
      }
    },
  });
};
