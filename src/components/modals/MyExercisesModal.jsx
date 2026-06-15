import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/queries/useAuth';
import { useFavoriteExercises } from '../../hooks/queries/useExercises';
import { useDeleteExercise, useUpdateFavorite } from '../../hooks/mutations/useExercisesMutations';
import { ArrowLeft } from '../icons';

const HeartIcon = ({ filled, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={filled ? 0 : 2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

export default function MyExercisesModal({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [filterCustom, setFilterCustom] = useState(true);
  const [filterFavs, setFilterFavs] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: userExercises, isLoading } = useFavoriteExercises(profile_id);
  const { mutateAsync: deleteExercise, isPending: isDeleting } = useDeleteExercise(profile_id);
  const { mutateAsync: updateFavorite } = useUpdateFavorite(profile_id);

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDeleteConfirm = async () => {
    if (!exerciseToDelete) return;
    try {
      await deleteExercise(exerciseToDelete.id);
      setExerciseToDelete(null);
    } catch (error) {
      console.error("Error al borrar el ejercicio:", error);
    }
  };

  const filteredExercises = userExercises?.filter(ue => {
    const ex = ue.exercises;
    if (!ex) return false;
    const isCustom = !ex.is_populary;
    const isFav = ue.is_favorite;

    if (filterCustom && filterFavs) {
      return isCustom || isFav;
    }
    if (filterCustom) return isCustom;
    if (filterFavs) return isFav;
    
    return false;
  }) || [];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col justify-end pointer-events-auto">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleCloseWithAnimation}
      />
      
      <div 
        className={`relative w-full h-[85vh] sm:max-w-md sm:mx-auto bg-[var(--color-dark-bg)] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-[var(--color-input-bg)] shrink-0 z-20">
          <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-black text-white tracking-tight">Mis ejercicios</span>
          <div className="w-9" /> {/* spacer */}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* FILTROS */}
          <div className="flex gap-2 p-4 shrink-0 bg-[var(--color-input-bg)] border-b border-white/5">
            <button
              onClick={() => setFilterCustom(!filterCustom)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                filterCustom 
                  ? 'bg-karga-orange/10 border-karga-orange text-karga-orange shadow-sm' 
                  : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
              }`}
            >
              Personalizados
            </button>
            <button
              onClick={() => setFilterFavs(!filterFavs)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                filterFavs 
                  ? 'bg-karga-orange/10 border-karga-orange text-karga-orange shadow-sm' 
                  : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
              }`}
            >
              Favoritos
            </button>
          </div>

          {/* LISTA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <p className="text-center text-sm text-zinc-500 mt-10">Cargando...</p>
            ) : filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-12 text-center px-6">
                <p className="text-zinc-400 text-sm font-medium">No hay ejercicios que coincidan con estos filtros.</p>
              </div>
            ) : (
              filteredExercises.map(ue => {
                const ex = ue.exercises;
                const isCustom = !ex.is_populary;
                
                return (
                  <div key={ex.id} className="flex items-center justify-between p-4 bg-[var(--color-karga-gray)] rounded-2xl">
                    <div className="flex flex-col pr-4">
                      <span className="text-[15px] font-bold text-white tracking-tight">{ex.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {isCustom && <span className="text-[10px] font-black uppercase text-karga-orange bg-karga-orange/10 px-2 py-0.5 rounded-sm">Personalizado</span>}
                        {ue.is_favorite && <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded-sm">Favorito</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Botón de favoritos (para TODOS los ejercicios de esta lista) */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          updateFavorite({ exercise_id: ex.id, is_favorite: !ue.is_favorite }).catch(console.error);
                        }}
                        className="p-2 -mr-1 text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <HeartIcon filled={ue.is_favorite} className={`w-5 h-5 ${ue.is_favorite ? 'text-red-500' : ''}`} />
                      </button>

                      {/* Botón de borrar SOLO si es personalizado */}
                      {isCustom && (
                        <button
                          onClick={() => setExerciseToDelete(ex)}
                          className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMACION DE BORRADO */}
      {exerciseToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExerciseToDelete(null)} />
          <div className="relative bg-[#2A2424] p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-white/10 animate-fade-in text-center">
            <h3 className="text-xl font-black text-white mb-2">¿Eliminar ejercicio?</h3>
            <p className="text-sm text-zinc-400 font-medium mb-6">
              Estás por eliminar "<span className="text-white font-bold">{exerciseToDelete.name}</span>". Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setExerciseToDelete(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  , document.body);
}
