import { useState, useEffect } from "react";
import Card from "../../components/Card/Card";
import Avatar from "../../components/Avatar/Avatar";
import ChevronIcon from "../../components/icons/ChevronIcon";
import { formatRelativeTime } from "../../utils/timeFormatter";

const PinIcon = ({ filled, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {filled ? (
      <path d="M16 12l2 2v2H13v6l-1 1-1-1v-6H5v-2l2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v7z" stroke="none" />
    ) : (
      <path d="M16 12l2 2v2H13v6l-1 1-1-1v-6H5v-2l2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v7z" />
    )}
  </svg>
);

export default function RoutinesList({ routines, onOpenRoutine }) {
  const [pinnedRoutines, setPinnedRoutines] = useState(() => {
    const saved = localStorage.getItem('pinnedRoutines');
    return saved ? JSON.parse(saved) : [];
  });

  if(routines.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Mis Rutinas</h2>
        <p className="text-gray-400">No hay rutinas disponibles</p>
      </div>
    );
  }

  // useEffect(() => {
  //   localStorage.setItem('pinnedRoutines', JSON.stringify(pinnedRoutines));
  // }, []);

  const togglePin = (e, routineId) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedRoutines(prev => 
      prev.includes(routineId) 
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
    );
  };

  const sortedRoutines = [...routines].sort((a, b) => {
    const aPinned = pinnedRoutines.includes(a.routine_id);
    const bPinned = pinnedRoutines.includes(b.routine_id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col mb-10">
      <h2 className="text-lg font-bold text-white mb-4">Mis Rutinas</h2>
      <div className="flex flex-col gap-3">
        {sortedRoutines.map((data) => {
          const nameString = data.name || '';
          const displayName = nameString.trim() === '' ? 'Nueva rutina' : nameString;
          const initialLetter = displayName.charAt(0).toUpperCase();
          const exercisesCount = data.routines_exercises ? data.routines_exercises.length : 0;
          const lastDone = data.last_done || data.updated_at || data.created_at || null;

          const isPinned = pinnedRoutines.includes(data.routine_id);

          return (
            <Card
              key={data.routine_id}
              variant="default"
              onClick={() => onOpenRoutine(data.routine_id)}
              className={`p-4 flex flex-row items-center gap-4 cursor-pointer active:scale-[0.98] transition-all min-w-0 flex-1 ${
                isPinned 
                  ? 'border-karga-orange/30 bg-dark-bg shadow-sm shadow-karga-orange/5' 
                  : 'hover:bg-white/5 border-transparent'
              }`}
            >
              <Avatar initial={initialLetter} size="md" />
              
              <div className="flex flex-col flex-1 justify-center">
                <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                  {displayName}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {exercisesCount} {exercisesCount === 1 ? 'ejercicio' : 'ejercicios'} • {formatRelativeTime(lastDone)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => togglePin(e, data.routine_id)}
                  className={`p-2 -mr-2 transition-colors rounded-full flex items-center justify-center ${
                    isPinned ? 'text-karga-orange bg-karga-orange/10' : 'text-zinc-500 bg-transparent'
                  }`}
                >
                  <PinIcon filled={isPinned} className="w-4 h-4" />
                </button>
                <ChevronIcon className="w-5 h-5 text-zinc-600" direction="right" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
