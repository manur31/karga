import { useState, useEffect } from "react";
import Card from "../../components/Card/Card";
import Avatar from "../../components/Avatar/Avatar";
import { formatRelativeTime } from "../../utils/timeFormatter";
import { FiPlus, FiMoreVertical } from "react-icons/fi";

const PinIcon = ({ filled, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {filled ? (
      <path d="M16 12l2 2v2H13v6l-1 1-1-1v-6H5v-2l2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v7z" stroke="none" />
    ) : (
      <path d="M16 12l2 2v2H13v6l-1 1-1-1v-6H5v-2l2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v7z" />
    )}
  </svg>
);

export default function RoutinesList({ 
  routines, 
  onOpenRoutine, 
  onCreateRoutine,
  onEditRoutine,
  onDeleteRoutine 
}) {
  const [pinnedRoutines, setPinnedRoutines] = useState(() => {
    const saved = localStorage.getItem('pinnedRoutines');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    if (activeMenuId === null) return;
    const handleCloseMenus = () => setActiveMenuId(null);
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, [activeMenuId]);

  if (routines.length === 0) {
    return (
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-3 mb-5 mt-4">
          <div className="h-5 w-1 bg-karga-orange rounded-full" />
          <h2 className="text-lg font-black text-white tracking-wide">Mis Rutinas</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-zinc-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-zinc-400">Sin rutinas creadas</p>
            <p className="text-xs text-zinc-600 max-w-60">Diseña una rutina personalizada arriba para verla listada en esta sección.</p>
          </div>
        </div>
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
      <div className="flex items-center gap-3 mb-5 mt-4">
        <div className="h-5 w-1 bg-karga-orange rounded-full" />
        <h2 className="text-lg font-black text-white tracking-wide">Mis Rutinas</h2>
        <div className="flex-1 h-px bg-white/5" />
      </div>
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
                  className={`p-2 -mr-1 transition-colors rounded-full flex items-center justify-center ${
                    isPinned ? 'text-karga-orange bg-karga-orange/10' : 'text-zinc-500 bg-transparent hover:bg-white/5'
                  }`}
                >
                  <PinIcon filled={isPinned} className="w-4 h-4" />
                </button>
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === data.routine_id ? null : data.routine_id);
                    }}
                    className={`p-2 -mr-2 transition-colors rounded-full flex items-center justify-center ${
                      activeMenuId === data.routine_id ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FiMoreVertical className="w-4.5 h-4.5" />
                  </button>

                  {activeMenuId === data.routine_id && (
                    <div className="absolute right-0 mt-2 w-36 bg-[#2A2424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditRoutine(data);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer"
                      >
                        Editar rutina
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteRoutine(data.routine_id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {/* Ghost card to create a new routine */}
        <button
          onClick={onCreateRoutine}
          className="p-4 flex flex-row items-center justify-center gap-3 bg-white/2 hover:bg-white/5 border border-dashed border-white/10 rounded-2xl cursor-pointer active:scale-[0.98] transition-all text-zinc-500 hover:text-zinc-300"
        >
          <FiPlus className="w-5 h-5" />
          <span className="text-sm font-bold">Crear nueva rutina</span>
        </button>
      </div>
    </div>
  );
}
