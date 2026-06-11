import { useState } from 'react';
import { groupSetsByExercise } from '../../lib/calendarUtils'
import SessionCard from './SetsCard'

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

  setTimeout(() => {
    setIsLoading(false)
  }, 800);

  return (
    <div className="mt-4">
      <h2 className="text-white font-bold text-lg px-4 mb-3">Actividad del día</h2>

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
  )
}

function EmptyState() {
  return (
    <div className="mx-4 bg-karga-gray rounded-2xl px-4 py-10 flex flex-col items-center gap-2">
      <span className="text-3xl">🏋️</span>
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