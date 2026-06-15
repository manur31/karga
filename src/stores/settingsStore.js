import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      weightUnit: 'kg', // 'kg' or 'lb'
      setWeightUnit: (unit) => set({ weightUnit: unit }),
    }),
    {
      name: 'karga-settings',
    }
  )
);
