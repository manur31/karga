import { useState, useMemo, useEffect } from "react";
import { useCalendarStore } from "../stores/calendarStore";
import {
  calculateDailyMetrics,
  getNextMonth,
  getPrevMonth,
} from "../lib/calendarUtils";
import CalendarHeader from "../components/calendar/CalendarHeader";
import WeeklyStrip from "../components/calendar/WeeklyStrip";
import DailySummary from "../components/calendar/DailySummary";
import ActivityList from "../components/calendar/ActivityList";
import MonthModal from "../components/calendar/MothModal";
import {
  useExercises,
  useFavoriteExercises,
} from "../hooks/queries/useExercises";
import { useAuth } from "../hooks/queries/useAuth";
import { useSets } from "../hooks/queries/useSets";
import { useSessions } from "../hooks/queries/useSessions";
import { useSetsStore } from "../stores/setsStore";
import { useSesionStore } from "../stores/sesionStore";
import SessionCard from "../components/calendar/SessionCard";
import { format } from "date-fns";
import { FiChevronDown } from "react-icons/fi";
import { WeekActivity } from "../components/sets/WeekActivity";
import { useWeekActivity } from "../hooks/queries/useSessions";

export default function HistoryScreen() {
  const {
    selectedDate,
    isMonthModalOpen,
    activityByDate,
    setSelectedDate,
    toggleMonthModal,
    closeMonthModal,
    getActivityForDate,
    getActiveDates,
    loadFromSupabase,
    syncLocalData
  } = useCalendarStore()

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: popularExercises } = useExercises(profile_id);
  const { data: userExercises } = useFavoriteExercises(profile_id);
  const { data: sets } = useSets(profile_id);
  const { data: sessions, isLoading: isSessionsLoading } =
    useSessions(profile_id);
  const { sets: setsFromStore } = useSetsStore();
  const { sessions: sessionsFromStore } = useSesionStore();

  useEffect(() => {
    loadFromSupabase({ sets, sessions })
    syncLocalData({ sets: setsFromStore, sessions: sessionsFromStore })
  }, [sets, sessions, setsFromStore, sessionsFromStore, loadFromSupabase, syncLocalData])

  const userExercisesList = userExercises?.map(exercise => ({
    ...exercise.exercises
  }))

  const exercises = [...(popularExercises || []), ...(userExercisesList || [])];

  // Month navigator state (used by header and modal in sync)
  const [monthRef, setMonthRef] = useState(
    selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
  )

  const [isSessionsOpen, setIsSessionsOpen] = useState(false)

  // Active dates set — memoized so DayCell/MonthGrid don't recalculate each render
  const activeDates = useMemo(() => getActiveDates(), [activityByDate, getActiveDates])

  // Current day's data
  const dayActivity = getActivityForDate(selectedDate)

  // Metrics for the summary cards
  const metrics = useMemo(() => calculateDailyMetrics(dayActivity), [dayActivity])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleSelectDate(dateStr) {
    setSelectedDate(dateStr)
    // Keep monthRef in sync for the header label
    setMonthRef(new Date(dateStr + 'T00:00:00'))
  }

  function handleModalSelectDate(dateStr) {
    setSelectedDate(dateStr)
    setMonthRef(new Date(dateStr + 'T00:00:00'))
    closeMonthModal()
  }

  function handlePrevMonth() {
    setMonthRef((m) => getPrevMonth(m))
  }

  function handleNextMonth() {
    setMonthRef((m) => getNextMonth(m))
  }

  {/* Session card */}
  const selectedSessions = sessionsFromStore?.filter((session) => {
    const rawDate =
      session.created_at ||
      session.time_init ||
      session.startedAt ||
      session.createAt ||
      session.started_at;

    if (!rawDate) return false;

    const date = new Date(rawDate);

    if (isNaN(date.getTime())) return false;

    const sessionDate = format(date, 'yyyy-MM-dd');
    return sessionDate === selectedDate;
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    // Full-screen dark container — adjust to your router/nav setup
    <div
      className="min-h-screen flex flex-col w-full animate-fade-in bg-dark-bg overflow-hidden relative pb-20 pt-10 px-4"
    >
      {/* Header: title + month navigator */}
      <CalendarHeader
        referenceDate={monthRef}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onMonthPress={toggleMonthModal}
      />

      {/* Weekly strip */}
      <div className="mt-2">
        <WeeklyStrip
        selectedDate={selectedDate}
        activeDates={activeDates}
        onSelectDate={handleSelectDate}
        monthRef={monthRef}
        onWeekChange={(newWeek) => setMonthRef(newWeek)}
      />
      </div>

      {/* Divider */}
      <div className="mx-4 mt-4 h-px bg-white/5" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Summary cards */}
        <DailySummary metrics={metrics} />

        {/* Session card */}
        <div className="mt-8">
          <div className="mx-4">
            <button 
              onClick={() => setIsSessionsOpen(!isSessionsOpen)}
              className="w-full flex items-center justify-between text-white text-[17px] font-bold px-5 py-4 bg-white/5 hover:bg-white/10 rounded-2xl outline-none active:scale-[0.98] transition-all"
            >
              Sesiones del día
              <FiChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isSessionsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isSessionsOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              {isSessionsLoading ? (
                <SessionsLoadingState />
              ) : selectedSessions?.length > 0 ? (
                selectedSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <SessionsEmptyState />
              )}
            </div>
          </div>
        </div>

        {/* Activity list */}
        <ActivityList
          dayActivity={dayActivity}
          exercises={exercises}
        />
      </div>

      {/* Month modal (bottom sheet) */}
      <MonthModal
        isOpen={isMonthModalOpen}
        selectedDate={selectedDate}
        activeDates={activeDates}
        onSelectDate={handleModalSelectDate}
        onClose={closeMonthModal}
      />
    </div>
  )
}

function SessionsLoadingState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <span className="animate-pulse size-12 bg-karga-gray rounded-full"></span>
      <p className="text-white/60 text-sm font-medium">Cargando sesiones...</p>
    </div>
  )
}

function SessionsEmptyState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <p className="text-white/60 text-sm font-medium">Sin sesiones creadas este día</p>
      <p className="text-zinc-500 text-xs text-center font-medium">
        Completa una sesión para ver tu registro aquí
      </p>
    </div>
  )
}