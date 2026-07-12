// Rest Store — Timestamp-based architecture
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRestStore = create(
  persist(
    (set, get) => ({
      // ─── Estado del timer (basado en timestamps) ───────────────
      endAt: null,
      isRunning: false,
      _pausedMs: null,

      // ─── Acciones ──────────────────────────────────────────────

      // Inicia un descanso de X minutos
      startRest: (minutes) => {
        set({
          endAt: Date.now() + minutes * 60 * 1000,
          isRunning: true,
          _pausedMs: null,
        });
      },

      // Pausa el descanso, guardando el tiempo restante
      pauseRest: () => {
        const { endAt } = get();
        if (!endAt) return;

        const remainingMs = Math.max(0, endAt - Date.now());
        set({
          endAt: null,
          isRunning: false,
          _pausedMs: remainingMs,
        });
      },

      // Continúa el descanso desde donde quedó
      continueRest: () => {
        const { _pausedMs } = get();
        if (!_pausedMs || _pausedMs <= 0) return;

        set({
          endAt: Date.now() + _pausedMs,
          isRunning: true,
          _pausedMs: null,
        });
      },

      // Marca el descanso como completado ( reached 0 )
      completeRest: () => {
        set({
          endAt: null,
          isRunning: false,
          _pausedMs: null,
        });
      },

      // Cancela/elimina el descanso
      deleteRest: () => {
        set({
          endAt: null,
          isRunning: false,
          _pausedMs: null,
        });
      },
    }),
    {
      name: "rest-storage",
      partialize: (state) => ({
        endAt: state.endAt,
        isRunning: state.isRunning,
        _pausedMs: state._pausedMs,
      }),
    },
  ),
);
