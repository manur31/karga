import { useState, useRef, useEffect } from 'react';
import { useExercises, useFavoriteExercises } from '../../../hooks/queries/useExercises';
import { useUpdateFavorite, useAddToFavorite } from '../../../hooks/mutations/useExercisesMutations';
import { formatRelativeTime } from '../../../utils/timeFormatter';
import { ArrowLeft, CheckIcon, PlusIcon } from '../../icons';
import SetModal from '../SetModal/SetModal';

const HeartIcon = ({ filled, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={filled ? 0 : 2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

// Backend integration ready

const ThreeDotsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>
);

export default function RoutineModal({ routine, onClose, onAddExercises, onDeleteRoutine }) {
  const { data: popularExercises, isLoading: isPopularLoading, isError: isPopularError } = useExercises();
  const { data: userExercises, isLoading: isUserLoading, isError: isUserError } = useFavoriteExercises();
  
  const { mutateAsync: updateFavorite } = useUpdateFavorite();
  const { mutateAsync: addToFavorite } = useAddToFavorite();

  const isLoading = isPopularLoading || isUserLoading;
  const isError = isPopularError || isUserError;

  const exercisesMap = new Map();
  if (userExercises) {
    userExercises.forEach(ue => {
      if (ue.exercises) {
        exercisesMap.set(ue.exercises.id, { ...ue.exercises, is_favorite: ue.is_favorite });
      }
    });
  }
  if (popularExercises) {
    popularExercises.forEach(ex => {
      if (!exercisesMap.has(ex.id)) {
        exercisesMap.set(ex.id, { ...ex, is_favorite: false });
      }
    });
  }

  const allExercises = Array.from(exercisesMap.values());
  allExercises.sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleToggleFavorite = async (exercise) => {
    const inUserExercises = userExercises?.some(ue => ue.exercise_id === exercise.id);
    const isFav = userExercises?.some(ue => ue.exercise_id === exercise.id && ue.is_favorite);
    try {
      if (inUserExercises) {
        await updateFavorite({ exercise_id: exercise.id, is_favorite: !isFav });
      } else {
        await addToFavorite(exercise.id);
      }
    } catch (e) { console.error(e); }
  };

  const [isAddingExercises, setIsAddingExercises] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [selectedExerciseToLog, setSelectedExerciseToLog] = useState(null);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDeleteClick = () => {
    if (onDeleteRoutine) {
      onDeleteRoutine();
    }
  };

  const handleCloseWithAnimation = () => {
    setIsClosing(true); 
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleToggleExercise = (exerciseId) => {
    setSelectedExercises((prev) => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleSaveAddedExercises = () => {
    if (onAddExercises && selectedExercises.length > 0) {
      onAddExercises(selectedExercises);
    }
    // Clean up and return to details view
    setSelectedExercises([]);
    setIsAddingExercises(false);
  };

  const handleExerciseClick = (exercise) => {
    if (isAddingExercises) {
      handleToggleExercise(exercise.id);
    } else {
      setSelectedExerciseToLog(exercise);
      setIsSetModalOpen(true);
    }
  };

  if (!routine) return null;

  return (
    <>
      <div className="fixed top-0 bottom-[76px] left-0 w-full sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 z-40 flex flex-col overflow-hidden pointer-events-none">
      
      <div className={`w-full h-full flex flex-col relative bg-[var(--color-dark-bg)] pointer-events-auto ${
        isClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'
      }`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-[var(--color-input-bg)] shrink-0 z-20">
          <button 
            onClick={() => isAddingExercises ? setIsAddingExercises(false) : handleCloseWithAnimation()} 
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
            <span className="text-lg font-black text-white tracking-tight truncate w-full text-center">
              {isAddingExercises ? "Seleccionar ejercicios" : (routine.name?.trim() ? routine.name : "Nueva rutina")}
            </span>
            {!isAddingExercises && routine.description && (
              <span className="text-sm font-medium text-zinc-400 truncate w-full text-center mt-0.5">
                {routine.description}
              </span>
            )}
          </div>
          
          {isAddingExercises ? (
            <button 
              onClick={handleSaveAddedExercises}
              disabled={selectedExercises.length === 0}
              className="text-karga-orange font-bold text-sm px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Guardar
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 transition-colors rounded-full ${isMenuOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <ThreeDotsIcon className="w-6 h-6" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#2A2424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <button 
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Borrar rutina
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:none z-10">
          
          {!isAddingExercises ? (
            /* VISTA DE DETALLE */
            <>
              <button
                onClick={() => setIsAddingExercises(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-linear-to-r from-karga-orange to-red-600 text-white rounded-full font-bold shadow-xl shadow-karga-orange/20 transition-all active:scale-[0.98]"
              >
                <PlusIcon className="w-5 h-5" />
                Agregar ejercicios
              </button>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mb-1">
                  Ejercicios en esta rutina
                </h3>
                
                {(() => {
                  const exercisesToRender = routine.routines_exercises?.map(re => re.exercises).filter(Boolean) || [];

                  if (exercisesToRender.length === 0) {
                    return (
                      <div className="text-center py-8 px-4 text-zinc-500 text-sm font-medium border border-dashed border-white/10 rounded-2xl">
                        Aún no tienes ejercicios en esta rutina.
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3">
                      {exercisesToRender.map((exercise) => {
                        const isFav = userExercises?.some(ue => ue.exercise_id === exercise.id && ue.is_favorite);
                        return (
                          <div 
                            key={exercise.id}
                            onClick={() => handleExerciseClick(exercise)}
                            className="flex items-center justify-between p-4 bg-[var(--color-input-bg)] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <div className="flex flex-col pr-4">
                              <span className="text-[15px] font-bold text-white tracking-tight">{exercise.name}</span>
                              <span className="text-[11px] text-zinc-500 font-semibold capitalize mt-0.5">{exercise.muscle}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(exercise); }}
                                className="p-2 -mr-1 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer pointer-events-auto"
                              >
                                <HeartIcon filled={isFav} className={`w-5 h-5 ${isFav ? 'text-red-500' : ''}`} />
                              </button>
                              <div className="w-8 h-8 rounded-full bg-[var(--color-dark-bg)] flex items-center justify-center shrink-0">
                                <PlusIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            /* VISTA DE SELECCIÓN DE EJERCICIOS */
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end mb-1 pl-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Ejercicios disponibles
                </label>
                <span className="text-xs text-karga-orange font-bold">
                  {selectedExercises.length} seleccionados
                </span>
              </div>

              {isLoading && allExercises.length === 0 ? (
                <div className="p-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-karga-orange border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-red-400 text-sm text-center p-4 bg-red-500/10 rounded-2xl border border-red-500/10 font-medium">
                  Error al cargar los ejercicios.
                </div>
              ) : (
                allExercises && allExercises.map((exercise) => {
                  const alreadyInRoutine = routine.routines_exercises?.some(re => re.id_exercises === exercise.id);
                  const isSelected = selectedExercises.includes(exercise.id);

                  return (
                  <div 
                    key={exercise.id}
                    onClick={() => {
                      if (alreadyInRoutine) return;
                      handleExerciseClick(exercise);
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                      alreadyInRoutine
                        ? 'opacity-40 cursor-not-allowed bg-black/20 border-transparent'
                        : isSelected 
                          ? 'bg-[var(--color-karga-gray)] border-green-500/50 shadow-lg shadow-green-500/5 cursor-pointer' 
                          : 'bg-[var(--color-karga-gray)] border-transparent hover:bg-white/[0.02] cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col flex-1 pr-4">
                      <span className="text-[15px] text-zinc-100 font-bold tracking-tight">{exercise.name}</span>
                      <span className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                        {alreadyInRoutine ? 'Ya está en la rutina' : exercise.muscle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(exercise); }}
                        className={`p-2 -mr-1 transition-colors cursor-pointer pointer-events-auto ${alreadyInRoutine ? 'opacity-50 hover:text-red-500 text-zinc-500' : 'text-zinc-500 hover:text-red-500'}`}
                      >
                        <HeartIcon filled={exercise.is_favorite} className={`w-5 h-5 ${exercise.is_favorite ? 'text-red-500' : ''}`} />
                      </button>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 ${
                        alreadyInRoutine
                          ? 'border-transparent'
                          : isSelected 
                            ? 'border-green-500 bg-green-500/10 scale-105' 
                            : 'border-zinc-600 bg-transparent'
                      }`}>
                        {alreadyInRoutine ? (
                          <CheckIcon className="w-4 h-4 text-zinc-500" />
                        ) : isSelected ? (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          )}

        </div>
      </div>
      </div>

      {/* SET MODAL (BOTTOM SHEET) */}
      {isSetModalOpen && selectedExerciseToLog && (
        <SetModal 
          exercise={selectedExerciseToLog} 
          onClose={() => setIsSetModalOpen(false)} 
        />
      )}
    </>
  );
}
