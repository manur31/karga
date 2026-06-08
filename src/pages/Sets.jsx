import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import PlusIcon from "../components/icons/PlusIcon";
import WorkoutModal from "../components/modals/WorkoutModal/WorkoutModal";
import RoutineModal from "../components/modals/RoutineModal/RoutineModal";
import MyExercisesModal from "../components/modals/MyExercisesModal/MyExercisesModal";
import {
  useExercises,
  useFavoriteExercises,
} from "../hooks/queries/useExercises";
import {
  useCreateExercise,
  useAddToFavorite,
  useDeleteExercise,
} from "../hooks/mutations/useExercisesMutations";
import {
  useCreateRoutines,
  useInsertExercisesRoutine,
  useDeleteRoutines,
  useEditRoutines,
} from "../hooks/mutations/useRoutinesMutation";
import { useRoutines } from "../hooks/queries/useRoutines";
import { getRoutineforID } from "../service/routinesService";

import StatsCards from "../components/sets/StatsCards";
import RoutinesList from "../components/sets/RoutinesList";

export default function Sets() {
  const inputRef = useRef(null);
  const iputRef2 = useRef(null);
  const navigate = useNavigate();

  // estados para almacenar los datos que vendrán de la base de datos
  const [stats, setStats] = useState({ weeklyWorkouts: 0, streak: 0 });
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isMyExercisesModalOpen, setIsMyExercisesModalOpen] = useState(false);

  const {
    mutate: createExercise,
    isPending: isCreatingExercise,
    isSuccess: isExerciseCreated,
    isError: isExerciseError,
  } = useCreateExercise();
  const { mutateAsync: deleteExercise } = useDeleteExercise();
  const { mutateAsync: AddFavorite } = useAddToFavorite();
  const { mutateAsync: createRoutines } = useCreateRoutines();
  const { mutateAsync: insertExercisesRoutine } = useInsertExercisesRoutine();
  const { mutateAsync: usedeleteRoutines } = useDeleteRoutines();
  const { mutateAsync: editRoutines } = useEditRoutines();
  
  const { data: exercises, isLoading } = useExercises();
  const { data: routines, isLoading: isRoutinesLoading } = useRoutines();
  const { data: exerciseFavorites, isLoading: isExerciseFavoritesLoading } =
    useFavoriteExercises();

  if (isLoading || isRoutinesLoading || isExerciseFavoritesLoading) {
    return <div>Cargando...</div>;
  }

  
  const handleTestCreateExercise = () => {
    console.log("Creando nuevo entrenamiento");
    createExercise({
      name: "Ejercicio de prueba ",
      category: 123,
      muscle: ["back"],
    });

    if (isExerciseCreated) {
      console.log("Entrenamiento creado exitosamente");
    }

    if (isExerciseError) {
      console.log("Error al crear el entrenamiento");
    }
  };

  const handleCreateWorkout = () => {
    setOpenModal(true);  
  };

  const createroutine = async (name, description = "descripcion de prueba") => {
    return await createRoutines({
      name,
      description,
    });
  };

  const handleshowRoutineDetails = (id) => {
    getRoutineforID(id).then((data) => {
      console.log("data rutina por id:", data);
    });
  };

  const selectid = (data) => {
    setSelectedRoutineId(data.routine_id);
  };

  const handleAddtoFavorite = (id) => {
    if (!selectedRoutineId) {
      console.log("No hay rutina creada/seleccionada");
      return;
    }
    handleAddRoutine(id);
    AddFavorite(id);
  };

  const handleDeleteRoutine = (id) => {
    usedeleteRoutines(id);
  };

  const handleDeleteExercise = (id) => {
    deleteExercise(id);
  };

  const handleEditRoutine = (data) => {
    editRoutines(data);
  };

  const handleAddRoutine = (id) => {
    if (!selectedRoutineId) {
      console.log("No hay rutina seleccionada para agregar ejercicio");
      return;
    }
    insertExercisesRoutine({
      routine_id: selectedRoutineId,
      id_exercises: id,
      rest_time: 60,
      orden: 1,
    });
    console.log("Ejercicio agregado a la rutina");
  };

  const handleAddExercisesToRoutine = async (selectedExerciseIds) => {
    if (!selectedRoutineId) return;
    
    console.log("Agregando ejercicios a la rutina:", selectedExerciseIds);
    // Ejecutamos la mutación por cada ejercicio seleccionado
    for (const exerciseId of selectedExerciseIds) {
      await insertExercisesRoutine({
        routine_id: selectedRoutineId,
        id_exercises: exerciseId,
        rest_time: 60,
        orden: 1, 
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenRoutine = (id) => {
    setSelectedRoutineId(id);
  };

  const handleSaveWorkoutModal = async (name, description, selectedExerciseIds) => {
    console.log("Guardando rutina desde modal:", { name, description, selectedExerciseIds });
    try {
      // crea la rutina
      const newRoutine = await createroutine(name, description);
      
      // inserta los ejercicios seleccionados
      if (newRoutine && newRoutine.routine_id && selectedExerciseIds.length > 0) {
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
      console.error("Error al guardar rutina:", error);
    }
  };

  //  la versión más reciente de la rutina seleccionada
  const activeRoutine = selectedRoutineId ? routines?.find(r => r.routine_id === selectedRoutineId) : null;

  return (
    <div className="flex flex-col w-full animate-fade-in pb-10">
      {/* HEADER */}
      <div className="mb-6 pl-2">
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
          Mis Entrenamientos
        </h1>
        <p className="text-sm font-medium text-zinc-400">
          Elige tu rutina o crea una nueva
        </p>
      </div>

      {/* BOTÓN NUEVA RUTINA Y MIS EJERCICIOS */}
      <div className="flex flex-col gap-3 mb-6">
        <Button
          variant="primary"
          onClick={handleCreateWorkout}
          className="w-full flex-row items-center justify-start gap-4 p-5 bg-linear-to-r from-karga-orange to-red-600 border-none rounded-3xl shadow-xl shadow-karga-orange/10 transition-transform active:scale-[0.98]"
        >
          <div className="w-12 h-12 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <PlusIcon />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-xl font-black text-white">Nueva Rutina</span>
            <span className="text-[11px] font-medium text-white/80 tracking-wide mt-0.5">
              Crear rutina personalizada
            </span>
          </div>
        </Button>

        <Button
          variant="secondary"
          onClick={() => setIsMyExercisesModalOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#2A2424] hover:bg-[#332C2C] border border-white/5 rounded-2xl transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-karga-orange/10 flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-karga-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-[16px] font-bold text-zinc-200">Mis ejercicios</span>
          </div>
          <svg className="w-[18px] h-[18px] text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* ESTADÍSTICAS */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* MIS RUTINAS */}
      <RoutinesList
        routines={routines || []}
        onOpenRoutine={handleOpenRoutine}
      />

      {/* MODAL DE CREACIÓN DE WORKOUT */}
      {openModal && (
        <WorkoutModal 
          onClose={handleCloseModal} 
          onSave={handleSaveWorkoutModal}
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
        <MyExercisesModal onClose={() => setIsMyExercisesModalOpen(false)} />
      )}
    </div>
  );
}
