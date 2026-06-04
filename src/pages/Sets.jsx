import { useState, useEffect } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Avatar from "../components/Avatar/Avatar";
import PlusIcon from "../components/icons/PlusIcon";
import FlameIcon from "../components/icons/FlameIcon";
import ChevronIcon from "../components/icons/ChevronIcon";
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
} from "../hooks/mutations/useRoutinesMutation";
import { useRoutines } from "../hooks/queries/useRoutines";

export default function Sets() {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // estados para almacenar los datos que vendrán de la base de datos
  const [stats, setStats] = useState({ weeklyWorkouts: 0, streak: 0 });
  const [routinesID, setRoutinesID] = useState();
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

  const { data: exercises, isLoading } = useExercises();
  const { data: routines, isLoading: isRoutinesLoading } = useRoutines();
  const { data: exerciseFavorites, isLoading: isExerciseFavoritesLoading } =
    useFavoriteExercises();
  // const [routines, setRoutines] = useState([]);
  // getRoutines().then((data) => {
  //   setRoutines(data);
  // });

  if (isLoading || isRoutinesLoading || isExerciseFavoritesLoading) {
    return <div>Cargando...</div>;
  }
  // console.log("exercises:", exercises);
  const handleCreateWorkout = () => {
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
  const createroutine = async (name) => {
    const routine = await createRoutines({
      name,
      description: "descripcion de prueba",
    });

    setRoutinesID(routine);
  };
  const handleAddtoFavorite = (id) => {
    AddFavorite(id);
  };
  const handleDeleteExercise = (id) => {
    deleteExercise(id);
    window.location.reload();
  };
  const handleAddRoutine = (id) => {
    if (!routinesID) {
      console.log("No hay rutina creada");
      return;
    }
    routinesID.then((data) => {
      console.log("routine_id:", data.routine_id);

      insertExercisesRoutine({
        routine_id: data.routine_id,
        id_exercises: id,
        rest_time: 60,
        orden: 1,
      });
    });
    console.log("Ejercicio agregado a la rutina");
  };
  const exercisesF = exerciseFavorites?.map((item) => item.exercises);
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
        <div className="w-full h-full  via-white/5 to-transparent" />
        <div className="flex flex-col mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Mis Rutinas</h2>
          <input
            type="text"
            placeholder="nombre de la rutina"
            className="bg-white/10 text-white placeholder:text-zinc-500 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-karga-orange"
            ref={inputRef}
          />
          <button
            onClick={() => createroutine(inputRef.current.value)}
            className="text-karga-orange hover:text-karga-orange/80 transition-colors"
          >
            Crear nueva rutina
          </button>
        </div>
        <div className="flex flex-col">
          {" "}
          <div className="flex flex-col gap-3">
            {routines.map(({ name, routine_id }) => (
              <Card
                key={routine_id}
                variant="default"
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
                </div>

                <ChevronIcon
                  className="w-5 h-5 text-zinc-600"
                  direction="right"
                />
              </Card>
            ))}
          </div>
        </div>
      </div>
      {/* MIS EJERCICIOS */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4">Mis Ejercicios</h2>
        {isExerciseFavoritesLoading ? (
          // si esta cargando pone spinner
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-karga-orange border-white/5 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exercisesF.map(({ name, id, muscle }) => (
              <div
                key={id}
                className=" flex flex-row items-center gap-2 cursor-pointer transition-all "
              >
                <Card
                  variant="default"
                  onClick={() => handleAddRoutine(id)}
                  className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all min-w-0 flex-1"
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteExercise(id)}
                >
                  eliminar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4">
          Ejercicios Populares
        </h2>

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
                onClick={() => handleAddtoFavorite(id)}
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
