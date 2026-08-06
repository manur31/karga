import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      weightUnit: 'kg',
      restNotificationsEnabled: true,
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      setRestNotificationsEnabled: (enabled) =>
        set({ restNotificationsEnabled: Boolean(enabled) }),
    }),
    {
      name: 'karga-settings',
    }
  )
);
