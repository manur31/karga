import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useExercises,
  useFavoriteExercises,
} from "../../hooks/queries/useExercises";
import { useDeleteExercisesRoutine, useEditRoutines } from "../../hooks/mutations/useRoutinesMutation";
import { ArrowLeft, CheckIcon, PlusIcon } from "../icons";
import ExerciseHistoryModal from "./ExerciseHistoryModal";
import CustomExerciseModal from "./CustomExerciseModal";
import ConfirmModal from "./ConfirmModal";
import EditRoutineModal from "./EditRoutineModal";
import ExerciseListSelector from "./ExerciseListSelector";
import { useSessionStore } from "../../stores/sessionStore";
import { useRestStore } from "../../stores/restStore";
import { FiMinus, FiSquare, FiMoreVertical, FiTrash2, FiCheck } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import { VscRecord } from "react-icons/vsc";
import { TbChecklist } from "react-icons/tb";
import { useSetsStore } from "../../stores/setsStore";
import { useWeightUnit } from "../../hooks/useWeightUnit";
import SuperSetExpander from "./SuperSetExpander";
import { InlineExerciseExpander } from "./routine-modal/InlineExerciseExpander";
import { WalkthroughTooltip } from "./routine-modal/WalkthroughTooltip";
import SuperSetExpander from "./SuperSetExpander";
import InlineExerciseExpander from "./InlineExerciseExpander";
import ExerciseListSelector from "./ExerciseListSelector";
import { useSessionStore } from "../../stores/sessionStore";
import { FiPlay } from "react-icons/fi";
import { TbChecklist } from "react-icons/tb";
import { getCachedProfile } from "../../storage/profile-storage";

const ThreeDotsIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
    />
  </svg>
);

