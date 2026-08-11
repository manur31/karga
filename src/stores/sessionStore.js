import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeSession = (session) => {
  const sessionId = session.session_id || null;

  const startedAt =
    session.startedAt || session.time_init || session.created_at || Date.now();

  const finishedAt = session.finishedAt || session.time_end || null;

  return {
    ...session,

    id: session.id || sessionId || crypto.randomUUID(),

    session_id: sessionId,

    startedAt,
    finishedAt,

    time_init: session.time_init || startedAt,
    time_end: session.time_end || finishedAt,

    synced: sessionId ? true : Boolean(session.synced),

    createdAt:
      session.createdAt || session.created_at || new Date().toISOString(),
  };
};

const isSameSession = (a, b) => {
  if (a.session_id && b.session_id) {
    return a.session_id === b.session_id;
  }

  return a.id === b.id;
};

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
        if (!sessions) return;

        set({ isLoading: true });

        const syncedSessions = sessions.map((session) =>
          normalizeSession({
            ...session,
            synced: true,
          }),
        );

        set((state) => {
          const pendingLocalSessions = state.sessions
            .map(normalizeSession)
            .filter((session) => !session.synced && !session.session_id);

          const mergedSessions = [...pendingLocalSessions];

          syncedSessions.forEach((syncedSession) => {
            const alreadyExists = mergedSessions.some((session) =>
              isSameSession(session, syncedSession),
            );

            if (!alreadyExists) {
              mergedSessions.push(syncedSession);
            }
          });

          return {
            sessions: mergedSessions,
            isLoading: false,
          };
        });
      },

      addSession: (newSession) => {
        set({ isLoading: true });

        set((state) => ({
          sessions: [
            ...state.sessions,
            normalizeSession({
              ...newSession,
              id: crypto.randomUUID(),
              synced: false,
              createdAt: new Date().toISOString(),
            }),
          ],
        }));

        set({ isLoading: false });
      },

      replaceLocalSession: (localId, supabaseSession) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== localId) return session;

            return normalizeSession({
              ...session,
              ...supabaseSession,
              id: session.id,
              session_id: supabaseSession.session_id,
              synced: true,
            });
          }),
        }));
      },

      deleteLocalSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(
            (session) =>
              session.id !== sessionId && session.session_id !== sessionId,
          ),
        }));
      },

      markAsSynced: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId || session.session_id === sessionId
              ? { ...session, synced: true }
              : session,
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
      version: 2,

      migrate: (persistedState, version) => {
        if (version === 0) {
          const raw = localStorage.getItem("sesion-store");

          if (raw) {
            const parsed = JSON.parse(raw);
            localStorage.removeItem("sesion-store");

            return { ...persistedState, ...parsed.state };
          }
        }

        if (version < 2) {
          return {
            ...persistedState,
            sessions: [],
          };
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
