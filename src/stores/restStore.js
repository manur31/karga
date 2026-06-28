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

          if (currentTime <= 0) {
            clearInterval(id);
            set({ intervalId: null, isRunning: false });
            return;
          }

          set({
            restTime: currentTime - 1,
          });
        }, 1000);

        set({ intervalId: id, isRunning: true });
      },

      continueRest: () => {
        const { intervalId, restTime, isRunning } = get();
        if (intervalId) {
          clearInterval(intervalId);
        }
        
        if (restTime > 0) {
          const id = setInterval(() => {
            const currentTime = get().restTime;

            if (currentTime <= 0) {
              clearInterval(id);
              set({ intervalId: null, isRunning: false });
              return;
            }

            set({
              restTime: currentTime - 1,
            });
          }, 1000);

          set({ intervalId: id, isRunning: true });
        } else {
          set({ intervalId: null, isRunning: false });
        }
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
      name: "rest-storage",
    },
  ),
);
