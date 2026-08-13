import { useMutation } from '@tanstack/react-query';
import { sessionsRepository } from '../../lib/local/sessionsRepository';
import { setsRepository } from '../../lib/local/setsRepository';
import { db } from '../../lib/db';
import { runSyncNow } from '../../lib/sync/syncScheduler';
import { useSessionStore } from '../../stores/sessionStore';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteSession,
  insertSession,
  updateSession,
  updateSessionWithSets,
} from "../../service/sessionService";

function toIso(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  // timestamps (ms)
  if (typeof value === 'number') return new Date(value).toISOString();
  return new Date(value).toISOString();
}

export const useCreateSession = (_profile_id) => {
  return useMutation({
    mutationFn: async (data) => {
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
          profileId: item.profile_id || item.profileId || _profile_id,
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
    mutationFn: (session_id) => {
      return deleteSession({
        profile_id,
        session_id,
      });
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
      const state = useSessionStore.getState();
      if (!state.isStarted) return null;

      const now = Date.now();
      const startedAt = toIso(state.startedAt);
      const finishedAt = toIso(now);

      const id = await sessionsRepository.add({
        profileId: profile_id,
        startedAt,
        finishedAt,
        note: state.note || null,
        createdAt: finishedAt,
    mutationFn: ({ session_id, finishedAt, startedAt, note }) => {
      return updateSession({
        session_id,
        profile_id,
        finishedAt,
        startedAt,
        note,
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
 * @param {boolean} keepSets - if false, bulk-delete session set IDs from Dexie
 */
export const useDiscardSession = () => {
  return useMutation({
    mutationFn: async ({ keepSets }) => {
      const state = useSessionStore.getState();
      const setIds = [...(state.sessionSetIds || [])];

      if (!keepSets && setIds.length > 0) {
        // Hard-delete local-only sets; soft-delete any that somehow synced
        await db.transaction('rw', db.sets, async () => {
          for (const id of setIds) {
            await setsRepository.remove(id);
          }
        });
      } else if (keepSets && navigator.onLine) {
        await runSyncNow();
      }

      // Session was never persisted on discard — only clear ephemeral timer
      state.resetTimer();
    },
  });
};
export const useUpdateSessionWithSets = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      updateSessionWithSets({
        ...data,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["sets", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["weekActivity", profile_id],
      });
    },
  });
};
