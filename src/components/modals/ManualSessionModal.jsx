import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPlus, FiClock, FiCalendar, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/queries/useAuth';
import { useSessionStore } from '../../stores/sessionStore';
import { useSetsStore } from '../../stores/setsStore';
import { useSyncSessions, useSyncSets } from '../../hooks/useSync';
import ExerciseSelectorModal from './ExerciseSelectorModal';
import SetModal from './SetModal';
import { useWeightUnit } from '../../hooks/useWeightUnit';

export default function ManualSessionModal({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const { data: user } = useAuth();
  const profile_id = user?.profile_id;

  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(() => format(new Date(Date.now() - 3600000), 'HH:mm')); // 1 hour ago
  const [endTime, setEndTime] = useState(() => format(new Date(), 'HH:mm')); // now

  const [sessionSets, setSessionSets] = useState([]); // Array of { tempId, exercise, rep, weight }
  const [note, setNote] = useState('');
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [activeExerciseForSet, setActiveExerciseForSet] = useState(null); // The exercise we are adding sets for
  
  const { displayWeight, unit } = useWeightUnit();

  const { sync: syncSessions } = useSyncSessions(profile_id);
  const { sync: syncSets } = useSyncSets(profile_id);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleAddExercise = (exercise) => {
    // Just open the set modal directly for the newly selected exercise
    setActiveExerciseForSet(exercise);
  };

  const handleSaveSetOverride = (setData) => {
    setSessionSets(prev => [
      ...prev,
      {
        ...setData,
        tempId: crypto.randomUUID(),
        exercise: activeExerciseForSet
      }
    ]);
  };

  const handleDeleteSet = (tempId) => {
    setSessionSets(prev => prev.filter(s => s.tempId !== tempId));
  };

  const handleSaveSession = () => {
    if (!profile_id) return;

    // Build the date objects
    const startedAt = new Date(`${date}T${startTime}`);
    let finishedAt = new Date(`${date}T${endTime}`);
    
    // If end time is before start time, it probably crossed midnight, add 1 day
    if (finishedAt < startedAt) {
      finishedAt = new Date(finishedAt.getTime() + 86400000);
    }

    // Insert Session
    useSessionStore.getState().addSession({
      startedAt,
      finishedAt,
      created_at: finishedAt,
      profile_id,
      note
    });

    // Insert Sets
    const totalSets = sessionSets.length;
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    
    sessionSets.forEach((set, index) => {
      // Interpolate timestamps across the session duration so they are naturally spaced
      const timeOffset = totalSets > 1 ? (durationMs / (totalSets + 1)) * (index + 1) : durationMs / 2;
      const setDate = new Date(startedAt.getTime() + timeOffset);
      
      useSetsStore.getState().addSet({
        profile_id: set.profile_id,
        exercise_id: set.exercise_id,
        rep: set.rep,
        weight: set.weight,
        created_at: setDate.toISOString()
      });
    });

    // Sync
    syncSessions(profile_id);
    syncSets(profile_id);

    handleClose();
  };

  // Group sets by exercise
  const exercisesWithSets = [];
  sessionSets.forEach(set => {
    let exGroup = exercisesWithSets.find(g => g.exercise.id === set.exercise.id);
    if (!exGroup) {
      exGroup = { exercise: set.exercise, sets: [] };
      exercisesWithSets.push(exGroup);
    }
    exGroup.sets.push(set);
  });

  return createPortal(
    <div 
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-[50] p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div 
        className={`bg-[#2A2424] w-full max-w-md max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 shrink-0">
          <h2 className="text-xl font-bold text-white tracking-wide">Entrada Manual</h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          <div className="flex flex-col gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <FiCalendar className="w-3.5 h-3.5" />
                Fecha
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-karga-orange transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <FiClock className="w-3.5 h-3.5" />
                  Inicio
                </label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-karga-orange transition-colors [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <FiClock className="w-3.5 h-3.5" />
                  Fin
                </label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-karga-orange transition-colors [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <FiFileText className="w-3.5 h-3.5" />
              Notas
            </label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Añade una nota a esta sesión..."
              className="bg-black/20 border border-white/5 text-white rounded-2xl p-4 outline-none focus:border-karga-orange/50 transition-colors resize-none h-24 text-sm placeholder:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-karga-orange rounded-full"></span>
                Ejercicios
              </div>
            </h3>

            {exercisesWithSets.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm bg-black/10 rounded-2xl border border-white/5">
                No has agregado ejercicios aún.
              </div>
            ) : (
              <div className="space-y-4">
                {exercisesWithSets.map((group) => (
                  <div key={group.exercise.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{group.exercise.name}</span>
                      <span className="text-zinc-500 text-xs capitalize">{group.exercise.muscle.join(' • ')}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {group.sets.map((set, index) => (
                        <div key={set.tempId} className="flex items-center justify-between bg-white/5 rounded-xl p-2 px-3">
                          <span className="text-zinc-400 font-bold text-xs w-6">{index + 1}</span>
                          <span className="text-white font-medium flex-1 text-center">{displayWeight(set.weight)}{unit}</span>
                          <span className="text-white font-medium flex-1 text-center">{set.rep} reps</span>
                          <button onClick={() => handleDeleteSet(set.tempId)} className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setActiveExerciseForSet(group.exercise)}
                      className="mt-1 w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" /> Añadir Set
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setIsExerciseSelectorOpen(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-zinc-400 font-bold text-sm hover:border-karga-orange/40 hover:text-karga-orange hover:bg-karga-orange/5 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <FiPlus className="w-4 h-4" /> Buscar Ejercicio
            </button>
          </div>

        </div>

        <div className="p-5 border-t border-white/5 bg-black/20 shrink-0">
          <button 
            onClick={handleSaveSession}
            className="w-full py-4 bg-karga-orange hover:bg-orange-600 text-white rounded-2xl font-black transition-colors shadow-lg shadow-karga-orange/20"
          >
            Guardar Sesión
          </button>
        </div>

      </div>

      {isExerciseSelectorOpen && (
        <ExerciseSelectorModal 
          onClose={() => setIsExerciseSelectorOpen(false)} 
          onSelect={handleAddExercise}
        />
      )}

      {activeExerciseForSet && (
        <SetModal 
          exercise={activeExerciseForSet} 
          onClose={() => setActiveExerciseForSet(null)} 
          onSaveOverride={handleSaveSetOverride}
        />
      )}
    </div>,
    document.body
  );
}
