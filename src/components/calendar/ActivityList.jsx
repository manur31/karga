import { useState } from 'react';
import { groupSetsByExercise } from '../../lib/calendarUtils'
import SessionCard from './SetsCard'
import { FiChevronDown } from 'react-icons/fi';

/**
 * ActivityList
 *
 * Props:
 *   dayActivity    { sets: [], sessions: [] } | null
 *   exerciseMap    { [exercise_id]: exerciseName }  — optional, for name resolution
 */
export default function ActivityList({ dayActivity, exercises }) {
  const groups = groupSetsByExercise(dayActivity, exercises)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)

  setTimeout(() => {
    setIsLoading(false)
  }, 800);

  return (
    <div className="mt-6">
      <div className="mx-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-white font-bold text-[17px] px-5 py-4 bg-white/5 hover:bg-white/10 rounded-2xl outline-none active:scale-[0.98] transition-all"
        >
          Ejercicios Realizados
          <FiChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 max-h-[2000px] mt-2' : 'opacity-0 max-h-0'}`}>
        { isLoading ? (
        <LoadingState/>
      ) : (
        groups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2.5">
            {groups.map((group) => (
              <SessionCard
                key={group.exercise_id}
                exerciseName={group.exerciseName}
                sets={group.sets}
                sessionTime={group.sessionTime}
              />
            ))}
          </div>
        )
      )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <p className="text-white/60 text-sm font-medium">Sin actividad este día</p>
      <p className="text-white/30 text-xs text-center">
        Completa una sesión para ver tu registro aquí
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <span className="animate-pulse size-12 bg-karga-gray rounded-full"></span>
      <p className="text-white/60 text-sm font-medium">Cargando actividad...</p>
    </div>
  )
}