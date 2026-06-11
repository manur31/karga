import React, { useState } from 'react';
import { useAuth } from '../../../hooks/queries/useAuth';
import { useSetsForExercise } from '../../../hooks/queries/useSets';
import { useDeleteSet } from '../../../hooks/mutations/useSetsMutations';
import { ArrowLeft, PlusIcon } from '../../icons';
import SetModal from '../SetModal/SetModal';
import EditSetModal from '../EditSetModal/EditSetModal';
import { useSetsStore } from '../../../stores/setsStore';

export default function ExerciseHistoryModal({ exercise, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [selectedSetToEdit, setSelectedSetToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 
  // Estados para modo de selección/borrado 
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSets, setSelectedSets] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  const { data: sets = [], isLoading } = useSetsForExercise(profile_id, exercise?.id);
  const { mutateAsync: deleteSet } = useDeleteSet(profile_id);
  const { syncedSets, sets: allSetsFromStore } = useSetsStore();

  if (!exercise) return null;

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const filteredSetsFromStore = allSetsFromStore.filter(set => set.exercise_id === exercise.id)

  const allSets = [...filteredSetsFromStore, ...sets, ...syncedSets.filter(set => set.exercise_id === exercise.id)];

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedSets([]);
  };

  const toggleSetSelection = (setId) => {
    setSelectedSets(prev => 
      prev.includes(setId) 
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  };

  const handleDeleteSelected = async () => {
    if (!profile_id || selectedSets.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(selectedSets.map(setId => deleteSet(setId)));
      setIsSelectMode(false);
      setSelectedSets([]);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error al borrar sets:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Agrupar sets por fecha
  const groupedSets = allSets?.reduce((groups, set) => {
    const date = new Date(set.created_at);
    
    const dateStr = date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase();
    
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(set);
    return groups;
  }, {});

  // Ordenar los días de más reciente a más antiguo
  const sortedDates = groupedSets ? Object.keys(groupedSets).sort((a, b) => {
    const dateA = new Date(groupedSets[a][0].created_at);
    const dateB = new Date(groupedSets[b][0].created_at);
    return dateB - dateA;
  }) : [];

  return (
    <>
      <div className="fixed top-0 bottom-[76px] left-0 w-full sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 z-[45] flex flex-col overflow-hidden pointer-events-none">
        <div className={`w-full h-full flex flex-col relative bg-[var(--color-dark-bg)] pointer-events-auto ${
          isClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'
        }`}>
          
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 bg-[var(--color-input-bg)] shrink-0 z-20">
            <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
              <span className="text-lg font-black text-white tracking-tight truncate w-full text-center">
                {exercise.name}
              </span>
              <span className="text-sm font-medium text-zinc-400 truncate w-full text-center mt-0.5">
                Historial de Sets
              </span>
            </div>
            <button 
              onClick={toggleSelectMode}
              className="text-karga-orange font-bold text-sm px-2 py-1.5 active:scale-95 transition-all w-16 text-right"
            >
              {isSelectMode ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {/* CONTENIDO SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:none z-10 relative">
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-karga-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !sortedDates.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sin historial</h3>
                <p className="text-sm text-zinc-500 font-medium">
                  Aún no has registrado ningún set para este ejercicio. Toca el botón + para comenzar.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {sortedDates.map(dateStr => (
                  <div key={dateStr} className="flex flex-col gap-3">
                    <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                      {dateStr}
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                      {groupedSets[dateStr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(set => {
                        const timeStr = new Date(set.created_at).toLocaleTimeString('es-ES', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        }).toLowerCase();

                        const setId = set.set_id || set.id;
                        const isSelected = selectedSets.includes(setId);

                        return (
                          <div 
                            key={setId} 
                            onClick={() => {
                              if (isSelectMode) {
                                toggleSetSelection(setId);
                              } else {
                                setSelectedSetToEdit(set);
                                setIsEditModalOpen(true);
                              }
                            }}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                              isSelected 
                                ? 'bg-red-500/10 border-red-500/50' 
                                : 'bg-[var(--color-input-bg)] border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isSelectMode && (
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected ? 'bg-red-500 border-red-500' : 'border-zinc-500'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              <span className={`text-sm font-bold ${isSelected ? 'text-red-400' : 'text-zinc-400'}`}>
                                {timeStr}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="text-base font-black text-white">
                                {set.rep} <span className="text-xs text-zinc-500 font-bold ml-0.5">rep{set.rep !== 1 ? 's' : ''}</span>
                              </span>
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-base font-black text-karga-orange">
                                {set.weight} <span className="text-xs text-karga-orange/60 font-bold ml-0.5">kg</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FABs */}
          {isSelectMode ? (
            selectedSets.length > 0 && (
              <div className="absolute bottom-6 left-6 z-30 animate-slide-in-up">
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="h-14 px-6 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center transition-all active:scale-95 gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Eliminar {selectedSets.length} set{selectedSets.length !== 1 ? 's' : ''}
                </button>
              </div>
            )
          ) : (
            <div className="absolute bottom-6 right-6 z-30">
              <button
                onClick={() => setIsSetModalOpen(true)}
                className="w-16 h-16 bg-karga-orange hover:bg-orange-500 text-white rounded-[22px] shadow-lg shadow-karga-orange/30 flex items-center justify-center transition-all active:scale-95"
              >
                <PlusIcon className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowConfirmDialog(false)} />
          <div className="relative bg-[#2A2424] border border-white/10 rounded-3xl p-6 w-full max-w-[320px] shadow-2xl animate-fade-in flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white">¿Eliminar sets?</h3>
              <p className="text-sm font-medium text-zinc-400">
                Estás a punto de eliminar {selectedSets.length} set{selectedSets.length !== 1 ? 's' : ''} de tu historial de forma permanente. Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-400 active:scale-95 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SetModal */}
      {isSetModalOpen && (
        <SetModal 
          exercise={exercise} 
          onClose={() => setIsSetModalOpen(false)} 
        />
      )}

      {/* EditSetModal */}
      {isEditModalOpen && selectedSetToEdit && (
        <EditSetModal 
          setToEdit={selectedSetToEdit}
          exerciseName={exercise.name}
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </>
  );
}
