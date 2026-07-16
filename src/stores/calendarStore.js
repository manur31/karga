import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

function getDateKey(item) {
  const raw =
    item.createdAt ??
    item.created_at ??
    item.startedAt ??
    item.started_at ??
    null

  if (!raw) return null

  try {
    return format(new Date(raw), 'yyyy-MM-dd')
  } catch {
    return null
  }
}

function mergeItems(activityByDate, items, field) {
  const next = { ...activityByDate }

  for (const item of items) {
    const key = getDateKey(item)
    if (!key) continue

    if (!next[key]) {
      next[key] = { sets: [], sessions: [] }
    }

    const existing = next[key][field]
    const alreadyExists = existing.some((e) => e.id === item.id)
    if (!alreadyExists) {
      next[key] = {
        ...next[key],
        [field]: [...existing, item],
      }
    }
  }

  return next
}

export const useCalendarStore = create(
  persist(
    (set, get) => ({
      activityByDate: {},

      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      isMonthModalOpen: false,

      getActivityForDate: (dateKey) => {
        return get().activityByDate[dateKey] ?? null
      },

      getActiveDates: () => {
        return new Set(
          Object.entries(get().activityByDate)
            .filter(([, v]) => v.sets.length > 0 || v.sessions.length > 0)
            .map(([k]) => k)
        )
      },

      loadFromSupabase: ({ sets = [], sessions = [] }) => {
        const current = get().activityByDate
        let next = mergeItems(current, sets, 'sets')
        next = mergeItems(next, sessions, 'sessions')
        set({ activityByDate: next })
      },


      syncLocalData: ({ sets = [], sessions = [] }) => {
        const current = get().activityByDate
        let next = mergeItems(current, sets, 'sets')
        next = mergeItems(next, sessions, 'sessions')
        set({ activityByDate: next })
      },

      addLocalSets: (sets = []) => {
        const next = mergeItems(get().activityByDate, sets, 'sets')
        set({ activityByDate: next })
      },

      addLocalSessions: (sessions = []) => {
        const next = mergeItems(get().activityByDate, sessions, 'sessions')
        set({ activityByDate: next })
      },

      setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),

      toggleMonthModal: () => set((state) => ({ isMonthModalOpen: !state.isMonthModalOpen })),

      closeMonthModal: () => set({ isMonthModalOpen: false }),
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({
        activityByDate: state.activityByDate,
        selectedDate: state.selectedDate,
      }),
    }
  )
)