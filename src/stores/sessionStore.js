import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSessionStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      isLoading: false,

      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
      isStarted: false,
      isPaused: false,
      finishedAt: null,
      note: "",

      setNote: (note) => set({ note }),

      addSyncedSessions: (sessions = []) => {
        set({ isLoading: true })
        if (!sessions) return;
        const syncedSessions = sessions?.map((session) => (
          {
            ...session, 
            synced: true 
          } 
        )) || [];

        const addedSessions = get().sessions

        const newSyncedSession = syncedSessions?.filter((session) => !addedSessions?.some((addedSession) => addedSession.sessionId === session.sessionId))

        if (newSyncedSession.length > 0) {
          set((state) => ({
            sessions: [...state.sessions, ...newSyncedSession]
          })) 
        }
        set({ isLoading: false })
      },

      addSession: (newSession) => {
        set({ isLoading: true })
        set((state) => ({
          sessions: [
            ...state.sessions,
            {
              ...newSession,
              id: crypto.randomUUID(),
              synced: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        set({ isLoading: false })
      },

      markAsSynced: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, synced: true } : session,
          ),
        }));
      },

      getPendingSessions: () =>
        get().sessions.filter((session) => !session.synced),


      start: () => {
        if (get().isStarted) return;

        set({
          startedAt: Date.now(),
          pausedAt: null,
          totalPausedMs: 0,
          isStarted: true,
          isPaused: false,
          finishedAt: null,
          note: "",
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

      finish: (profile_id) => {
        const state = get();
        const now = Date.now();

        get().addSession({
          startedAt: state.startedAt,
          finishedAt: now,
          profile_id,
          note: state.note,
        });

        set({
          startedAt: null,
          pausedAt: null,
          totalPausedMs: 0,
          isStarted: false,
          isPaused: false,
          finishedAt: now,
          note: "",
        });
      },

      discard: () => {
        set({
          startedAt: null,
          pausedAt: null,
          totalPausedMs: 0,
          isStarted: false,
          isPaused: false,
          finishedAt: null,
          note: "",
        });
      },

      clearSession: () => {
        set({
          startedAt: null,
          pausedAt: null,
          totalPausedMs: 0,
          isStarted: false,
          isPaused: false,
          finishedAt: null,
          sessions: [],
          note: "",
        });
      },
    }),
    {
      name: "session-store",
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const raw = localStorage.getItem("sesion-store");
          if (raw) {
            const parsed = JSON.parse(raw);
            localStorage.removeItem("sesion-store");
            return { ...persistedState, ...parsed.state };
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        sessions: state.sessions,
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        totalPausedMs: state.totalPausedMs,
        isStarted: state.isStarted,
        isPaused: state.isPaused,
        finishedAt: state.finishedAt,
        note: state.note,
      }),
    },
  ),
);
