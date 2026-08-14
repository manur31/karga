import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cancelScheduledRestNotification,
  notifyRestDone,
  scheduleRestNotification,
} from "../lib/notifications";

function clearTimers(get) {
  const { intervalId, timeoutId } = get();
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
}

function completeRest(set, get) {
  const { endsAt, lastSet, notifiedForEndsAt } = get();
  clearTimers(get);

  const shouldNotify = endsAt != null && notifiedForEndsAt !== endsAt;

  set({
    restTime: 0,
    intervalId: null,
    timeoutId: null,
    isRunning: false,
    notifiedForEndsAt: endsAt,
  });

  if (shouldNotify && lastSet) {
    // Cancel SW schedule first to avoid double fire, then notify from page.
    cancelScheduledRestNotification();
    notifyRestDone(lastSet);
  }
}

function tick(set, get) {
  const { endsAt } = get();
  if (!endsAt) return;

  const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

  if (remaining <= 0) {
    completeRest(set, get);
    return;
  }

  set({ restTime: remaining, isRunning: true });
}

function armTimers(set, get, endsAt) {
  clearTimers(get);

  const remainingMs = Math.max(0, endsAt - Date.now());
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

  if (remainingSec <= 0) {
    completeRest(set, get);
    return;
  }

  set({ restTime: remainingSec, isRunning: true });

  const intervalId = setInterval(() => tick(set, get), 1000);
  const timeoutId = setTimeout(() => completeRest(set, get), remainingMs + 50);

  set({ intervalId, timeoutId });
}

export const useRestStore = create(
  persist(
    (set, get) => ({
      restTime: 0,
      intervalId: null,
      timeoutId: null,
      isRunning: false,
      endsAt: null,
      lastSet: null,
      notifiedForEndsAt: null,

      startRest: ({ seconds, lastSet } = {}) => {
        clearTimers(get);
        cancelScheduledRestNotification();

        const duration = Math.max(1, Math.round(Number(seconds) || 60));
        const endsAt = Date.now() + duration * 1000;

        set({
          restTime: duration,
          endsAt,
          lastSet: lastSet ?? null,
          isRunning: true,
          notifiedForEndsAt: null,
        });

        armTimers(set, get, endsAt);

        if (lastSet) {
          scheduleRestNotification({ endsAt, lastSet });
        }
      },

      continueRest: () => {
        const { endsAt, notifiedForEndsAt, lastSet } = get();
        if (!endsAt) {
          clearTimers(get);
          set({ intervalId: null, timeoutId: null, isRunning: false, restTime: 0 });
          return;
        }

        if (notifiedForEndsAt === endsAt) {
          clearTimers(get);
          set({ intervalId: null, timeoutId: null, isRunning: false, restTime: 0 });
          return;
        }

        const remaining = Math.ceil((endsAt - Date.now()) / 1000);
        if (remaining <= 0) {
          completeRest(set, get);
          return;
        }

        armTimers(set, get, endsAt);

        if (lastSet) {
          scheduleRestNotification({ endsAt, lastSet });
        }
      },

      deleteRest: () => {
        clearTimers(get);
        cancelScheduledRestNotification();
        set({
          restTime: 0,
          intervalId: null,
          timeoutId: null,
          isRunning: false,
          endsAt: null,
          lastSet: null,
        });
      },
    }),
    {
      name: "rest-storage",
      partialize: (state) => ({
        restTime: state.restTime,
        isRunning: state.isRunning,
        endsAt: state.endsAt,
        lastSet: state.lastSet,
        notifiedForEndsAt: state.notifiedForEndsAt,
      }),
    },
  ),
);
