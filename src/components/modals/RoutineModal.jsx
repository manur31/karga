import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/queries/useAuth';
import { useExercises, useFavoriteExercises } from '../../hooks/queries/useExercises';
import { useDeleteExercisesRoutine } from '../../hooks/mutations/useRoutinesMutation';
import { ArrowLeft, CheckIcon, PlusIcon } from '../icons';
import SetModal from './SetModal';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import CustomExerciseModal from './CustomExerciseModal';
import ConfirmModal from './ConfirmModal';

const ThreeDotsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>
);

export default function RoutineModal({ routine, onClose, onAddExercises, onDeleteRoutine }) {
  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: popularExercises, isLoading: isPopularLoading, isError: isPopularError } = useExercises(profile_id);
  const { data: userExercises, isLoading: isUserLoading, isError: isUserError } = useFavoriteExercises(profile_id);
  
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
  allExercises.sort((a, b) => a.name.localeCompare(b.name));

  const [isAddingExercises, setIsAddingExercises] = useState(false);
  const [isAddingClosing, setIsAddingClosing] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);

  const handleCreateCustomExercise = () => {
    setIsCustomExerciseModalOpen(true);
  };

  const [selectedExerciseToLog, setSelectedExerciseToLog] = useState(null);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  
  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExercisesForDelete, setSelectedExercisesForDelete] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteRoutineConfirmDialog, setShowDeleteRoutineConfirmDialog] = useState(false);
  const { mutateAsync: deleteExercisesRoutine } = useDeleteExercisesRoutine(profile_id);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedExercisesForDelete([]);
    setIsMenuOpen(false);
  };

  const toggleDeleteSelection = (exerciseId) => {
    setSelectedExercisesForDelete(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleDeleteSelected = async () => {
    if (!profile_id || selectedExercisesForDelete.length === 0) return;
    try {
      await deleteExercisesRoutine({
        routine_id: routine.routine_id,
        id_exercises: selectedExercisesForDelete
      });
      setIsEditMode(false);
      setSelectedExercisesForDelete([]);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error al borrar ejercicios de la rutina:", error);
    }
  };

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
    setIsMenuOpen(false);
    setShowDeleteRoutineConfirmDialog(true);
  };

  const handleConfirmDeleteRoutine = () => {
    setShowDeleteRoutineConfirmDialog(false);
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

  const handleCloseAddingExercises = () => {
    setIsAddingClosing(true);
    setTimeout(() => {
      setIsAddingExercises(false);
      setIsAddingClosing(false);
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
    
    setSelectedExercises([]);
    handleCloseAddingExercises();
  };

  const handleExerciseClick = (exercise) => {
    if (isAddingExercises) {
      handleToggleExercise(exercise.id);
    } else {
      setSelectedExerciseForHistory(exercise);
      setIsHistoryModalOpen(true);
    }
  };

  if (!routine) return null;

  return createPortal(
    <>
      <div className="fixed top-0 bottom-19 left-0 w-full sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 z-40 flex flex-col overflow-hidden pointer-events-none">
      
      <div className={`w-full h-full flex flex-col relative bg-dark-bg pointer-events-auto ${
        isClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'
      }`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-input-bg shrink-0 z-30">
          <button 
            onClick={() => isAddingExercises ? handleCloseAddingExercises() : handleCloseWithAnimation()} 
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
            <span className="text-lg font-black text-white tracking-tight truncate w-full text-center">
              {isAddingExercises && !isAddingClosing ? "Seleccionar ejercicios" : (routine.name?.trim() ? routine.name : "Nueva rutina")}
            </span>
          </div>
          
          {isAddingExercises && !isAddingClosing ? (
            <button 
              onClick={handleSaveAddedExercises}
              disabled={selectedExercises.length === 0}
              className="text-karga-orange font-bold text-sm px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity animate-fade-in"
            >
              Guardar
            </button>
          ) : isEditMode ? (
            <button 
              onClick={toggleEditMode}
              className="text-karga-orange font-bold text-sm px-2 py-1.5 active:scale-95 transition-all w-16 text-right"
            >
              Cancelar
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
                    onClick={toggleEditMode}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5 transition-colors border-b border-white/5"
                  >
                    Editar ejercicios
                  </button>
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

        {/* CONTENEDOR PRINCIPAL */}
        <div className="flex-1 relative overflow-hidden flex flex-col z-10">
          
          {/* VISTA DE DETALLE (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6 scrollbar-none [&::-webkit-scrollbar]:none">
            
            {routine.description && (
              <p className="text-sm font-medium text-zinc-400 text-center -mt-2 animate-fade-in leading-relaxed">
                {routine.description}
              </p>
            )}

            {!isEditMode && (
              <button
                onClick={() => setIsAddingExercises(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-linear-to-r from-karga-orange to-red-600 text-white rounded-full font-bold shadow-lg transition-all active:scale-[0.98]"
              >
                <PlusIcon className="w-5 h-5" />
                Agregar ejercicios
              </button>
            )}

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
                      return (
                        <div 
                          key={exercise.id}
                          onClick={() => {
                            if (isEditMode) toggleDeleteSelection(exercise.id);
                            else handleExerciseClick(exercise);
                          }}
                          className={`flex items-center justify-between p-4 rounded-2xl transition-colors cursor-pointer ${
                            isEditMode && selectedExercisesForDelete.includes(exercise.id)
                              ? 'bg-red-500/10 border border-red-500/50'
                              : 'bg-input-bg border border-transparent hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isEditMode && (
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                selectedExercisesForDelete.includes(exercise.id) ? 'bg-red-500 border-red-500' : 'border-zinc-500'
                              }`}>
                                {selectedExercisesForDelete.includes(exercise.id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            )}
                            <div className="flex flex-col pr-4">
                              <span className="text-[15px] font-bold text-white tracking-tight">{exercise.name}</span>
                              <span className="text-[11px] text-zinc-500 font-semibold capitalize mt-0.5">{Array.isArray(exercise.muscle) ? exercise.muscle.join(' - ') : exercise.muscle}</span>
                            </div>
                          </div>

<<<<<<< HEAD
                          {!isEditMode && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExerciseToLog(exercise);
                                setIsSetModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-full bg-[var(--color-dark-bg)] hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
                            >
                              <PlusIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
=======
                          <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(exercise); }}
                                className="p-2 -mr-1 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer pointer-events-auto"
                              >
                                <HeartIcon filled={isFav} className={`w-5 h-5 ${isFav ? 'text-red-500' : ''}`} />
                              </button>
                              {!isEditMode && (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExerciseToLog(exercise);
                                    setIsSetModalOpen(true);
                                  }}
                                  className="w-8 h-8 rounded-full bg-dark-bg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
                                >
                                  <PlusIcon className="w-5 h-5 text-white" />
                                </div>
                              )}
                          </div>
>>>>>>> dev
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* VISTA DE SELECCIÓN DE EJERCICIOS (OVERLAY SCROLLABLE) */}
          {isAddingExercises && (
            <div className={`absolute inset-0 bg-dark-bg z-20 flex flex-col ${isAddingClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'}`}>
              <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-3 scrollbar-none [&::-webkit-scrollbar]:none">
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
                          ? 'bg-karga-gray border-green-500/50 shadow-lg shadow-green-500/5 cursor-pointer' 
                          : 'bg-karga-gray border-transparent hover:bg-white/2 cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col flex-1 pr-4">
                      <span className="text-[15px] text-zinc-100 font-bold tracking-tight">{exercise.name}</span>
                      <span className="text-[11px] text-zinc-500 font-semibold mt-0.5 capitalize">
                        {alreadyInRoutine ? 'Ya está en la rutina' : (Array.isArray(exercise.muscle) ? exercise.muscle.join(' - ') : exercise.muscle)}
                      </span>
                    </div>

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
                );
              })
            )}
              </div>

              {/* BOTÓN CREAR EJERCICIO PERSONALIZADO */}
              <div className="absolute bottom-[-0.1px] inset-x-0 p-5 pb-0 pt-12 bg-linear-to-t from-dark-bg via-dark-bg to-transparent z-30">
                <button
                  type="button"
                  onClick={handleCreateCustomExercise}
                  className="flex items-center justify-center gap-2 p-4 w-full rounded-2xl border-2 border-dashed border-white/10 text-zinc-400 font-bold text-sm hover:border-karga-orange/40 hover:text-karga-orange hover:bg-karga-orange/5 transition-all active:scale-[0.99] bg-dark-bg shadow-2xl"
                >
                  <PlusIcon className="w-4 h-4" />
                  Crear ejercicio personalizado
                </button>
              </div>
            </div>
          )}

          {/* FAB DELETE */}
          {isEditMode && selectedExercisesForDelete.length > 0 && !isAddingExercises && (
            <div className="absolute bottom-8 left-6 z-30 animate-slide-in-up">
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="h-14 px-6 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center transition-all active:scale-95 gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Eliminar {selectedExercisesForDelete.length} ejercicio{selectedExercisesForDelete.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

        </div>
      </div>
      </div>

      {/* EXERCISE HISTORY MODAL */}
      {isHistoryModalOpen && selectedExerciseForHistory && (
        <ExerciseHistoryModal 
          exercise={selectedExerciseForHistory} 
          onClose={() => setIsHistoryModalOpen(false)} 
        />
      )}

      {/* SET MODAL (BOTTOM SHEET) */}
      {isSetModalOpen && selectedExerciseToLog && (
        <SetModal 
          exercise={selectedExerciseToLog} 
          onClose={() => setIsSetModalOpen(false)} 
        />
      )}

      {/* CUSTOM EXERCISE MODAL */}
      {isCustomExerciseModalOpen && (
        <CustomExerciseModal onClose={() => setIsCustomExerciseModalOpen(false)} />
      )}

      {/* ConfirmModal para borrar ejercicios */}
      <ConfirmModal 
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteSelected}
        title="¿Eliminar ejercicios?"
        description={`Estás a punto de eliminar ${selectedExercisesForDelete.length} ejercicio${selectedExercisesForDelete.length !== 1 ? 's' : ''} de esta rutina. Puedes volver a agregarlos en cualquier momento.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger={true}
      />

      {/* ConfirmModal para borrar rutina */}
      <ConfirmModal 
        isOpen={showDeleteRoutineConfirmDialog}
        onClose={() => setShowDeleteRoutineConfirmDialog(false)}
        onConfirm={handleConfirmDeleteRoutine}
        title="¿Eliminar rutina?"
        description={`Estás a punto de eliminar la rutina "${routine.name}". Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger={true}
      />
    </>
  , document.body);
}
