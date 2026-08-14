import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

/**
 * Ephemeral calendar UI state only.
 * Activity data (sets/sessions) comes from Dexie via useSets/useSessions.
 */
export const useCalendarStore = create(
  persist(
    (set) => ({
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      isMonthModalOpen: false,

      setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),

      toggleMonthModal: () =>
        set((state) => ({ isMonthModalOpen: !state.isMonthModalOpen })),

      closeMonthModal: () => set({ isMonthModalOpen: false }),
    }),
    {
      name: 'calendar-storage',
      version: 2,
      migrate: (persisted) => {
        // Drop legacy activityByDate cache — Dexie is source of truth
        if (!persisted) return persisted
        return {
          selectedDate:
            persisted.selectedDate || format(new Date(), 'yyyy-MM-dd'),
          isMonthModalOpen: false,
        }
      },
      partialize: (state) => ({
        selectedDate: state.selectedDate,
      }),
    },
  ),
)
