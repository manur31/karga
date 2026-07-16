import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSetsStore = create(
    persist(
        (set, get) => ({
            sets: [],

            addSyncedSets: (sets = []) => {
                const sycnedSets = sets?.map((set) => ({
                    ...set,
                    synced: true,
                })) || [];

                const addedSets = get().sets

                const newSyncSets = sycnedSets?.filter((set) => !addedSets?.some((addedSet) => addedSet.set_id === set.set_id))

                if (newSyncSets.length > 0) {
                    set((state) => ({
                        sets: [...state.sets, ...newSyncSets],
                    }))
                }

            },

            addSet: (newSet) => set((state) => ({
                sets: [...state.sets, { 
                    ...newSet,
                    id: crypto.randomUUID(),
                    synced: false,
                    created_at: new Date(),
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