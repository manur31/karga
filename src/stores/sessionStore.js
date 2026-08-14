import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Ephemeral session state only:
 * - active timer (start/pause/finish timestamps)
 * - note while session is running
 * - IDs of sets recorded during the current session (for discard)
 *
 * Persisted sessions live in Dexie, not here.
 */
export const useSessionStore = create(
  persist(
    (set, get) => ({
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
      isStarted: false,
      isPaused: false,
      finishedAt: null,
      note: '',
      sessionSetIds: [],
      isLoading: false,

      setNote: (note) => set({ note }),

      addSessionSetId: (id) =>
        set((state) => ({
          sessionSetIds: state.sessionSetIds.includes(id)
            ? state.sessionSetIds
            : [...state.sessionSetIds, id],
        })),

      clearSessionSetIds: () => set({ sessionSetIds: [] }),

      start: (options = {}) => {
        if (get().isStarted) return;

        const startedAt =
          typeof options.startedAt === 'number' ? options.startedAt : Date.now();
        const sessionSetIds = Array.isArray(options.sessionSetIds)
          ? options.sessionSetIds
          : [];

        set({
          startedAt,
          pausedAt: null,
          totalPausedMs: 0,
          isStarted: true,
          isPaused: false,
          finishedAt: null,
          note: '',
          sessionSetIds,
        });
      },

      pause: () => {
        const state = get();
        if (!state.isStarted || state.isPaused) return;

        set({
          pausedAt: Date.now(),
          isPaused: true,
        });
      },

      continue: () => {
        const state = get();
        if (!state.isPaused) return;

        const pauseDuration = Date.now() - state.pausedAt;

        set({
          totalPausedMs: state.totalPausedMs + pauseDuration,
          pausedAt: null,
          isPaused: false,
        });
      },

      /** Reset timer UI state after finish/discard (persistence is handled by mutations) */
      resetTimer: () =>
        set({
          startedAt: null,
          pausedAt: null,
          totalPausedMs: 0,
          isStarted: false,
          isPaused: false,
          finishedAt: null,
          note: '',
          sessionSetIds: [],
        }),

      /** @deprecated Use useFinishSession mutation — kept as timer reset alias */
      finish: () => {
        get().resetTimer();
      },

      /** @deprecated Use useDiscardSession mutation — kept as timer reset alias */
      discard: () => {
        get().resetTimer();
      },

      clearSession: () => {
        get().resetTimer();
      },
    }),
    {
      name: 'session-store',
      version: 2,
      migrate: (persistedState) => {
        // Drop legacy persisted sessions array
        if (persistedState && 'sessions' in persistedState) {
          const rest = { ...persistedState };
          delete rest.sessions;
          return {
            ...rest,
            sessionSetIds: rest.sessionSetIds || [],
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        totalPausedMs: state.totalPausedMs,
        isStarted: state.isStarted,
        isPaused: state.isPaused,
        finishedAt: state.finishedAt,
        note: state.note,
        sessionSetIds: state.sessionSetIds,
      }),
    },
  ),
);
