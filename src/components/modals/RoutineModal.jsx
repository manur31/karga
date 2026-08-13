import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/queries/useAuth";
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
import { FiPlay, FiMinus } from "react-icons/fi";
import { TbChecklist } from "react-icons/tb";
import { useSetsStore } from "../../stores/setsStore";
import { useWeightUnit } from "../../hooks/useWeightUnit";
import SuperSetExpander from "./SuperSetExpander";

const InlineExerciseExpander = ({ exercise, onSaveDone }) => {
  const { data: user } = useAuth();
  const { startRest } = useRestStore();
  const restTime = user?.rest_time ?? 60;
  
  const { unit, toggleUnit, convertToKg } = useWeightUnit();
  const { addSet, getLastSetForExercise } = useSetsStore();
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [cards, setCards] = useState([
    { id: 1, reps: 0, weight: 0 },
  ]);

  useEffect(() => {
    const lastSet = getLastSetForExercise(exercise.id);
    if (lastSet) {
      const displayWeight = unit === 'kg' ? lastSet.weight : Number((lastSet.weight * 2.20462).toFixed(2));
      setReps(lastSet.rep || 0);
      setWeight(displayWeight || 0);
      setCards(prev => prev.map(c => ({ ...c, reps: lastSet.rep || 0, weight: displayWeight || 0 })));
    }
  }, [exercise, unit, getLastSetForExercise]);

  useEffect(() => {
    setCards(prev => prev.map(c => ({ ...c, reps, weight })));
  }, [reps, weight]);

  const handleToggleUnit = () => {
    if (unit === 'kg') {
      setWeight(prev => Number((Number(prev) * 2.20462).toFixed(2)));
      setCards(prev => prev.map(c => ({ ...c, weight: Number((Number(c.weight) * 2.20462).toFixed(2)) })));
    } else {
      setWeight(prev => Number((Number(prev) / 2.20462).toFixed(2)));
      setCards(prev => prev.map(c => ({ ...c, weight: Number((Number(c.weight) / 2.20462).toFixed(2)) })));
    }
    toggleUnit();
  };

  const handleSave = () => {
    for (const card of cards) {
      const cardWeightKg = unit === 'kg' ? Number(card.weight) : Number((Number(card.weight) / 2.20462).toFixed(2));
      addSet({
        profile_id: 'mock_profile',
        exercise_id: exercise.id,
        rep: Number(card.reps || 0),
        weight: Number(cardWeightKg.toFixed(2))
      });
    }
    
    // Only trigger rest timer if exactly 1 set is being saved
    if (cards.length === 1) {
      startRest(restTime);
    }
    
    onSaveDone();
  };

  return (
    <div className="w-full bg-[#1A1616] rounded-xl mt-2 p-4 flex flex-col gap-4 animate-fade-in origin-top">
      {/* Global Controls Row */}
      <div className="flex gap-2 items-center bg-white/5 p-3 rounded-xl">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 mb-1">REPS GLOBALES</span>
          <div className="flex items-center gap-1 w-full justify-between px-1">
            <button onClick={() => setReps(r => Math.max(0, Number(r) - 1))} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"><FiMinus className="w-3 h-3" /></button>
            <input 
              type="number" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-10 bg-transparent text-center font-black text-white text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => setReps(r => Number(r) + 1)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"><PlusIcon className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10 mx-1"></div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 mb-1">PESO GLOBAL</span>
          <div className="flex items-center gap-1 w-full justify-between px-1">
            <button onClick={() => setWeight(w => Math.max(0, Number(w) - (unit === 'kg' ? 1 : 2.5)))} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"><FiMinus className="w-3 h-3" /></button>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-10 bg-transparent text-center font-black text-white text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => setWeight(w => Number(w) + (unit === 'kg' ? 1 : 2.5))} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"><PlusIcon className="w-3 h-3" /></button>
          </div>
        </div>
        <button 
          onClick={handleToggleUnit}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white uppercase ml-1 shrink-0"
        >
          {unit}
        </button>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-2">
        {cards.map((card, idx) => (
          <div key={card.id} className="bg-[#2A2424] rounded-xl p-3 flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${idx * 120}ms`, animationFillMode: 'both' }}>
            <span className="text-zinc-500 font-black text-sm w-4 shrink-0">{idx + 1}°</span>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-between p-1 px-2">
                <button onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, reps: Math.max(0, Number(c.reps) - 1) } : c))} className="text-white/50 hover:text-white p-1"><FiMinus className="w-3 h-3" /></button>
                <input 
                  type="number" 
                  value={card.reps}
                  onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, reps: e.target.value } : c))}
                  className="w-8 bg-transparent text-center font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, reps: Number(c.reps) + 1 } : c))} className="text-white/50 hover:text-white p-1"><PlusIcon className="w-3 h-3" /></button>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-between p-1 px-2">
                <button onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, weight: Math.max(0, Number(c.weight) - (unit === 'kg' ? 1 : 2.5)) } : c))} className="text-white/50 hover:text-white p-1"><FiMinus className="w-3 h-3" /></button>
                <input 
                  type="number" 
                  value={card.weight}
                  onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, weight: e.target.value } : c))}
                  className="w-8 bg-transparent text-center font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, weight: Number(c.weight) + (unit === 'kg' ? 1 : 2.5) } : c))} className="text-white/50 hover:text-white p-1"><PlusIcon className="w-3 h-3" /></button>
              </div>
            </div>
            {cards.length > 1 && (
              <button 
                onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
                className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 shrink-0"
              >
                <FiMinus className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setCards(prev => [...prev, { id: Date.now(), reps, weight }])}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs"
          >
            +1&nbsp;serie
          </button>
          <button 
            onClick={() => setCards(prev => [...prev, { id: Date.now(), reps, weight }, { id: Date.now()+1, reps, weight }])}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs"
          >
            +2&nbsp;series
          </button>
        </div>
        <button 
          onClick={handleSave}
          className="px-5 py-2.5 bg-karga-orange hover:bg-orange-600 text-white font-black text-sm rounded-xl shadow-lg shadow-karga-orange/20 active:scale-95 transition-all"
        >
          Grabar {cards.length} serie(s)
        </button>
      </div>
    </div>
  );
};

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
  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  const { start: startSession, isStarted } = useSessionStore();
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [activeSuperSetExerciseId, setActiveSuperSetExerciseId] = useState(null);

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

  const [selectedExerciseForHistory, setSelectedExerciseForHistory] =
    useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExercisesForDelete, setSelectedExercisesForDelete] = useState(
    [],
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
    if (isStarted) {
      alert("Ya tienes una sesión activa. Termina o descarta la sesión actual antes de empezar una nueva.");
      return;
    }
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
                  <ThreeDotsIcon className="w-6 h-6" />
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
                      ?.map((re) => re.exercises)
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
                      {exercisesToRender.map((exercise) => {
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
                                      exercise.id,
                                    ) && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
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
                                <div className="flex items-center gap-2">
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
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

      {/* CUSTOM EXERCISE MODAL */}
      {isCustomExerciseModalOpen && (
        <CustomExerciseModal
          onClose={() => setIsCustomExerciseModalOpen(false)}
        />
      )}

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
