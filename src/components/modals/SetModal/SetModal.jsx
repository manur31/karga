import { useState } from 'react';
import { useAuth } from '../../../hooks/queries/useAuth';
import { useCreateSet } from '../../../hooks/mutations/useSetsMutations';
import { CheckIcon, PlusIcon } from '../../icons';
import { useRestStore } from '../../../stores/restStore';
import { useSetsStore } from '../../../stores/setsStore';
import { useCalendarStore } from '../../../stores/calendarStore';

const MinusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function SetModal({ exercise, onClose, rest_time }) {
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState('kg');
  
  const [etiqueta, setEtiqueta] = useState('none');
  const [isEtiquetaModalOpen, setIsEtiquetaModalOpen] = useState(false);
  
  const [date, setDate] = useState('Ahora');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { startRest } = useRestStore();

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  const restTime = rest_time || 1;
  // const { mutateAsync: createSet } = useCreateSet(profile_id);
  const { addSet, sets, syncLocalData } = useSetsStore();
  const { addLocalSets } = useCalendarStore();

  if (!exercise) return null;

  const handleCloseWithAnimation = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (!profile_id || isSaving) return;

    setIsSaving(true);
    let weightInKg = Number(weight || 0);
    if (unit === 'lb') {
      weightInKg = weightInKg * 0.453592;
    }

    try {
       addSet({
        profile_id,
        exercise_id: exercise.id,
        rep: Number(reps || 0),
        weight: Number(weightInKg.toFixed(2))
      })
 
      startRest(restTime);
      handleCloseWithAnimation(null);
    } catch (error) {
      console.error("Error al guardar el set:", error);
      setIsSaving(false);
    }
  };

  const handleAdjustReps = (amount) => {
    setReps(prev => Math.max(0, Number(prev || 0) + amount));
  };

  const handleAdjustWeight = (amount) => {
    setWeight(prev => {
      const val = Number(prev || 0) + amount;
      return Math.max(0, parseFloat(val.toFixed(2)));
    });
  };

  const handleFocus = (e) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
    e.target.select();
  };

  const weightStep = unit === 'kg' ? 1 : 2.5;

  const getInputTextSize = (value) => {
    const len = String(value).length;
    if (len >= 5) return 'text-2xl sm:text-3xl';
    if (len === 4) return 'text-3xl sm:text-4xl';
    return 'text-4xl sm:text-5xl';
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end pointer-events-auto">
      {/* Overlay oscuro para cerrar */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleCloseWithAnimation}
      />
      
      {/* Contenedor Bottom Sheet */}
      <div 
        className={`relative w-full sm:max-w-md sm:mx-auto bg-[var(--color-dark-bg)] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-8 h-auto ${
          isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'
        }`}
      >
        {/* Drag handle */}
        <div className="w-full flex justify-center py-4 shrink-0 cursor-pointer" onClick={handleCloseWithAnimation}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* X Close button */}
        <button 
          onClick={handleCloseWithAnimation}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 z-20"
        >
          <XIcon className="w-4 h-4" />
        </button>
        
        {/* Contenido */}
        <div className="px-6 flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight mb-8 truncate pr-10">
            {exercise.name}
          </h2>
          
          {/* ZONA DE INPUTS */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Lado izquierdo: REPS */}
            <div className="flex flex-col items-center justify-center py-6 px-2 bg-white/5 rounded-3xl">
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3">Reps</span>
              <div className="flex items-center justify-between w-full px-2">
                <button 
                  onClick={() => handleAdjustReps(-1)}
                  className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/20"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                
                <input 
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  onFocus={handleFocus}
                  className={`min-w-0 flex-1 bg-transparent text-center font-black text-white tracking-tighter outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputTextSize(reps)}`}
                />
                
                <button 
                  onClick={() => handleAdjustReps(1)}
                  className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/20"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lado derecho: WEIGHT */}
            <div className="flex flex-col items-center justify-center py-6 px-2 bg-white/5 rounded-3xl">
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3">Peso ({unit.toUpperCase()})</span>
              <div className="flex items-center justify-between w-full px-2">
                <button 
                  onClick={() => handleAdjustWeight(-weightStep)}
                  className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/20"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                
                <input 
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onFocus={handleFocus}
                  className={`min-w-0 flex-1 bg-transparent text-center font-black text-white tracking-tighter outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputTextSize(weight)}`}
                />
                
                <button 
                  onClick={() => handleAdjustWeight(weightStep)}
                  className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/20"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ETIQUETAS/OPCIONES RÁPIDAS & BOTÓN GUARDAR EN LA MISMA FILA */}
          <div className="flex items-center justify-between mt-2 gap-4">
            <div className="flex items-center gap-2 overflow-visible">
              
              {/* Dropdown Etiqueta */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsEtiquetaModalOpen(!isEtiquetaModalOpen);
                    setIsCalendarOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors capitalize ${
                    etiqueta !== 'none' ? 'bg-karga-orange text-white shadow-lg shadow-karga-orange/20' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                  }`}
                >
                  {etiqueta !== 'none' ? etiqueta : 'Etiqueta'}
                </button>
                
                {isEtiquetaModalOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-36 bg-[#2A2424] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in flex flex-col">
                    {['none', 'calentamiento', 'amrap', 'pr', 'fallo'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { setEtiqueta(opt); setIsEtiquetaModalOpen(false); }}
                        className={`px-4 py-3 text-sm text-left font-semibold capitalize transition-colors ${
                          etiqueta === opt ? 'bg-karga-orange/20 text-karga-orange' : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {opt === 'none' ? 'Sin etiqueta' : opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón LB / KG */}
              <button 
                onClick={() => setUnit(prev => prev === 'kg' ? 'lb' : 'kg')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold text-zinc-300 whitespace-nowrap transition-colors uppercase"
              >
                {unit === 'kg' ? 'LB' : 'KG'}
              </button>

              {/* Dropdown Ahora (Calendario) */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsCalendarOpen(!isCalendarOpen);
                    setIsEtiquetaModalOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    date !== 'Ahora' ? 'bg-karga-orange text-white shadow-lg shadow-karga-orange/20' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                  }`}
                >
                  {date === 'Ahora' ? 'Ahora' : new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </button>
                
                {isCalendarOpen && (
                  <div className="absolute bottom-full mb-2 left-0 p-4 bg-[#2A2424] border border-white/10 rounded-2xl shadow-xl z-50 animate-fade-in flex flex-col gap-3 min-w-[200px]">
                    <span className="text-sm font-bold text-white">Seleccionar fecha</span>
                    <input 
                      type="datetime-local" 
                      value={date === 'Ahora' ? '' : date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white text-sm rounded-xl p-2 outline-none focus:border-karga-orange transition-colors [color-scheme:dark]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => { setDate('Ahora'); setIsCalendarOpen(false); }}
                        className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                      >
                        Reset
                      </button>
                      <button 
                        onClick={() => setIsCalendarOpen(false)}
                        className="px-3 py-1.5 text-xs font-bold bg-karga-orange text-white rounded-lg active:scale-95 transition-transform"
                      >
                        Listo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Botón Guardar */}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 p-4 rounded-2xl flex-shrink-0 transition-all active:scale-[0.95] shadow-lg shadow-green-500/20 flex items-center justify-center z-10"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