export default function RoutineModal({
  routine,
  onClose,
  onAddExercises,
  onDeleteRoutine,
}) {
  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;
  const rest_time = profile.rest_time ?? 60;
  const { start: startSession, isStarted } = useSessionStore();

  const {
    data: popularExercises,
    isLoading: isPopularLoading,
    isError: isPopularError,
  } = useExercises(profile_id);
  const {
    data: userExercises,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useFavoriteExercises(profile_id);

  const isLoading = isPopularLoading || isUserLoading;
  const isError = isPopularError || isUserError;

  const exercisesMap = new Map();
  if (userExercises) {
    userExercises.forEach((ue) => {
      if (ue.exercises) {
        exercisesMap.set(ue.exercises.id, {
          ...ue.exercises,
          is_favorite: ue.is_favorite,
        });
      }
    });
  }
  if (popularExercises) {
    popularExercises.forEach((ex) => {
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
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] =
    useState(false);

  const handleCreateCustomExercise = () => {
    setIsCustomExerciseModalOpen(true);
  };

  const [selectedExerciseToLog, setSelectedExerciseToLog] = useState(null);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [activeSuperSetExerciseId, setActiveSuperSetExerciseId] = useState(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  const [selectedExerciseForHistory, setSelectedExerciseForHistory] =
    useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExercisesForDelete, setSelectedExercisesForDelete] = useState(
    [],
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showActiveSessionModal, setShowActiveSessionModal] = useState(false);
  const [showDeleteRoutineConfirmDialog, setShowDeleteRoutineConfirmDialog] =
    useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const { mutateAsync: editRoutine } = useEditRoutines(profile_id);
  const { mutateAsync: deleteExercisesRoutine } =
    useDeleteExercisesRoutine(profile_id);

  const handleSaveDetails = async (data) => {
    try {
      await editRoutine({
        routine_id: routine.routine_id,
        name: data.name,
        description: data.description,
      });
    } catch (err) {
      console.error("Error al actualizar la rutina:", err);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedExercisesForDelete([]);
    setIsMenuOpen(false);
  };

  const toggleDeleteSelection = (exerciseId) => {
    setSelectedExercisesForDelete((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    );
  };

  const handleStartWorkout = () => {
    if (isStarted) {
      setShowActiveSessionModal(true);
      return;
    }
    startSession();
  };

  const handleDeleteSelected = async () => {
    if (!profile_id || selectedExercisesForDelete.length === 0) return;
    try {
      await deleteExercisesRoutine({
        routine_id: routine.routine_id,
        id_exercises: selectedExercisesForDelete,
      });
      setIsEditMode(false);
      setSelectedExercisesForDelete([]);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error al borrar ejercicios de la rutina:", error);
    }
  };

  const handleStartWorkout = () => {
    if (isStarted) return;
    if (showWalkthrough === 'ready') handleCloseWalkthrough();
    startSession();
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
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
        <div
          className={`w-full h-full flex flex-col relative bg-dark-bg pointer-events-auto ${
            isClosing ? "animate-slide-out-custom" : "animate-slide-in-custom"
          }`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 bg-input-bg shrink-0 z-30">
            <button
              onClick={() =>
                isAddingExercises
                  ? handleCloseAddingExercises()
                  : handleCloseWithAnimation()
              }
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
              <span className="text-lg font-black text-white tracking-tight truncate w-full text-center">
                {isAddingExercises && !isAddingClosing
                  ? "Seleccionar ejercicios"
                  : routine.name?.trim()
                    ? routine.name
                    : "Nueva rutina"}
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
                  className={`p-1.5 transition-colors rounded-full ${isMenuOpen ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                >
                  <FiMoreVertical className="w-6 h-6" />
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#2A2424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <button
                      onClick={() => {
                        setIsEditingDetails(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer"
                    >
                      Editar información
                    </button>
                    <button
                      onClick={toggleEditMode}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer"
                    >
                      Editar ejercicios
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
                <div className="flex flex-col gap-3 relative">
                  <div className="relative">
                    <button
                      onClick={handleStartWorkout}
                      disabled={isStarted}
                      className={`w-full flex items-center justify-center gap-2 p-4 text-white rounded-2xl font-black text-[16px] shadow-lg transition-transform ${isStarted ? 'bg-zinc-800 opacity-50 cursor-not-allowed shadow-none' : 'bg-linear-to-r from-karga-orange to-red-600 shadow-karga-orange/20 active:scale-[0.98]'}`}
                    >
                      <FaPlay className="w-4 h-4 ml-1" />
                      Empezar entrenamiento
                    </button>
                    {!isAddingExercises && showWalkthrough === 'ready' && (
                      <WalkthroughTooltip 
                        title="¡Todo listo!"
                        description="Cuando estés listo, toca este botón para iniciar tu sesión y empezar a registrar tus marcas."
                        buttonText="¡Entendido!"
                        onNext={handleNextWalkthrough}
                      />
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsAddingExercises(true);
                        if (showWalkthrough === 'empty') handleCloseWalkthrough();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-4 bg-[#2A2424] hover:bg-[#332C2C] border border-white/5 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98]"
                    >
                      <PlusIcon className="w-5 h-5 text-zinc-400" />
                      Agregar ejercicios
                    </button>
                    {!isAddingExercises && showWalkthrough === 'empty' && (
                      <WalkthroughTooltip 
                        title="Tu rutina está vacía."
                        description="Toca aquí para buscar tus ejercicios favoritos y armar tu plan de entrenamiento."
                        buttonText="¡Entendido!"
                        onNext={handleNextWalkthrough}
                      />
                    )}
                  </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleStartWorkout}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-linear-to-r from-karga-orange to-red-600 text-white rounded-2xl font-black text-[16px] shadow-lg shadow-karga-orange/20 transition-transform active:scale-[0.98]"
                  >
                    <FiPlay className="w-5 h-5 ml-1" />
                    Empezar entrenamiento
                  </button>

                  <button
                    onClick={() => setIsAddingExercises(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-[#2A2424] hover:bg-[#332C2C] border border-white/5 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98]"
                  >
                    <PlusIcon className="w-5 h-5 text-zinc-400" />
                    Agregar ejercicios
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 mb-1">
                  Ejercicios en esta rutina
                </h3>

                {(() => {
                  const exercisesToRender =
                    routine.routines_exercises
                      ?.map((re) =>
                        re.exercises
                          ? { ...re.exercises, rest_time: re.rest_time }
                          : null,
                      )
                      .filter(Boolean) || [];

                  if (exercisesToRender.length === 0) {
                    return (
                      <div className="text-center py-8 px-4 text-zinc-500 text-sm font-medium border border-dashed border-white/10 rounded-2xl">
                        Aún no tienes ejercicios en esta rutina.
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3">
                      {exercisesToRender.map((exercise, index) => {
                        return (
                          <div key={exercise.id} className="flex flex-col">
                            <div
                              onClick={() => {
                                if (isEditMode)
                                  toggleDeleteSelection(exercise.id);
                                else handleExerciseClick(exercise);
                              }}
                              className={`flex items-center justify-between p-4 rounded-2xl transition-colors cursor-pointer ${
                                isEditMode &&
                                selectedExercisesForDelete.includes(exercise.id)
                                  ? "bg-red-500/10 border border-red-500/50"
                                  : "bg-input-bg border border-transparent hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isEditMode && (
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                      selectedExercisesForDelete.includes(
                                        exercise.id,
                                      )
                                        ? "bg-red-500 border-red-500"
                                        : "border-zinc-500"
                                    }`}
                                  >
                                    {selectedExercisesForDelete.includes(
                          <div
                            onClick={() => {
                              if (isEditMode)
                                toggleDeleteSelection(exercise.id);
                              else handleExerciseClick(exercise);
                            }}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-colors cursor-pointer ${
                              isEditMode &&
                              selectedExercisesForDelete.includes(exercise.id)
                                ? "bg-red-500/10 border border-red-500/50"
                                : "bg-input-bg border border-transparent hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isEditMode && (
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                    selectedExercisesForDelete.includes(
                                      exercise.id,
                                    ) && (
                                      <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                                    )}
                                  </div>
                                )}
                                <div className="flex flex-col pr-4">
                                  <span className="text-[15px] font-bold text-white tracking-tight">
                                    {exercise.name}
                                  </span>
                                  <span className="text-[11px] text-zinc-500 font-semibold capitalize mt-0.5">
                                    {Array.isArray(exercise.muscle)
                                      ? exercise.muscle.join(" - ")
                                      : exercise.muscle}
                                  </span>
                                </div>
                              </div>

                              {!isEditMode && (
                                <div className="flex items-center gap-2 relative">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSuperSetExerciseId(null);
                                      setExpandedExerciseId(prev => prev === exercise.id ? null : exercise.id);
                                    }}
                                    className="w-8 h-8 rounded-full bg-dark-bg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
                                  >
                                    <PlusIcon className="w-5 h-5 text-white" />
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedExerciseId(null);
                                      setActiveSuperSetExerciseId(prev => prev === exercise.id ? null : exercise.id);
                                    }}
                                    className="w-8 h-8 rounded-full bg-dark-bg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
                                  >
                                    <TbChecklist className="w-5 h-5 text-white" />
                                  </div>

                                  {index === 0 && showWalkthrough === 'active_step1' && (
                                    <div className="absolute right-10 top-10 w-64 z-50">
                                      <WalkthroughTooltip 
                                        title="Registro rápido"
                                        description="Toca aquí para empezar a cargar tus series de a una en vivo, o de forma diferida."
                                        buttonText="Siguiente"
                                        onNext={handleNextWalkthrough}
                                        align="right"
                                      />
                                    </div>
                                  )}
                                  {index === 0 && showWalkthrough === 'active_step2' && (
                                    <div className="absolute right-0 top-10 w-64 z-50">
                                      <WalkthroughTooltip 
                                        title="Series al detalle"
                                        description="Y aquí si prefieres establecer las series de antemano e ir completándolas en vivo."
                                        buttonText="¡Entendido!"
                                        onNext={handleNextWalkthrough}
                                        align="right"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* V1 Inline Expander */}
                            {expandedExerciseId === exercise.id && !isEditMode && (
                              <InlineExerciseExpander 
                                exercise={exercise} 
                                onSaveDone={() => setExpandedExerciseId(null)} 
                              />
                            )}
                            
                            {/* V2 SuperSet Expander */}
                            {activeSuperSetExerciseId === exercise.id && !isEditMode && (
                              <SuperSetExpander 
                                exercise={exercise} 
                                onSaveDone={() => setActiveSuperSetExerciseId(null)} 
                              />

                            {!isEditMode && (
                              <div className="flex items-center gap-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSetModalOpen(false);
                                    setSelectedExerciseToLog(null);
                                    setExpandedExerciseId(null);
                                    setActiveSuperSetExerciseId((prev) =>
                                      prev === exercise.id ? null : exercise.id,
                                    );
                                  }}
                                  className="w-8 h-8 rounded-full bg-dark-bg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
                                >
                                  <TbChecklist className="w-5 h-5 text-white" />
                                </div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSetModalOpen(false);
                                    setSelectedExerciseToLog(null);
                                    setActiveSuperSetExerciseId(null);
                                    setExpandedExerciseId((prev) =>
                                      prev === exercise.id ? null : exercise.id,
                                    );
                                  }}
                                  className="w-8 h-8 rounded-full bg-dark-bg hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer pointer-events-auto"
                                >
                                  <PlusIcon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>

                          {expandedExerciseId === exercise.id && !isEditMode && (
                            <InlineExerciseExpander
                              exercise={exercise}
                              rest_time={exercise.rest_time ?? rest_time}
                              onSaveDone={() => setExpandedExerciseId(null)}
                            />
                          )}

                          {activeSuperSetExerciseId === exercise.id && !isEditMode && (
                            <SuperSetExpander
                              exercise={exercise}
                              rest_time={exercise.rest_time ?? rest_time}
                              onSaveDone={() => setActiveSuperSetExerciseId(null)}
                            />
                          )}
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
              <div
                className={`absolute inset-0 bg-dark-bg z-20 flex flex-col ${isAddingClosing ? "animate-slide-out-custom" : "animate-slide-in-custom"}`}
              >
                <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-3 scrollbar-none [&::-webkit-scrollbar]:none">
                  <ExerciseListSelector
                    exercises={allExercises}
                    selectedExercises={selectedExercises}
                    routineExercises={routine.routines_exercises || []}
                    isLoading={isLoading}
                    isError={isError}
                    onToggleExercise={handleToggleExercise}
                    onExerciseClick={handleExerciseClick}
                  />
                </div>

                {/* BOTÓN CREAR EJERCICIO PERSONALIZADO */}
                <div className="absolute bottom-[-0.1px] inset-x-0 p-5 pb-5 pt-12 bg-linear-to-t from-dark-bg via-dark-bg to-transparent z-30">
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
            {isEditMode &&
              selectedExercisesForDelete.length > 0 &&
              !isAddingExercises && (
                <div className="absolute bottom-8 left-6 z-30 animate-slide-in-up">
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className="h-14 px-6 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center transition-all active:scale-95 gap-2"
                  >
                    <FiTrash2 className="w-5 h-5" />
                    Eliminar {selectedExercisesForDelete.length} ejercicio
                    {selectedExercisesForDelete.length !== 1 ? "s" : ""}
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
          rest_time={rest_time}
          onClose={() => setIsSetModalOpen(false)}
        />
      )} 

      {/* CUSTOM EXERCISE MODAL */}
      {isCustomExerciseModalOpen && (
        <CustomExerciseModal
          onClose={() => setIsCustomExerciseModalOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={showActiveSessionModal}
        title="Sesión activa"
        description="Ya tienes una sesión activa. Termina o descarta la sesión actual antes de empezar una nueva."
        confirmText="Cerrar"
        onClose={() => setShowActiveSessionModal(false)}
      />

      {/* ConfirmModal para borrar ejercicios */}
      <ConfirmModal
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteSelected}
        title="¿Eliminar ejercicios?"
        description={`Estás a punto de eliminar ${selectedExercisesForDelete.length} ejercicio${selectedExercisesForDelete.length !== 1 ? "s" : ""} de esta rutina. Puedes volver a agregarlos en cualquier momento.`}
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

      <EditRoutineModal
        isOpen={isEditingDetails}
        initialName={routine.name || ""}
        initialDescription={routine.description || ""}
        onClose={() => setIsEditingDetails(false)}
        onSave={handleSaveDetails}
      />
    </>,
    document.body,
  );
}
