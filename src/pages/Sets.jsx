import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import PlusIcon from "../components/icons/PlusIcon";
import WorkoutModal from '../components/modals/WorkoutModal/WorkoutModal';
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
  const [routinesID, setRoutinesID] = useState();
  const [openModal, setOpenModal] = useState(false);

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
    setRoutinesID(data);
    console.log("id seleccionado:", data);
  };

  const handleAddtoFavorite = (id) => {
    if (!routinesID) {
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
    if (!routinesID) {
      console.log("No hay rutina seleccionada para agregar ejercicio");
      return;
    }
    console.log("routine_id:", routinesID.routine_id);
    insertExercisesRoutine({
      routine_id: routinesID.routine_id,
      id_exercises: id,
      rest_time: 60,
      orden: 1,
    });
    console.log("Ejercicio agregado a la rutina");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenRoutine = (id) => {
    console.log(`Abriendo el modal global precargado con la rutina ID: ${id}`);
    const routineData = routines?.find(r => r.routine_id === id);
    if (routineData) {
      selectid(routineData);
    }
  };

  const handleSaveWorkoutModal = async (name, description, selectedExerciseIds) => {
    console.log("Guardando rutina desde modal:", { name, description, selectedExerciseIds });
    // crea la rutina
    await createroutine(name, description);
    
    //para insertar los ejercicios createRoutines deberia devolver el ID - completar
  };

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

      {/* BOTÓN NUEVO WORKOUT */}
      <Button
        variant="primary"
        onClick={handleCreateWorkout}
        className="w-full flex-row items-center justify-start gap-4 p-5 mb-6 bg-linear-to-r from-karga-orange to-red-600 border-none rounded-3xl shadow-xl shadow-karga-orange/10 transition-transform active:scale-[0.98]"
      >
        <div className="w-12 h-12 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <PlusIcon />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-xl font-black text-white">Nuevo Workout</span>
          <span className="text-[11px] font-medium text-white/80 tracking-wide mt-0.5">
            Crear entrenamiento personalizado
          </span>
        </div>
      </Button>

      {/* ESTADÍSTICAS */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* MIS RUTINAS */}
      <RoutinesList
        routines={routines || []}
        onOpenRoutine={handleOpenRoutine}
      />

      {/* MODAL */}
      {openModal && (
        <WorkoutModal 
          onClose={handleCloseModal} 
          onSave={handleSaveWorkoutModal}
        />
      )}
    </div>
  );
}
