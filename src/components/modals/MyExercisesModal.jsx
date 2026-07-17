import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/queries/useAuth';
import { useFavoriteExercises } from '../../hooks/queries/useExercises';
import { useDeleteExercise } from '../../hooks/mutations/useExercisesMutations';
import { ArrowLeft, PlusIcon } from '../icons';
import { FiEdit2 } from 'react-icons/fi';
import CustomExerciseModal from './CustomExerciseModal';

export default function MyExercisesModal({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const { data: userExercises, isLoading } = useFavoriteExercises(profile_id);
  const { mutateAsync: deleteExercise, isPending: isDeleting } = useDeleteExercise(profile_id);

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
    return ex && !ex.is_populary;
  }) || [];

  return createPortal(
    <div className="fixed inset-0 z-60 flex flex-col justify-end pointer-events-auto">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleCloseWithAnimation}
      />
      
      <div 
        className={`relative w-full h-[85vh] sm:max-w-md sm:mx-auto bg-dark-bg rounded-t-3xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-input-bg shrink-0 z-20">
          <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-black text-white tracking-tight">Mis ejercicios</span>
          <div className="w-9" /> {/* spacer */}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">

          {/* LISTA */}
          <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-3">
            {isLoading ? (
              <p className="text-center text-sm text-zinc-500 mt-10">Cargando...</p>
            ) : filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-12 text-center px-6">
                <p className="text-zinc-400 text-sm font-medium">Aún no has creado ningún ejercicio personalizado.</p>
              </div>
            ) : (
              filteredExercises.map(ue => {
                const ex = ue.exercises;
                const isCustom = !ex.is_populary;
                
                return (
                  <div key={ex.id} className="flex items-center justify-between p-4 bg-karga-gray rounded-2xl">
                    <div className="flex flex-col pr-4">
                      <span className="text-[15px] font-bold text-white tracking-tight">{ex.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {isCustom && <span className="text-[10px] font-black uppercase text-karga-orange bg-karga-orange/10 px-2 py-0.5 rounded-sm">Personalizado</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Botón de editar SOLO si es personalizado */}
                      {isCustom && (
                        <button
                          onClick={() => {
                            setExerciseToEdit(ex);
                            setIsCustomExerciseModalOpen(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-white/5 text-zinc-400 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      )}
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

        {/* BOTÓN CREAR EJERCICIO */}
        <div className="absolute bottom-[-0.1px] inset-x-0 p-5 pb-5 pt-12 bg-linear-to-t from-dark-bg via-dark-bg to-transparent z-30">
          <button
            type="button"
            onClick={() => setIsCustomExerciseModalOpen(true)}
            className="flex items-center justify-center gap-2 p-4 w-full rounded-2xl border-2 border-dashed border-white/10 text-zinc-400 font-bold text-sm hover:border-karga-orange/40 hover:text-karga-orange hover:bg-karga-orange/5 transition-all active:scale-[0.99] bg-dark-bg shadow-2xl"
          >
            <PlusIcon className="w-4 h-4" />
            Crear ejercicio personalizado
          </button>
        </div>
      </div>

      {/* MODAL CONFIRMACION DE BORRADO */}
      {exerciseToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
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

      {isCustomExerciseModalOpen && (
        <CustomExerciseModal 
          onClose={() => {
            setIsCustomExerciseModalOpen(false);
            setExerciseToEdit(null);
          }} 
          exerciseToEdit={exerciseToEdit}
        />
      )}

    </div>
  , document.body);
}
