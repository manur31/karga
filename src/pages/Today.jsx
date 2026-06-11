import { useState, useMemo, useEffect } from 'react'
import { useCalendarStore } from '../stores/calendarStore'
import { calculateDailyMetrics, getNextMonth, getPrevMonth } from '../lib/calendarUtils'
import CalendarHeader from '../components/calendar/CalendarHeader'
import WeeklyStrip from '../components/calendar/WeeklyStrip'
import DailySummary from '../components/calendar/DailySummary'
import ActivityList from '../components/calendar/ActivityList'
import MonthModal from '../components/calendar/MothModal'
import { useExercises, useFavoriteExercises } from '../hooks/queries/useExercises'
import { useAuth } from '../hooks/queries/useAuth'
import { useSets } from '../hooks/queries/useSets'
import { useSessions } from '../hooks/queries/useSessions'
import { useSetsStore } from '../stores/setsStore'
import { useSesionStore } from '../stores/sesionStore'
import SessionCard from '../components/calendar/SessionCard'
import { format } from 'date-fns'

/**
 * HistoryScreen
 *
 * The main calendar / history view of Karga.
 *
 * Props:
 *   exerciseMap   { [exercise_id]: exerciseName }
 *                 Pass this down from wherever you resolve exercise names.
 *                 Defaults to {} — cards will show the raw exercise_id if missing.
 *
 * Usage:
 *   <HistoryScreen exerciseMap={exerciseMap} />
 *
 * Data integration:
 *   On app boot, after fetching from Supabase, call:
 *     useCalendarStore.getState().loadFromSupabase({ sets, sessions })
 *
 *   After every useSetsStore.addSet() or useSesionStore.finish(), call:
 *     useCalendarStore.getState().syncLocalData({
 *       sets: useSetsStore.getState().sets,
 *       sessions: useSesionStore.getState().sessions,
 *     })
 */
export default function HistoryScreen() {
  const {
    selectedDate,
    isMonthModalOpen,
    activityByDate,
    setSelectedDate,
    openMonthModal,
    closeMonthModal,
    getActivityForDate,
    getActiveDates,
    loadFromSupabase,
    syncLocalData
  } = useCalendarStore()

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: popularExercises} = useExercises(profile_id);
  const { data: userExercises} = useFavoriteExercises(profile_id);
  const { data: sets, isLoading: isLoadingSets} = useSets(profile_id)
  const { data: sessions, isLoading: isLoadingsessions} = useSessions(profile_id)
  const { sets: setsFromStore } = useSetsStore()
  const { sessions: sessionsFromStore } = useSesionStore()

  useEffect(() => {
    loadFromSupabase({ sets, sessions })
    syncLocalData({ sets: setsFromStore, sessions: sessionsFromStore })
  }, [sets, sessions, setsFromStore, sessionsFromStore])

  const userExercisesList = userExercises?.map(exercise => ({
    ...exercise.exercises
  }))

  const exercises = [...(popularExercises || []), ...(userExercisesList || [])];

  // Month navigator state (used by header and modal in sync)
  const [monthRef, setMonthRef] = useState(
    selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
  )

  // Active dates set — memoized so DayCell/MonthGrid don't recalculate each render
  const activeDates = useMemo(() => getActiveDates(), [activityByDate])

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
    const sessionDate = format(new Date(session.created_at), 'yyyy-MM-dd')
    return sessionDate === selectedDate
  })

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    // Full-screen dark container — adjust to your router/nav setup
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#272121' }}
    >
      {/* Header: title + month navigator */}
      <CalendarHeader
        referenceDate={monthRef}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onMonthPress={openMonthModal}
      />

      {/* Weekly strip */}
      <div className="mt-2">
        <WeeklyStrip
          selectedDate={selectedDate}
          activeDates={activeDates}
          onSelectDate={handleSelectDate}
        />
      </div>

      {/* Divider */}
      <div className="mx-4 mt-4 h-px bg-white/5" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Summary cards */}
        <DailySummary metrics={metrics} />

        {/* Session card */}
        <div className="mt-4">
          <h2 className="text-white text-lg font-semibold mb-3 px-4">Sesiones</h2>
          {selectedSessions?.length > 0 ? (
            selectedSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <p className="text-white/40 text-sm px-4">Sin sesiones este día</p>
          )}
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


