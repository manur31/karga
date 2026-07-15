// Session Store — Timestamp-based architecture
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSessionStore = create(
  persist(
    (set, get) => ({
      // ─── Sesiones guardadas ────────────────────────────────────
      sessions: [],

      // ─── Estado del timer activo (basado en timestamps) ────────
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
      isStarted: false,
      isPaused: false,
      finishedAt: null,
      note: "",

      // ─── Helpers de sesiones ───────────────────────────────────
      setNote: (note) => set({ note }),

      addSession: (newSession) => {
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

      // ─── Acciones del timer ────────────────────────────────────

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
