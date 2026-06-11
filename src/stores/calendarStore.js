import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

/**
 * Derives a "yyyy-MM-dd" key from a set or session object.
 * Tries multiple field names to be compatible with both local and Supabase shapes.
 */
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

/**
 * Merges an array of items into the activityByDate index.
 * `field` is either "sets" or "sessions".
 * Deduplicates by item.id — safe to call repeatedly.
 */
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
      // ─── Calendar data ──────────────────────────────────────────────────
      // Index: { "2026-06-10": { sets: [...], sessions: [...] } }
      activityByDate: {},

      // ─── UI state ────────────────────────────────────────────────────────
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      isMonthModalOpen: false,

      // ─── Selectors ───────────────────────────────────────────────────────

      /** Returns activity for a specific date key, or null */
      getActivityForDate: (dateKey) => {
        return get().activityByDate[dateKey] ?? null
      },

      /** Returns the Set of date keys that have any activity (for dot markers) */
      getActiveDates: () => {
        return new Set(
          Object.entries(get().activityByDate)
            .filter(([, v]) => v.sets.length > 0 || v.sessions.length > 0)
            .map(([k]) => k)
        )
      },

      // ─── Data loading ─────────────────────────────────────────────────────

      /**
       * Called once on app load with data fetched from Supabase.
       * Merges without overwriting local offline data.
       *
       * @param {{ sets: Array, sessions: Array }} param
       *
       * Expected set shape from Supabase:
       *   { id, profile_id, exercise_id, rep, weight, created_at, session_id }
       *
       * Expected session shape from Supabase:
       *   { id, profile_id, started_at, finished_at, created_at }
       */
      loadFromSupabase: ({ sets = [], sessions = [] }) => {
        const current = get().activityByDate
        let next = mergeItems(current, sets, 'sets')
        next = mergeItems(next, sessions, 'sessions')
        set({ activityByDate: next })
      },

      /**
       * Called after each addSet / addSession / finish action in the other stores.
       * Reads directly from useSetsStore and useSesionStore and syncs into the calendar.
       *
       * Pass the stores' state arrays directly to avoid circular imports:
       *   syncLocalData({ sets: useSetsStore.getState().sets, sessions: useSesionStore.getState().sessions })
       */
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

      // ─── UI actions ───────────────────────────────────────────────────────

      setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),

      openMonthModal: () => set({ isMonthModalOpen: true }),

      closeMonthModal: () => set({ isMonthModalOpen: false }),
    }),
    {
      name: 'calendar-storage',
      // Only persist the data index and selectedDate — not modal state
      partialize: (state) => ({
        activityByDate: state.activityByDate,
        selectedDate: state.selectedDate,
      }),
    }
  )
)

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// const orderByDate = (items) => {
//     // Sort items by createAt date older to newer
//     return items.sort((a, b) => new Date(a.createAt) - new Date(b.createAt))
// }

// export const useCalendarStore = create(
//     persist(
//         (set, get) => ({
//             day: {
//                 sets: [],
//                 sessions: [],
//             },

//             setPastDays: ({sets, sessions}) => {
//                 const setsByDate = orderByDate(sets)
//                 const sessionsByDate = orderByDate(sessions)

//                 if (setsByDate.length === 0 && sessionsByDate.length === 0) {
//                     return
//                 }

//                 for (const set of setsByDate) {
//                     set({ day: { ...get().day, sets: [...get().day.sets, set] } })
//                 }

//                 for (const session of sessionsByDate) {
//                     set({ day: { ...get().day, sessions: [...get().day.sessions, session] } })
//                 }
//             },

//             setNewDay: ({sets, sessions}) => {
//                 set({ day: { ...get().day, sets: [...get().day.sets, ...sets], sessions: [...get().day.sessions, ...sessions] } })
//             },

//         }),
//         {
//             name: 'calendar-storage',
//         }
//     )
// )