// import { useState, useEffect } from 'react';
// import Card from '../components/Card/Card';
// import Avatar from '../components/Avatar/Avatar';
// import { Mancuerna } from '../components/icons';
// import ChevronIcon from '../components/icons/ChevronIcon';
// import RepeatIcon from '../components/icons/RepeatIcon';
// import TargetIcon from '../components/icons/TargetIcon';


// export default function Today() {
//   const [isLoading, setIsLoading] = useState(true);
  
//   // estados para el calendario y los datos del día
//   const [selectedDate, setSelectedDate] = useState('2026-05-28');
//   const [monthLabel, setMonthLabel] = useState('Mayo 2026');
//   const [calendarDays, setCalendarDays] = useState([]);
//   const [dailyStats, setDailyStats] = useState({ exercises: 0, sets: 0, reps: 0 });
//   const [activities, setActivities] = useState([]);

//   useEffect(() => {
//     // para la integración con supabase,
//     // cargar el rango de días permitidos (desde creación de cuenta).
//     // fetch a actividad diaria basado en el selectedDate.
//     const fetchTodayData = async () => {
//       try {
//         setIsLoading(true);
//         await new Promise(resolve => setTimeout(resolve, 800));

//         // mocked, borrar lueg
//         const mockCalendar = [
//           { dateStr: '2026-05-25', dayName: 'LUN', dayNum: '25', hasActivity: false },
//           { dateStr: '2026-05-26', dayName: 'MAR', dayNum: '26', hasActivity: true },
//           { dateStr: '2026-05-27', dayName: 'MIÉ', dayNum: '27', hasActivity: false },
//           { dateStr: '2026-05-28', dayName: 'JUE', dayNum: '28', hasActivity: true }, // esto es para el puntito, habria q ver si nos interesa dejarlo la vdd pq es un detalle.
//           { dateStr: '2026-05-29', dayName: 'VIE', dayNum: '29', hasActivity: false },
//           { dateStr: '2026-05-30', dayName: 'SÁB', dayNum: '30', hasActivity: false },
//           { dateStr: '2026-05-31', dayName: 'DOM', dayNum: '31', hasActivity: false },
//         ];

//         const mockStats = {
//           exercises: 6,
//           sets: 18,
//           reps: 156
//         };

//         const mockActivities = [
//           { id: 1, name: 'Press Militar', details: '4 sets • 60kg', time: '09:30' },
//           { id: 2, name: 'Elevaciones Laterales', details: '3 sets • 12kg', time: '09:45' },
//           { id: 3, name: 'Press Arnold', details: '3 sets • 22kg', time: '10:00' },
//         ];

//         setCalendarDays(mockCalendar);
//         setDailyStats(mockStats);
//         setActivities(mockActivities);
//       } catch (error) {
//         console.error("Error al cargar los datos del día:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTodayData();
//   }, [selectedDate]); // se vuelve a ejecutar si se toca otro día

//   return (
//     <div className="flex flex-col w-full animate-fade-in">
      
//       {/* HEADER CONTROLS */}
//       <div className="flex items-center justify-between mb-6 px-2">
//         <h1 className="text-3xl font-black text-white tracking-tight">
//           Hoy
//         </h1>
        
//         {/* Selector de mes */}
//         <div className="flex items-center gap-3 text-zinc-400">
        
//         {/* Botón izq*/}
//         <button className="hover:text-white transition-colors focus:outline-none">
//             <ChevronIcon />
//         </button>
        
//         <span className="text-sm font-bold">{monthLabel}</span>
        
//         {/* Botón derecho*/}
//         <button className="hover:text-white transition-colors focus:outline-none">
//             <ChevronIcon direction="right" />
//         </button>

