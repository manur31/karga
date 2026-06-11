import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRestStore = create(
  persist(
    (set, get) => ({
      restTime: 0,
      intervalId: null,
      isRunning: false,

      startRest: (minute) => {
        if (get().isRunning) {
          set({
            restTime: 0,
            intervalId: null,
            isRunning: false,
          });
        }
        const { intervalId } = get();
        const seconds = minute * 60;

        if (intervalId) {
          clearInterval(intervalId);
        }

        set({ restTime: seconds });

        const id = setInterval(() => {
          const currentTime = get().restTime;

          if (currentTime <= 1) {
            clearInterval(id);

            set({
              restTime: 0,
              intervalId: null,
              isRunning: false,
            });

            return;
          }

          set({
            restTime: currentTime - 1,
          });
        }, 1000);

        set({ intervalId: id });
      },

      continueRest: () => {
        const { intervalId } = get();
        if (intervalId) {
          clearInterval(intervalId);
        }
        set({ intervalId: null });
      },

      deleteRest: () => {
        const { intervalId } = get();

        if (intervalId) {
          clearInterval(intervalId);
        }

        set({
          restTime: 0,
          intervalId: null,
          isRunning: false,
        });
      },
    }),
    {
      name: 'rest-storage',
    }
  )
);