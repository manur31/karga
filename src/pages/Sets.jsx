import { useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Avatar from "../components/Avatar/Avatar";
import PlusIcon from "../components/icons/PlusIcon";
import FlameIcon from "../components/icons/FlameIcon";
import ChevronIcon from "../components/icons/ChevronIcon";
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


// formatter de diferencia en segundos q dps podriamos mover a utils y reutilizarlo
// function formatRelativeTime(dateString) {
//   if (!dateString) return "Nunca";
  
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffInSeconds = Math.floor((now - date) / 1000);

//   if (diffInSeconds < 60) return `hace ${Math.max(0, diffInSeconds)} seg`;
  
//   const diffInMinutes = Math.floor(diffInSeconds / 60);
//   if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  
//   const diffInHours = Math.floor(diffInMinutes / 60);
//   if (diffInHours < 24) return `hace ${diffInHours} h`;
  
//   const diffInDays = Math.floor(diffInHours / 24);
//   if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  
//   const diffInWeeks = Math.floor(diffInDays / 7);
//   if (diffInWeeks < 4) return `hace ${diffInWeeks} sem`;
  
//   const diffInMonths = Math.floor(diffInDays / 30);
//   return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
// }

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
    createRoutines({
      name,
      description: "descripcion de prueba",
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
      console.log("No hay rutina creada");
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
    console.log("routine_id:", routinesID.routine_id);
    insertExercisesRoutine({
      routine_id: routinesID.routine_id,
      id_exercises: id,
      rest_time: 60,
      orden: 1,
    });
    console.log("Ejercicio agregado a la rutina");
  
//   const [stats, setStats] = useState({ weeklyWorkouts: 0, streak: 0 });
//   const [routines, setRoutines] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   useEffect(() => {
    
//     const fetchDashboardData = async () => {
//       try {
//         setIsLoading(true);
//         await new Promise(resolve => setTimeout(resolve, 800));
 
//         setStats({ weeklyWorkouts: 4, streak: 12 });
 
//         setRoutines([
//           { 
//             id: 1, 
//             name: 'Push Day', 
//             exercisesCount: 6, 
//             lastDone: '2026-05-31T10:00:00Z',  
//             color: 'orange' 
//           },
//           { 
//             id: 2, 
//             name: '', // al estar vacio pero deberia decir por defecto "Nueva rutina"
//             exercisesCount: 1, 
//             lastDone: new Date().toISOString(), // ahora
//             color: 'red' 
//           },
//           { 
//             id: 3, 
//             name: 'Leg Day', 
//             exercisesCount: 8, 
//             lastDone: '2026-05-20T10:00:00Z', // hace 1 semana y pico
//             color: 'green' 
//           }
//         ]);
//       } catch (error) {
//         console.error("Error al cargar los datos:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

   

  const handleCreateWorkout = () => {
    setOpenModal(true);  
  };

  const handleCloseModal = () => {
    setOpenModal(false);  
  }

  const handleOpenRoutine = (id) => {
    console.log(`Abriendo el modal global precargado con la rutina ID: ${id}`);
    // openWorkoutModal({ routineId: id });
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

      {/* BOTÓN  NUEVO WORKOUT */}
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

      {/* ESTADÍSTICAS  */}
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
            {routines.map((data) => (
              <div
                key={data.routine_id}
                className="flex flex-col  gap-2 cursor-pointer transition-all "
              >
                <Card
                  variant="default"
                  onClick={() => handleshowRoutineDetails(data.routine_id)}
                  className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all min-w-0 flex-1 "
                >
                  {/*usa la letra inicial del nombre en la bdd*/}
                  <Avatar
                    initial={data.name.charAt(0)}
                    //este color en realidad podria ser random tbh, pero esta puesto asi considerando la posibilidad de que luego agreguemos tipo un "selector" de color para la rutina.
                    size="md"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                      {data.name}
                    </span>
                  </div>

                  <ChevronIcon
                    className="w-5 h-5 text-zinc-600"
                    direction="right"
                  />
                </Card>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectid(data)}
                >
                  select
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRoutine(data.routine_id)}
                >
                  eliminar
                </Button>
                <input
                  type="text"
                  placeholder="nombre de la rutina"
                  ref={iputRef2}
                ></input>
                <button
                  onClick={() =>
                    handleEditRoutine({
                      routine_id: data.routine_id,
                      name: iputRef2.current.value,
                    })
                  }
                >
                  modificar nombre rutina
                </button>
              </div>
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
            {routines.map((routine) => {
              // si no le pone nombre se le queda nueva rutina x defecto para q no quede feo el diseño y tenga sentido el icono
              const displayName = routine.name.trim() === '' ? 'Nueva rutina' : routine.name;
              const initialLetter = displayName.charAt(0).toUpperCase();

              return (
                <Card 
                  key={routine.id} 
                  variant="default"
                  onClick={() => handleOpenRoutine(routine.id)}
                  className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all"
                >
                  <Avatar 
                    initial={initialLetter} 
                    size="md" 
                  />
                  
                  <div className="flex flex-col flex-1 justify-center">
                    <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                      {displayName}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {routine.exercisesCount} {routine.exercisesCount === 1 ? 'ejercicio' : 'ejercicios'} • {formatRelativeTime(routine.lastDone)}
                    </span>
                  </div>

                  <ChevronIcon className="w-5 h-5 text-zinc-600" direction="right" />
                </Card>
              );
            })}
          </div>
        )}
      
       <div> 
        {openModal && (
          <WorkoutModal onClose={handleCloseModal} />
        )}
      </div>
}
