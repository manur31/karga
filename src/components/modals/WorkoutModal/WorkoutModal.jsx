import { useState } from 'react';
import { useExercises, useFavoriteExercises } from '../../../hooks/queries/useExercises';
import { useUpdateFavorite, useAddToFavorite } from '../../../hooks/mutations/useExercisesMutations';
import { ArrowLeft, PlusIcon, CheckIcon } from '../../icons';
import CustomExerciseModal from '../CustomExerciseModal/CustomExerciseModal';
import ExerciseInfoModal from '../ExerciseInfoModal/ExerciseInfoModal';

const HeartIcon = ({ filled, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={filled ? 0 : 2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const QuestionIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);

export default function WorkoutModal({ onClose, onSave }) {
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

  const exercises = Array.from(exercisesMap.values());
  exercises.sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleToggleFavorite = async (exercise) => {
    const inUserExercises = userExercises?.some(ue => ue.exercise_id === exercise.id);
    try {
      if (inUserExercises) {
        await updateFavorite({ exercise_id: exercise.id, is_favorite: !exercise.is_favorite });
      } else {
        await addToFavorite(exercise.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [selectedExercises, setSelectedExercises] = useState([]);
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");
  
  const [isClosing, setIsClosing] = useState(false);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);
  const [selectedExerciseForInfo, setSelectedExerciseForInfo] = useState(null);

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

  const handleSaveRoutine = () => {
    if (onSave) {
      onSave(routineName, description, selectedExercises);
    }
    handleCloseWithAnimation();
  };

  const handleOpenExerciseInfo = (e, exercise) => {
    e.stopPropagation(); 
    setSelectedExerciseForInfo(exercise);
  };

  const handleCreateCustomExercise = () => {
    setIsCustomExerciseModalOpen(true);
  };

  return (
    
    <div className="fixed top-0 bottom-[76px] left-1/2 -translate-x-1/2 w-full max-w-md z-40 flex flex-col overflow-hidden pointer-events-none">
      
      
      <div className={`w-full h-full flex flex-col relative bg-[var(--color-dark-bg)] pointer-events-auto ${
        isClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'
      }`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-[var(--color-input-bg)] shrink-0 z-20">
          <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-black text-white tracking-tight">Nueva rutina</span>
          <button 
            onClick={handleSaveRoutine}
            disabled={selectedExercises.length === 0}
            className="text-karga-orange font-bold text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Guardar
          </button>
        </div>

        {/* SCROLL */}
        <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:none z-10">
          
          {/* INPUT NOMBRE RUTINA */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
              Nombre de la rutina
            </label>
            <input 
              type="text" 
              placeholder="Ej: Push Day" 
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="bg-[var(--color-input-bg)] border border-transparent rounded-2xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-karga-orange transition-colors font-medium shadow-inner"
            />
          </div>

          {/* INPUT DESCRIPCION RUTINA */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
              Descripción (OPCIONAL)
            </label>
            <input 
              type="text" 
              placeholder="Ej: Rutina de fuerza para tren superior" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[var(--color-input-bg)] border border-transparent rounded-2xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-karga-orange transition-colors font-medium shadow-inner"
            />
          </div>

          {/* LISTA DE EJERCICIOS */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1 pl-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Ejercicios disponibles
              </label>
              <span className="text-xs text-karga-orange font-bold">
                {selectedExercises.length} agregados
              </span>
            </div>

            {isLoading && exercises.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin" />
              </div>
            ) : null}

            {isError && (
              <div className="text-red-400 text-sm text-center p-4 bg-red-500/10 rounded-2xl border border-red-500/10 font-medium">
                Error al cargar los ejercicios de la base de datos.
              </div>
            )}

            {exercises && exercises.map((exercise) => {
              const isSelected = selectedExercises.includes(exercise.id);

              return (
                <div 
                  key={exercise.id}
                  onClick={() => handleToggleExercise(exercise.id)}
                  className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-[var(--color-karga-gray)] border-green-500/50 shadow-lg shadow-green-500/5' 
                      : 'bg-[var(--color-karga-gray)] border-transparent hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-col flex-1">
                    <span className="text-[15px] text-zinc-100 font-bold tracking-tight">{exercise.name}</span>
                    <span className="text-[11px] text-zinc-500 font-semibold capitalize mt-0.5">{exercise.muscle}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={(e) => handleOpenExerciseInfo(e, exercise)}
                      className="p-2 text-zinc-500 hover:text-karga-orange hover:bg-white/5 rounded-xl transition-all"
                    >
                      <QuestionIcon className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(exercise); }}
                        className="p-2 -mr-1 text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <HeartIcon filled={exercise.is_favorite} className={`w-5 h-5 ${exercise.is_favorite ? 'text-red-500' : ''}`} />
                      </button>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 ${
                        isSelected 
                          ? 'border-green-500 bg-green-500/10 scale-105' 
                          : 'border-zinc-600 bg-transparent'
                      }`}>
                        {isSelected && <CheckIcon className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÓN CREAR EJERCICIO */}
        <div className="absolute bottom-[-0.1px] inset-x-0 p-5 pb-0 pt-12 bg-gradient-to-t from-[var(--color-dark-bg)] via-[var(--color-dark-bg)] to-transparent z-30">
          <button
            type="button"
            onClick={handleCreateCustomExercise}
            className="flex items-center justify-center gap-2 p-4 w-full rounded-2xl border-2 border-dashed border-white/10 text-zinc-400 font-bold text-sm hover:border-karga-orange/40 hover:text-karga-orange hover:bg-karga-orange/5 transition-all active:scale-[0.99] bg-[var(--color-dark-bg)] shadow-2xl"
          >
            <PlusIcon className="w-4 h-4" />
            Crear ejercicio personalizado
          </button>
        </div>

      </div>

      {isCustomExerciseModalOpen && (
        <CustomExerciseModal onClose={() => setIsCustomExerciseModalOpen(false)} />
      )}

      {selectedExerciseForInfo && (
        <ExerciseInfoModal 
          exercise={selectedExerciseForInfo} 
          onClose={() => setSelectedExerciseForInfo(null)} 
        />
      )}
    </div>
  );
}