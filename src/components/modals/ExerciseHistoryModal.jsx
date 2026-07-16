import { useState } from 'react';
import { useAuth } from '../../hooks/queries/useAuth';
import { useSetsForExercise } from '../../hooks/queries/useSets';
import { useDeleteSet } from '../../hooks/mutations/useSetsMutations';
import { useWeightUnit } from '../../hooks/useWeightUnit';
import { ArrowLeft, PlusIcon } from '../icons';
import SetModal from './SetModal';
import EditSetModal from './EditSetModal';
import ConfirmModal from './ConfirmModal';
import { useSetsStore } from '../../stores/setsStore';

export default function ExerciseHistoryModal({ exercise, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [selectedSetToEdit, setSelectedSetToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 
  // Estados para modo de selección/borrado 
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSets, setSelectedSets] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { unit, displayWeight } = useWeightUnit();

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  const { data: sets = [], isLoading } = useSetsForExercise(profile_id, exercise?.id);
  const { mutateAsync: deleteSet } = useDeleteSet(profile_id);
  const { sets: allSetsFromStore } = useSetsStore();

  if (!exercise) return null;

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const filteredSetsFromStore = allSetsFromStore.filter(set => set.exercise_id === exercise.id)

  const allSets = [...filteredSetsFromStore, ...sets];

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
    try {
      await Promise.all(selectedSets.map(setId => deleteSet(setId)));
      setIsSelectMode(false);
      setSelectedSets([]);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error al borrar sets:", error);
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
      <div className="fixed top-0 bottom-19 left-0 w-full sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 z-45 flex flex-col overflow-hidden pointer-events-none">
        <div className={`w-full h-full flex flex-col relative bg-dark-bg pointer-events-auto ${
          isClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'
        }`}>
          
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 bg-input-bg shrink-0 z-20">
            <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center flex-1 mx-4 min-w-0">
              <span className="text-lg font-black text-white tracking-tight truncate w-full text-center">
                {exercise.name}
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
          <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6 scrollbar-none [&::-webkit-scrollbar]:none z-10 relative">
            
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
                <h2 className="text-lg font-bold text-zinc-400 tracking-tight -mb-3">Historial de sets</h2>
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
                                : 'bg-input-bg border-white/5 hover:bg-white/5'
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
                                {displayWeight(set.weight)} <span className="text-xs text-karga-orange/60 font-bold ml-0.5">{unit}</span>
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
              <div className="absolute bottom-8 left-6 z-30 animate-slide-in-up">
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
            <div className="absolute bottom-8 right-5 z-30">
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
      <ConfirmModal 
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteSelected}
        title="¿Eliminar sets?"
        description={`Estás a punto de eliminar ${selectedSets.length} set${selectedSets.length !== 1 ? 's' : ''} de tu historial de forma permanente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger={true}
      />

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
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </>
  );
}
