import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSetsStore = create(
    persist(
        (set, get) => ({
            sets: [],
            syncedSets: [],
            setsToUpdate: [],

            addSyncedSets: (newSets) => set((state) => ({
                newSets: newSets.filter((set) => !state.syncedSets.some((s) => s.id === set.set_id)),
                syncedSets: [...state.syncedSets, ...newSets]
            })),

            addSet: (newSet) => set((state) => ({
                sets: [...state.sets, {
                    id: crypto.randomUUID(),
                    synced: false,
                    created_at: new Date(),
                    ...newSet,
                }]
            })),

            markAsSynced: (setId) => set((state) => ({
                sets: state.sets.map((set) => 
                    set.id === setId ? { ...set, synced: true } : set
                )
            })),

            editSet: (setId, updatedSet) => set((state) => ({
                sets: state.sets.map((set) => 
                    set.id === setId ? { ...set, ...updatedSet } : set
                )
            })),

            removeSet: (setId) => set((state) => ({
                sets: state.sets.filter((set) => set.id !== setId)
            })),

            getPendingSets: () => get().sets.filter((set) => !set.synced),

            clearSets: () => set({ sets: [] }),

        }),
        {
            name: 'sets-storage', 
        }
    )
)