import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, startOfWeek } from 'date-fns'

/**
 * Ephemeral calendar UI state only.
 * Activity data (sets/sessions) comes from Dexie via useSets/useSessions.
 */
export const useCalendarStore = create(
  persist(
    (set) => ({
      weekStart: format(new Date(), 'yyyy-MM-dd'),
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      isMonthModalOpen: false,

      setWeekStart: (selectedDate) => {
        const date =
          typeof selectedDate === "string"
            ? new Date(selectedDate + "T00:00:00")
            : new Date(selectedDate);
        set({
          weekStart: format(
            startOfWeek(date, { weekStartsOn: 1 }),
            "yyyy-MM-dd",
          ),
        });
      },

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
