import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Week ────────────────────────────────────────────────────────────────────

/**
 * Returns the 7 Date objects for the week containing `referenceDate`.
 * Week starts on Monday.
 */
export function generateWeek(referenceDate) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function getNextWeek(referenceDate) {
  return addWeeks(referenceDate, 1)
}

export function getPrevWeek(referenceDate) {
  return subWeeks(referenceDate, 1)
}

/**
 * Returns true if `date` falls within the same week as `referenceDate`.
 */
export function isInSameWeek(date, referenceDate) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
  return date >= start && date <= end
}

// ─── Month ───────────────────────────────────────────────────────────────────

/**
 * Returns all Date objects needed to fill a calendar month grid (Mon–Sun rows).
 * May include trailing/leading days from adjacent months.
 */
export function generateMonthGrid(referenceDate) {
  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function getNextMonth(referenceDate) {
  return addMonths(referenceDate, 1)
}

export function getPrevMonth(referenceDate) { 
  return subMonths(referenceDate, 1)
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/** "2026-06-10" */
export function toDateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

/** "JUE" */
export function toDayLabel(date) {
  return format(date, 'E', { locale: es }).toUpperCase().slice(0, 1)
}

/** "Mayo 2026" */
export function toMonthYearLabel(date) {
  const raw = format(date, 'MMMM yyyy', { locale: es })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

/** "09:30" from a Date or ISO string */
export function toTimeLabel(dateOrString) {
  if (!dateOrString) return ''
  const d = typeof dateOrString === 'string' ? parseISO(dateOrString) : dateOrString
  return format(d, 'HH:mm')
}

// ─── Comparison helpers ───────────────────────────────────────────────────────

export { isSameDay, isSameMonth, isToday }

// ─── Metrics ─────────────────────────────────────────────────────────────────

/**
 * Calculates daily summary metrics from a `dayActivity` object.
 * @param {{ sessions: Array, sets: Array }} dayActivity
 * @returns {{ exercises: number, sets: number, reps: number, volume: number }}
 */
export function calculateDailyMetrics(dayActivity) {
  if (!dayActivity) return { exercises: 0, sets: 0, reps: 0, volume: 0 }

  const { sets = [] } = dayActivity

  const uniqueExercises = new Set(sets.map((s) => s.exercise_id)).size
  const totalSets = sets.length
  const totalReps = sets.reduce((acc, s) => acc + (s.rep ?? s.reps ?? 0), 0)
  const totalVolume = sets.reduce(
    (acc, s) => acc + (s.rep ?? s.reps ?? 0) * (s.weight ?? 0),
    0
  )

  return {
    exercises: uniqueExercises,
    sets: totalSets,
    reps: totalReps,
    volume: totalVolume,
  }
}

/**
 * Groups sets by exercise_id for display in the activity list.
 * Returns an array of { exercise_id, exerciseName, sets[], sessionTime }
 */
export function groupSetsByExercise(dayActivity, exercises = []) {
  if (!dayActivity) return []

  console.log(dayActivity)

  // Convierte el array a un mapa { id: name }
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e.name]))

  const { sets = [], sessions = [] } = dayActivity

  console.log(sets)
  console.log(sessions)

  const sessionTimeMap = {}
  for (const session of sessions) {
    sessionTimeMap[session.id] = session.startedAt ?? session.started_at
  }
  
  const grouped = {}
  for (const s of sets) {
    const key = s.exercise_id
    if (!grouped[key]) {
      grouped[key] = {
        exercise_id: key,
        exerciseName: exerciseMap[key] ?? s.exercises?.name ?? s.exercise?.name ?? key,
        sets: [],
        sessionTime: sessionTimeMap[s.sessionId ?? s.session_id] ?? null,
      }
    }
    grouped[key].sets.push(s)
  }

  return Object.values(grouped)
}