//         </div>


//       </div>

//       {/* deslizador de fechas*/}
//       <div className="flex gap-2 overflow-x-auto pb-4 mb-4 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
//         {calendarDays.map((day) => {
//           const isActive = day.dateStr === selectedDate;
          
//           return (
//             <button
//               key={day.dateStr}
//               onClick={() => setSelectedDate(day.dateStr)}
//               className={`flex flex-col items-center justify-center min-w-16 h-20 rounded-2xl transition-all snap-center shrink-0 ${
//                 isActive 
//                   ? 'bg-karga-orange text-white shadow-lg shadow-karga-orange/20' 
//                   : 'bg-karga-gray text-zinc-400 hover:bg-white/10'
//               }`}
//             >
//               <span className="text-[10px] font-bold tracking-widest uppercase mb-1">
//                 {day.dayName}
//               </span>
//               <span className={`text-xl font-black leading-none ${isActive ? 'text-white' : 'text-zinc-200'}`}>
//                 {day.dayNum}
//               </span>
              
//               {/* para el puntito indicador de actividad, solo si es que lo decidimos dejar.*/}
//               <div className="h-1.5 flex items-end mt-1">
//                 {day.hasActivity && (
//                   <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-karga-orange'}`} />
//                 )}
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12">
//           <div className="w-8 h-8 border-4 border-t-karga-orange border-white/5 rounded-full animate-spin" />
//         </div>
//       ) : (
//         <div className="flex flex-col gap-8 px-2">
          
//           {/* grlla de estadisticas */}
//           <div className="grid grid-cols-3 gap-3">
            
//             {/* ejercicios */}
//             <Card variant="default" className="p-4 flex flex-col items-center justify-center text-center">
//               <div className="w-10 h-10 rounded-full bg-karga-orange/15 text-karga-orange flex items-center justify-center mb-3">
//                 <Mancuerna/>
//               </div>
//               <span className="text-2xl font-black text-white leading-none mb-1">{dailyStats.exercises}</span>
//               <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">Ejercicios</span>
//             </Card>

//             {/* Series */}
//             <Card variant="default" className="p-4 flex flex-col items-center justify-center text-center">
//               <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mb-3">
//                 <RepeatIcon/>
//               </div>
//               <span className="text-2xl font-black text-white leading-none mb-1">{dailyStats.sets}</span>
//               <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">Series</span>
//             </Card>

//             {/* Reps */}
//             <Card variant="default" className="p-4 flex flex-col items-center justify-center text-center">
//               <div className="w-10 h-10 rounded-full bg-green-500/15 text-green-500 flex items-center justify-center mb-3">
//                 <TargetIcon/>
//               </div>
//               <span className="text-2xl font-black text-white leading-none mb-1">{dailyStats.reps}</span>
//               <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">Reps</span>
//             </Card>
//           </div>

//           {/* ACTIVIDAD DEL DÍA */}
//           <div className="flex flex-col gap-3">
//             <h2 className="text-lg font-bold text-white mb-1">Actividad del día</h2>
            
//             {activities.length > 0 ? (
//               activities.map((activity) => (
//                 <Card key={activity.id} variant="default" className="p-4 flex items-center gap-4">
//                   <Avatar icon={Mancuerna} variant="orange" size="md" />
                  
//                   <div className="flex flex-col flex-1">
//                     <span className="text-base font-bold text-zinc-100 leading-tight">
//                       {activity.name}
//                     </span>
//                     <span className="text-xs font-medium text-zinc-500 mt-0.5">
//                       {activity.details}
//                     </span>
//                   </div>

//                   <span className="text-xs font-medium text-zinc-500">
//                     {activity.time}
//                   </span>
//                 </Card>
//               ))
//             ) : (
//               <div className="text-center py-6 text-zinc-500 text-sm font-medium">
//                 No hay actividad registrada para este día.
//               </div>
//             )}
//           </div>

//         </div>
//       )}
//     </div>
//   );
// }