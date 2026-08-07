import { create } from 'zustand';

export const usePrototypeStore = create((set) => ({
  version: 4, // Default to V4 (Base)
  setVersion: (version) => set({ version }),
}));
