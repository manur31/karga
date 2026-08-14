import { create } from 'zustand';

/**
 * @deprecated Sets now live in Dexie (setsRepository).
 * Kept as an empty shell so any leftover imports do not crash.
 * Prefer useSets / useCreateSet / useDeleteSet / useUpdateSet.
 */
export const useSetsStore = create(() => ({
  sets: [],
  addSyncedSets: () => {},
  addSet: () => {
    console.warn(
      'useSetsStore.addSet is deprecated. Use useCreateSet mutation instead.',
    );
  },
  markAsSynced: () => {},
  editSet: () => {},
  removeSet: () => {},
  getPendingSets: () => [],
  clearSets: () => {},
}));
