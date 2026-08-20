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
import { useSets } from "../hooks/queries/useSets";
import { useSessions, useWeekActivity } from "../hooks/queries/useSessions";
import SessionCard from "../components/calendar/SessionCard";
import { format } from "date-fns";
import { FiChevronDown } from "react-icons/fi";
import { getCachedProfile } from "../storage/profile-storage";
import { WeekActivity } from "../components/sets/WeekActivity";

function toDateKey(item) {
  const raw =
    item.created_at ||
    item.createdAt ||
    item.startedAt ||
    item.started_at ||
    item.time_init ||
    item.createAt ||
    null;

  if (!raw) return null;

  const date = new Date(raw);
  if (isNaN(date.getTime())) return null;

  return format(date, "yyyy-MM-dd");
}

export default function HistoryScreen() {
  const {
    selectedDate,
    isMonthModalOpen,
    setSelectedDate,
    toggleMonthModal,
    closeMonthModal,
  } = useCalendarStore();

  const profile = getCachedProfile();
  const profile_id = profile?.profile_id;
  const weekActivity = useWeekActivity(profile_id)?.data || [];

  const { data: popularExercises } = useExercises(profile_id);
  const { data: userExercises } = useFavoriteExercises(profile_id);
  const { data: sets = [], isLoading: isSetsLoading } = useSets(profile_id);
  const { data: sessions = [], isLoading: isSessionsLoading } =
    useSessions(profile_id);

  const userExercisesList = userExercises?.map((exercise) => ({
    ...exercise.exercises,
  }));

  const exercises = [...(popularExercises || []), ...(userExercisesList || [])];

  const [monthRef, setMonthRef] = useState(() => new Date());

  const [isSessionsOpen, setIsSessionsOpen] = useState(false);

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(today);
    setMonthRef(new Date(today + "T00:00:00"));
  }, [setSelectedDate]);

  // Live from Dexie — no calendarStore cache
  const dayActivity = useMemo(() => {
    const daySets = sets.filter((s) => toDateKey(s) === selectedDate);
    const daySessions = sessions.filter(
      (s) => toDateKey(s) === selectedDate,
    );
    return { sets: daySets, sessions: daySessions };
  }, [sets, sessions, selectedDate]);

  const activeDates = useMemo(() => {
    const dates = new Set();
    for (const s of sets) {
      const key = toDateKey(s);
      if (key) dates.add(key);
    }
    for (const s of sessions) {
      const key = toDateKey(s);
      if (key) dates.add(key);
    }
    return dates;
  }, [sets, sessions]);

  const metrics = useMemo(
    () => calculateDailyMetrics(dayActivity),
    [dayActivity],
  );

  const selectedSessions = dayActivity.sessions;

  function handleSelectDate(dateStr) {
    setSelectedDate(dateStr);
    setMonthRef(new Date(dateStr + "T00:00:00"));
  }

  function handleModalSelectDate(dateStr) {
    setSelectedDate(dateStr);
    setMonthRef(new Date(dateStr + "T00:00:00"));
    closeMonthModal();
  }

  function handlePrevMonth() {
    setMonthRef((m) => getPrevMonth(m));
  }

  function handleNextMonth() {
    setMonthRef((m) => getNextMonth(m));
  }

  return (
    <div className="min-h-screen flex flex-col w-full animate-fade-in bg-dark-bg overflow-hidden relative pb-20 pt-10 px-4">
      <CalendarHeader
        referenceDate={monthRef}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onMonthPress={toggleMonthModal}
        selectedDate={selectedDate}
      />

      <div className="mt-2">
        <WeeklyStrip
          selectedDate={selectedDate}
          activeDates={activeDates}
          onSelectDate={handleSelectDate}
          monthRef={monthRef}
          onWeekChange={(newWeek) => setMonthRef(newWeek)}
        />
      </div>

      <div className="mx-4 mt-4 h-px bg-white/5" />

      <div className="flex-1 overflow-y-auto pb-8">
        <DailySummary metrics={metrics} />

        <WeekActivity user={profile} weekActivity={weekActivity} />

        <div className="mt-8">
          <div className="mx-4">
            <button
              onClick={() => setIsSessionsOpen(!isSessionsOpen)}
              className="w-full flex items-center justify-between text-white text-[17px] font-bold px-5 py-4 bg-white/5 hover:bg-white/10 rounded-2xl outline-none active:scale-[0.98] transition-all"
            >
              Sesiones del día
              <FiChevronDown
                className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isSessionsOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div
            className={`grid transition-all duration-300 ease-in-out ${isSessionsOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              {isSessionsLoading ? (
                <SessionsLoadingState />
              ) : selectedSessions?.length > 0 ? (
                selectedSessions.map((session) => (
                  <SessionCard
                    key={session.id || session.session_id}
                    session={session}
                  />
                ))
              ) : (
                <SessionsEmptyState />
              )}
            </div>
          </div>
        </div>

        <ActivityList
          dayActivity={dayActivity}
          exercises={exercises}
          isLoading={isSetsLoading}
        />
      </div>

      <MonthModal
        isOpen={isMonthModalOpen}
        selectedDate={selectedDate}
        activeDates={activeDates}
        onSelectDate={handleModalSelectDate}
        onClose={closeMonthModal}
      />
    </div>
  );
}

function SessionsLoadingState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <span className="animate-pulse size-12 bg-karga-gray rounded-full"></span>
      <p className="text-white/60 text-sm font-medium">Cargando sesiones...</p>
    </div>
  );
}

function SessionsEmptyState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <p className="text-white/60 text-sm font-medium">
        Sin sesiones creadas este día
      </p>
      <p className="text-zinc-500 text-xs text-center font-medium">
        Completa una sesión para ver tu registro aquí
      </p>
    </div>
  );
}
