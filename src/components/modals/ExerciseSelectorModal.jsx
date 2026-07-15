import { useState } from 'react';
import { useAuth } from '../../hooks/queries/useAuth';
import { useExercises, useFavoriteExercises } from '../../hooks/queries/useExercises';
import { FiX, FiSearch } from 'react-icons/fi';

export default function ExerciseSelectorModal({ onClose, onSelect }) {
  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: popularExercises, isLoading: isPopularLoading } = useExercises(profile_id);
  const { data: userExercises, isLoading: isUserLoading } = useFavoriteExercises(profile_id);

  const [search, setSearch] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const isLoading = isPopularLoading || isUserLoading;

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

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) || 
    ex.muscle.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSelect = (exercise) => {
    onSelect(exercise);
    handleClose();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/80 flex flex-col justify-end z-70 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-[#2A2424] w-full max-w-md mx-auto h-[80vh] rounded-t-3xl flex flex-col shadow-2xl overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-white tracking-wide">Añadir Ejercicio</h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5 shrink-0">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o músculo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-karga-orange transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {isLoading && exercises.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin" />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No se encontraron ejercicios.
            </div>
          ) : (
            filteredExercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="flex flex-col items-start p-4 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 transition-colors text-left"
              >
                <span className="text-white font-bold">{ex.name}</span>
                <span className="text-zinc-500 text-xs mt-1 capitalize">{ex.muscle.join(' • ')}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
