import { useEffect, useState } from 'react';
import { useCreateExercise, useUpdateExercise } from '../../hooks/mutations/useExercisesMutations';
import { getCachedProfile } from '../../storage/profile-storage';
import { useExercises } from '../../hooks/queries/useExercises';
import { ArrowLeft } from '../icons';

const MUSCLES = [
  'Espalda', 'Bíceps', 'Pecho', 'Hombros', 'Tríceps', 'Abdominales', 
  'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Gemelos', 'Cuerpo completo', 'Cardio'
];

export default function CustomExerciseModal({ onClose, exerciseToEdit }) {
  const [name, setName] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [trackingType, setTrackingType] = useState("weight_reps");
  const [isClosing, setIsClosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (exerciseToEdit) {
      setName(exerciseToEdit.name || "");
      setSelectedMuscles(exerciseToEdit.muscle ? exerciseToEdit.muscle.map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()) : []);
      setTrackingType(exerciseToEdit.tracking_type || "weight_reps");
    }
  }, [exerciseToEdit]);

  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;

  const { data: allExercises } = useExercises(profile_id);
  const { mutateAsync: createExercise, isPending: isCreating } = useCreateExercise(profile_id);
  const { mutateAsync: updateExercise, isPending: isUpdating } = useUpdateExercise(profile_id);
  
  const isPending = isCreating || isUpdating;

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleToggleMuscle = (muscle) => {
    setErrorMsg("");
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const nameExists = allExercises?.some(ex => ex.name.toLowerCase() === name.trim().toLowerCase() && ex.id !== exerciseToEdit?.id);
    if (nameExists) {
      setErrorMsg("Ya existe un ejercicio con este nombre");
      return;
    }

    try {
      if (exerciseToEdit) {
        await updateExercise({
          id: exerciseToEdit.id,
          name: name.trim(),
          muscle: selectedMuscles.map(m => m.toLowerCase()),
          tracking_type: trackingType,
        });
      } else {
        await createExercise({
          name: name.trim(),
          muscle: selectedMuscles.map(m => m.toLowerCase()),
          category: 1,
          tracking_type: trackingType,
        });
      }
      handleCloseWithAnimation();
    } catch (error) {
      console.error("Error creating custom exercise:", error);
      setErrorMsg("Ocurrió un error al guardar el ejercicio");
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex flex-col justify-end pointer-events-auto">
      {/* Overlay oscuro para cerrar */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleCloseWithAnimation}
      />
      
      {/* Contenedor Bottom Sheet */}
      <div 
        className={`relative w-full h-auto max-h-[85vh] sm:max-w-md sm:mx-auto bg-dark-bg rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-8 ${
          isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-input-bg shrink-0 z-20">
          <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-black text-white tracking-tight">{exerciseToEdit ? 'Editar ejercicio' : 'Ejercicio personalizado'}</span>
          <button 
            onClick={handleSave}
            disabled={!name.trim() || isPending}
            className="text-karga-orange font-bold text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-none [&::-webkit-scrollbar]:none">
          
          {/* INPUT NOMBRE */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
              Nombre del Ejercicio
            </label>
            <input 
              type="text" 
              placeholder="Ej: Curl de bíceps concentrado" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg("");
              }}
              className="bg-input-bg border border-transparent rounded-2xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-karga-orange transition-colors font-medium shadow-inner"
            />
            {errorMsg && (
              <span className="text-[11px] font-medium text-red-400 pl-1 mt-1">
                {errorMsg}
              </span>
            )}
          </div>

          {/* SELECTOR DE TIPO DE EJERCICIO */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
              ¿Cómo se mide?
            </label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setTrackingType('weight_reps')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  trackingType === 'weight_reps' 
                    ? 'bg-karga-orange/10 border-karga-orange text-karga-orange shadow-lg shadow-karga-orange/5' 
                    : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${trackingType === 'weight_reps' ? 'border-karga-orange' : 'border-zinc-500'}`}>
                  {trackingType === 'weight_reps' && <div className="w-2 h-2 rounded-full bg-karga-orange" />}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-sm">Peso y repeticiones</span>
                </div>
              </button>
              
              <button
                onClick={() => setTrackingType('time')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  trackingType === 'time' 
                    ? 'bg-karga-orange/10 border-karga-orange text-karga-orange shadow-lg shadow-karga-orange/5' 
                    : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${trackingType === 'time' ? 'border-karga-orange' : 'border-zinc-500'}`}>
                  {trackingType === 'time' && <div className="w-2 h-2 rounded-full bg-karga-orange" />}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-sm">Solo tiempo</span>
                </div>
              </button>

              <button
                onClick={() => setTrackingType('weight_time')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  trackingType === 'weight_time' 
                    ? 'bg-karga-orange/10 border-karga-orange text-karga-orange shadow-lg shadow-karga-orange/5' 
                    : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${trackingType === 'weight_time' ? 'border-karga-orange' : 'border-zinc-500'}`}>
                  {trackingType === 'weight_time' && <div className="w-2 h-2 rounded-full bg-karga-orange" />}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-sm">Peso y tiempo</span>
                </div>
              </button>
            </div>
          </div>

          {/* SELECTOR DE MÚSCULOS */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
              Músculos implicados <span className="text-zinc-600 lowercase">(Opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MUSCLES.map(muscle => {
                const isSelected = selectedMuscles.includes(muscle);
                return (
                  <button
                    key={muscle}
                    onClick={() => handleToggleMuscle(muscle)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                      isSelected 
                        ? 'bg-karga-orange/10 border-karga-orange text-karga-orange shadow-lg shadow-karga-orange/5' 
                        : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-zinc-300'
                    }`}
                  >
                    {muscle}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
