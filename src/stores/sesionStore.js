import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSesionStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      seconds: 0,
      timer: null,
      startedAt: null,
      finishedAt: null,
      currentFunction: null,
      isStarted: false,

      addSession: (newSession) => {
        set((state) => ({
          sessions: [
            ...state.sessions,
            {
              ...newSession,
              id: crypto.randomUUID(),
              synced: false,
              createAt: new Date(),
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

      start: () => {
        if (get().timer !== null || get().seconds !== 0) return;

        const interval = setInterval(() => {
          set({ seconds: get().seconds + 1 });
        }, 1000);

        set({
          timer: interval,
          startedAt: new Date(),
          finishedAt: null,
          currentFunction: "start",
          isStarted: true,
        });
      },

      continue: () => {
        if (get().timer !== null) return;
        if (get().seconds === 0) return;

        const interval = setInterval(() => {
          set({ seconds: get().seconds + 1 });
        }, 1000);

        set({
          timer: interval,
          currentFunction: "continue",
        });
      },

      pause: () => {
        const timer = get().timer;

        if (timer) {
          clearInterval(timer);
        }

        set({
          timer: null,
          currentFunction: "pause",
        });
      },
      finish: () => {
        clearInterval(get().timer);

        const finishedAt = new Date();

        get().addSession({
          startedAt: get().startedAt,
          finishedAt,
        });

        set({
          timer: null,
          seconds: 0,
          finishedAt,
          currentFunction: "finish",
          isStarted: false,
        });
      },
      discard: () => {
        clearInterval(get().timer);
        set({
          timer: null,
          seconds: 0,
          startedAt: null,
          finishedAt: null,
          currentFunction: "discard",
          isStarted: false,
        });
      },
    }),
    { name: "sesion-store" },
  ),
);
