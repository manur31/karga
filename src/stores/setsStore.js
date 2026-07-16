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
                }))

                set((state) => ({
                    sets: [...state.sets, ...sycnedSets],
                }))
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