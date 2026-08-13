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
                    id: newSet.id || crypto.randomUUID(),
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

            getLastSetForExercise: (exerciseId) => {
                const exerciseSets = get().sets.filter(s => s.exercise_id === exerciseId);
                if (exerciseSets.length === 0) return null;
                // Sort by created_at descending (newest first)
                exerciseSets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                return exerciseSets[0];
            },

            getPreviousSessionSetsForExercise: (exerciseId) => {
                const exerciseSets = get().sets.filter(s => s.exercise_id === exerciseId);
                if (exerciseSets.length === 0) return [];
                // Sort by created_at descending
                exerciseSets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                // Get date of the most recent set
                const lastSetDate = new Date(exerciseSets[0].created_at).toDateString();
                // Return all sets from that date, chronological
                return exerciseSets
                    .filter(s => new Date(s.created_at).toDateString() === lastSetDate)
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            },

            clearSets: () => set({ sets: [] }),

        }),
        {
            name: 'sets-storage', 
        }
    )
)