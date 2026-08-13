import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRestStore = create(
  persist(
    (set, get) => ({
      restTime: 0,
      endTime: null,
      intervalId: null,
      isRunning: false,

      startRest: (seconds) => {
        const { intervalId } = get();
        if (intervalId) {
          clearInterval(intervalId);
        }

        const endTime = Date.now() + seconds * 1000;
        set({ restTime: seconds, endTime, intervalId: null, isRunning: true });

        const id = setInterval(() => {
          const currentEndTime = get().endTime;
          if (!currentEndTime) return;
          
          const remaining = Math.round((currentEndTime - Date.now()) / 1000);

          if (remaining <= 0) {
            clearInterval(get().intervalId);
            set({ intervalId: null, isRunning: false, restTime: 0, endTime: null });
            return;
          }

          set({ restTime: remaining });
        }, 1000);

        set({ intervalId: id });
      },

      continueRest: () => {
        const { intervalId, endTime } = get();
        if (intervalId) {
          clearInterval(intervalId);
        }
        
        if (endTime && endTime > Date.now()) {
          const id = setInterval(() => {
            const currentEndTime = get().endTime;
            if (!currentEndTime) return;
            
            const remaining = Math.round((currentEndTime - Date.now()) / 1000);

            if (remaining <= 0) {
              clearInterval(get().intervalId);
              set({ intervalId: null, isRunning: false, restTime: 0, endTime: null });
              return;
            }

            set({ restTime: remaining });
          }, 1000);

          set({ intervalId: id, isRunning: true });
        } else {
          set({ intervalId: null, isRunning: false, restTime: 0, endTime: null });
        }
      },

      deleteRest: () => {
        const { intervalId } = get();
        if (intervalId) {
          clearInterval(intervalId);
        }

        set({
          restTime: 0,
          endTime: null,
          intervalId: null,
          isRunning: false,
        });
      },
    }),
    {
      name: "rest-storage",
      partialize: (state) => ({ 
        restTime: state.restTime,
        endTime: state.endTime,
        isRunning: state.isRunning 
      }),
    }
  ),
);
