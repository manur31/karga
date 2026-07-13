import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "../components/Button/Button";
import { FiPlus, FiSettings, FiPlay } from "react-icons/fi";
import WorkoutModal from "../components/modals/WorkoutModal";
import RoutineModal from "../components/modals/RoutineModal";
import MyExercisesModal from "../components/modals/MyExercisesModal";
import ProfileModal from "../components/modals/ProfileModal";
import { useSesionStore } from "../stores/sesionStore";
import {
  useCreateRoutines,
  useInsertExercisesRoutine,
  useDeleteRoutines,
} from "../hooks/mutations/useRoutinesMutation";
import { useRoutines } from "../hooks/queries/useRoutines";
import { useAuth } from "../hooks/queries/useAuth";
import RoutinesList from "../components/sets/RoutinesList";
import { NewTrainModal } from "../components/modals/newTrainModal";
import { ErrorModal } from "../components/modals/ErrorModal";

export default function Sets() {
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isNewTrainModalOpen, setIsNewTrainModalOpen] = useState(false);
  const [isMyExercisesModalOpen, setIsMyExercisesModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const errorTimerRef = useRef(null);

  const { start: startSession, isStarted } = useSesionStore();

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: routines, isLoading: isRoutinesLoading } =
    useRoutines(profile_id);

  const { mutateAsync: createRoutines } = useCreateRoutines(profile_id);
  const { mutateAsync: insertExercisesRoutine } =
    useInsertExercisesRoutine(profile_id);
  const { mutateAsync: usedeleteRoutines } = useDeleteRoutines(profile_id);

  const showError = (message) => {
    setErrorMessage(message);

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }

    errorTimerRef.current = setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  useEffect(() => {
    if (profile_id && routines && routines.length === 1) {
      const seen = localStorage.getItem(
        `hasSeenWorkoutStartWalkthrough_${profile_id}`,
      );

      if (!seen) {
        const id = setTimeout(() => {
          setShowOnboarding(true);
        }, 0);

        return () => clearTimeout(id);
      }
    }
  }, [routines, profile_id]);

  const handleCloseOnboarding = () => {
    if (profile_id) {
      localStorage.setItem(
        `hasSeenWorkoutStartWalkthrough_${profile_id}`,
        "true",
      );
    }

    setShowOnboarding(false);
  };

  if (isRoutinesLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full">
        <div className="w-10 h-10 border-4 border-karga-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCreateWorkout = () => {
    setOpenModal(true);
  };

  const createroutine = async (name, description = "descripcion de prueba") => {
    return await createRoutines({
      name,
      description,
    });
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await usedeleteRoutines(id);
    } catch (error) {
      showError("No se pudo eliminar la rutina.");
    }
  };

  const handleAddExercisesToRoutine = async (selectedExerciseIds) => {
    if (!selectedRoutineId) return;

    try {
      for (const exerciseId of selectedExerciseIds) {
        await insertExercisesRoutine({
          routine_id: selectedRoutineId,
          id_exercises: exerciseId,
          rest_time: 60,
          orden: 1,
        });
      }
    } catch (error) {
      showError("No se pudieron agregar los ejercicios a la rutina.");
    }
  };

  const handleStartWorkoutClick = () => {
    if (isStarted) {
      showError(
        "Ya tenés una sesión activa. Terminá o descartá la sesión actual antes de empezar una nueva.",
      );
      return;
    }

    startSession();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenRoutine = (id) => {
    setSelectedRoutineId(id);
  };

  const handleSaveWorkoutModal = async (
    name,
    description,
    selectedExerciseIds,
  ) => {
    try {
      const newRoutine = await createroutine(name, description);

      if (
        newRoutine &&
        newRoutine.routine_id &&
        selectedExerciseIds.length > 0
      ) {
        for (let i = 0; i < selectedExerciseIds.length; i++) {
          await insertExercisesRoutine({
            routine_id: newRoutine.routine_id,
            id_exercises: selectedExerciseIds[i],
            rest_time: 60,
            orden: i + 1,
          });
        }
      }

      handleCloseModal();
    } catch (error) {
      showError("No se pudo guardar la rutina.");
    }
  };

  const activeRoutine = selectedRoutineId
    ? routines?.find((r) => r.routine_id === selectedRoutineId)
    : null;

  return (
    <div className="flex flex-col w-full animate-fade-in px-4 pb-20 pt-10">
      {/* HEADER */}
      <div className="mb-6 pl-2 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              Mis Entrenamientos
            </h1>

            <p className="text-sm font-medium text-zinc-400">
              Elige tu rutina o crea una nueva
            </p>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-3 text-zinc-400 hover:text-white transition-colors"
          >
            <FiSettings size={24} />
          </button>
        </div>
      </div>

      {/* BOTÓN NUEVA RUTINA Y MIS EJERCICIOS */}
      <div className="flex flex-col gap-3 mb-6">
        {routines && routines.length > 0 ? (
          <Button
            variant="primary"
            onClick={handleStartWorkoutClick}
            className="w-full flex-row items-center justify-start gap-4 p-5 bg-linear-to-r from-karga-orange to-red-600 border-none rounded-3xl shadow-lg transition-transform active:scale-[0.98]"
          >
            <div className="w-12 h-12 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiPlay className="w-6 h-6 text-white ml-0.5" />
            </div>

            <div className="flex flex-col items-start text-left">
              <span className="text-xl font-black text-white">
                Empezar entrenamiento
              </span>

              <span className="text-[11px] font-medium text-white/80 tracking-wide mt-0.5">
                Iniciar una sesión vacía de ejercicio
              </span>
            </div>
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleCreateWorkout}
            className="w-full flex-row items-center justify-start gap-4 p-5 bg-linear-to-r from-karga-orange to-red-600 border-none rounded-3xl shadow-lg transition-transform active:scale-[0.98]"
          >
            <div className="w-12 h-12 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiPlus className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col items-start text-left">
              <span className="text-xl font-black text-white">
                Nueva Rutina
              </span>

              <span className="text-[11px] font-medium text-white/80 tracking-wide mt-0.5">
                Crear rutina personalizada
              </span>
            </div>
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={() => setIsMyExercisesModalOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#2A2424] hover:bg-[#332C2C] border border-white/5 rounded-2xl transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-karga-orange/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-karga-orange"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>

            <span className="text-[16px] font-bold text-zinc-200">
              Mis ejercicios
            </span>
          </div>

          <svg
            className="w-4 h-4 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* ACTIVIDAD SEMANAL */}

      {/* MIS RUTINAS */}
      <RoutinesList
        routines={routines || []}
        onOpenRoutine={handleOpenRoutine}
        onCreateRoutine={handleCreateWorkout}
      />

      {/* MODAL DE CREACIÓN DE WORKOUT */}
      {openModal && (
        <WorkoutModal
          onClose={handleCloseModal}
          onSave={handleSaveWorkoutModal}
        />
      )}

      {/* MODAL DE CREACIÓN DE TRAIN */}
      {isNewTrainModalOpen && (
        <NewTrainModal
          isOpen={isNewTrainModalOpen}
          onClose={() => setIsNewTrainModalOpen(false)}
          onStarted={({ session, routine }) => {
            setSelectedRoutineId(routine.routine_id);
            setIsNewTrainModalOpen(false);
          }}
        />
      )}

      {/* MODAL DE DETALLE DE RUTINA */}
      {activeRoutine && (
        <RoutineModal
          routine={activeRoutine}
          onClose={() => setSelectedRoutineId(null)}
          onAddExercises={handleAddExercisesToRoutine}
          onDeleteRoutine={() => {
            handleDeleteRoutine(activeRoutine.routine_id);
            setSelectedRoutineId(null);
          }}
        />
      )}

      {/* MODAL DE MIS EJERCICIOS */}
      {isMyExercisesModalOpen && (
        <MyExercisesModal
          onClose={() => setIsMyExercisesModalOpen(false)}
          onAddExercise={() => {
            setIsMyExercisesModalOpen(false);
          }}
        />
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ErrorModal message={errorMessage} />

      {showOnboarding &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[99] flex flex-col items-center justify-start px-4 pt-[220px] animate-fade-in">
            <div className="w-full max-w-[340px] bg-[#2A2424] rounded-3xl p-5 border border-white/5 shadow-2xl flex flex-col gap-4 relative animate-fade-in">
              <div className="absolute -top-2.5 left-12 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#2A2424]" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-karga-orange/10 flex items-center justify-center shrink-0 text-karga-orange mt-0.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-white font-bold text-sm tracking-wide">
                    ¡Tu primera rutina está lista!
                  </h4>

                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    Ahora que ya tienes tu primera rutina, podrás empezar tus
                    entrenamientos rápidamente desde aquí o desde la pestaña de{" "}
                    <strong>Sesiones</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseOnboarding}
                className="w-full py-2.5 px-4 bg-karga-orange hover:bg-orange-600 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-karga-orange/10"
              >
                ¡Entendido!
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
