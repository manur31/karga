import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Avatar from "../components/Avatar/Avatar";
import PlusIcon from "../components/icons/PlusIcon";
import FlameIcon from "../components/icons/FlameIcon";
import ChevronIcon from "../components/icons/ChevronIcon";
import { useExercises } from "../hooks/queries/useExercises";
import { useCreateExercise } from "../hooks/mutations/useExercisesMutations";

export default function Sets() {
  const navigate = useNavigate();

  // estados para almacenar los datos que vendrán de la base de datos
  const [stats, setStats] = useState({ weeklyWorkouts: 0, streak: 0 });

  const {
    mutate: createExercise,
    isPending: isCreatingExercise,
    isSuccess: isExerciseCreated,
    isError: isExerciseError,
  } = useCreateExercise();

  const { data: exercises, isLoading } = useExercises();
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // useEffect(() => {
  //   // TODO: Esta función es el placeholder para integrar con supabase. hacer el fetch real a las tablas de estadisticas y rutinas del usuario
  //   const fetchDashboardData = async () => {
  //     try {
  //       setIsLoading(true);

  //       // simulacion de espera
  //       await new Promise(resolve => setTimeout(resolve, 800));

  //       // MOCK, reemplazar luego
  //       const mockStats = {
  //         weeklyWorkouts: 4,
  //         streak: 12
  //       };

  //       const mockRoutines = [
  //         { id: 1, name: 'Push Day', exercises: 6, lastDone: 'Hace 2 días', color: 'orange' },
  //         { id: 2, name: 'Pull Day', exercises: 5, lastDone: 'Hace 4 días', color: 'red' },
  //         { id: 3, name: 'Leg Day', exercises: 6, lastDone: 'Hace 1 semana', color: 'green' }
  //       ];

  //       setStats(mockStats);
  //       setRoutines(mockRoutines);
  //     } catch (error) {
  //       console.error("Error al cargar los datos del dashboard:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchDashboardData();
  // }, []);

  const routines = [
    {
      id: 1,
      name: "Push Day",
      exercises: 6,
      lastDone: "Hace 2 días",
      color: "orange",
    },
    {
      id: 2,
      name: "Pull Day",
      exercises: 5,
      lastDone: "Hace 4 días",
      color: "red",
    },
    {
      id: 3,
      name: "Leg Day",
      exercises: 6,
      lastDone: "Hace 1 semana",
      color: "green",
    },
  ];

  const exampleExercise = [
    {
      category: 2,
      created_at: "2026-05-27T23:52:58.052502+00:00",
      id: "cd6d3e83-f6a0-445f-94a1-e97acf76f5fe",
      image: null,
      is_populary: true,
      muscle: "legs",
      name: "Leg Press",
    },
  ];

  const handleCreateWorkout = () => {
    console.log("Creando nuevo entrenamiento");
    createExercise({
      name: "Platano",
      category: 123,
      muscle: "legs",
    });

    if (isExerciseCreated) {
      console.log("Entrenamiento creado exitosamente");
    }

    if (isExerciseError) {
      console.log("Error al crear el entrenamiento");
    }
  };

  const handleOpenRoutine = (id) => {
    //redirigir al detalle o inicio de la rutina seleccionada
    console.log(`Abriendo rutina ID: ${id}`);
    // navigate(`/sets/${id}`);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      {/* HEADER */}
      <div className="mb-6 pl-2">
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
          Mis Entrenamientos
        </h1>
        <p className="text-sm font-medium text-zinc-400">
          Elige tu rutina o crea una nueva
        </p>
      </div>

      {/* BOTÓn de NUEVO WORKOUT */}
      <Button
        variant="primary"
        onClick={handleCreateWorkout}
        className="w-full flex-row items-center justify-start gap-4 p-5 mb-6 bg-linear-to-r from-karga-orange to-red-600 border-none rounded-3xl shadow-xl shadow-karga-orange/10"
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
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* card de esta semana */}
        <Card
          variant="default"
          className="p-5 flex flex-col justify-between h-32"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-wide">
            <FlameIcon />
            Esta semana
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white leading-none mb-1">
              {isLoading ? "-" : stats.weeklyWorkouts}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              entrenamientos
            </span>
          </div>
        </Card>

        {/* card de racha */}
        <Card
          variant="default"
          className="p-5 flex flex-col justify-between h-32"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-wide">
            {/* punto verde */}
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Racha
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white leading-none mb-1">
              {isLoading ? "-" : stats.streak}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
              días seguidos
            </span>
          </div>
        </Card>
      </div>

      {/* MIS RUTINAS */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4">Mis Rutinas</h2>

        {isLoading ? (
          // si esta cargando pone spinner
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-karga-orange border-white/5 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exercises.map(({ name, id, muscle }) => (
              <Card
                key={id}
                variant="default"
                onClick={() => handleOpenRoutine(id)}
                className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                {/*usa la letra inicial del nombre en la bdd*/}
                <Avatar
                  initial={name.charAt(0)}
                  //este color en realidad podria ser random tbh, pero esta puesto asi considerando la posibilidad de que luego agreguemos tipo un "selector" de color para la rutina.
                  size="md"
                />

                <div className="flex flex-col flex-1">
                  <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                    {name}
                  </span>
                  <span>{muscle + " "}</span>
                </div>

                <ChevronIcon
                  className="w-5 h-5 text-zinc-600"
                  direction="right"
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
