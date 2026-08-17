import { useState, useRef, useEffect } from "react";
import { useRestStore } from "../../../stores/restStore";
import { useCreateSet } from "../../../hooks/mutations/useSetsMutations";
import { getLastSetForExercise } from "../../../lib/local/setsHelpers";
import { getCachedProfile } from "../../../storage/profile-storage";
import { useWeightUnit } from "../../../hooks/useWeightUnit";
import { PlusIcon } from "../../icons";
import { FiMinus, FiSquare } from "react-icons/fi";
import { VscRecord } from "react-icons/vsc";

export const InlineExerciseExpander = ({ exercise, onSaveDone, rest_time }) => {
  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;
  const restSeconds = Number(rest_time) || Number(profile.rest_time) || 60;
  const { startRest } = useRestStore();
  const { mutateAsync: createSet } = useCreateSet(profile_id);
  
  const { unit, toggleUnit, convertToKg } = useWeightUnit();
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cards, setCards] = useState([
    { id: Date.now(), reps, weight, duration }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activeTimerId, setActiveTimerId] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartTimer = (id) => {
    setActiveTimerId(id);
    setTimerSeconds(0);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleStopTimer = () => {
    if (activeTimerId === 'global') {
      setDuration(timerSeconds);
    } else if (activeTimerId) {
      setCards(prev => prev.map(c => c.id === activeTimerId ? { ...c, duration: timerSeconds } : c));
    }
    setActiveTimerId(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const trackingType = exercise?.tracking_type || exercise?.trackingType || 'weight_reps';
  const showWeight = trackingType === 'weight_reps' || trackingType === 'weight_time';
  const showReps = trackingType === 'weight_reps';
  const showTime = trackingType === 'time' || trackingType === 'weight_time';

  useEffect(() => {
    let cancelled = false;

    const loadLast = async () => {
      if (!exercise?.id) return;
      const lastSet = await getLastSetForExercise(exercise.id, profile_id);
      if (cancelled || !lastSet) return;

      const displayWeight = unit === 'kg' ? lastSet.weight : Number((lastSet.weight * 2.20462).toFixed(2));
      setReps(lastSet.rep || 0);
      setWeight(displayWeight || 0);
      setDuration(lastSet.duration || 0);
      setCards(prev => prev.map(c => ({
        ...c,
        reps: lastSet.rep || 0,
        weight: displayWeight || 0,
        duration: lastSet.duration || 0,
      })));
    };

    loadLast();
    return () => {
      cancelled = true;
    };
  }, [exercise?.id, profile_id, unit]);

  useEffect(() => {
    setCards(prev => prev.map(c => ({ ...c, reps, weight, duration })));
  }, [reps, weight, duration]);

  const handleToggleUnit = () => {
    if (unit === 'kg') {
      setWeight(prev => Number((Number(prev) * 2.20462).toFixed(2)));
      setCards(prev => prev.map(c => ({ ...c, weight: Number((Number(c.weight) * 2.20462).toFixed(2)) })));
    } else {
      setWeight(prev => Number((Number(prev) / 2.20462).toFixed(2)));
      setCards(prev => prev.map(c => ({ ...c, weight: Number((Number(c.weight) / 2.20462).toFixed(2)) })));
    }
    toggleUnit();
  };

  const handleSave = async () => {
    if (cards.length === 0 || !profile_id || isSaving) return;
    setIsSaving(true);

    try {
      const runningTimerId = activeTimerId;
      const runningSeconds = timerSeconds;
      if (runningTimerId) {
        handleStopTimer();
      }

      let lastWeightKg = 0;
      let lastReps = 0;

      for (const card of cards) {
        const cardDuration = runningTimerId === card.id || runningTimerId === 'global'
          ? runningSeconds
          : Number(card.duration || 0);
        const weightKg = convertToKg(card.weight);
        lastWeightKg = Number(weightKg.toFixed(2));
        lastReps = Number(card.reps || 0);

        await createSet({
          profile_id,
          exercise_id: exercise.id,
          rep: showReps ? lastReps : 0,
          weight: showWeight ? lastWeightKg : 0,
          duration: showTime ? cardDuration : 0,
        });
      }
    
      // Only trigger rest timer if exactly 1 set is being saved
      if (cards.length === 1) {
        startRest({
          seconds: restSeconds,
          lastSet: {
            exerciseName: exercise.name,
            weightKg: lastWeightKg,
            reps: lastReps,
          },
        });
      }
    
      onSaveDone?.();
    } catch (error) {
      console.error('Error al grabar series inline:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#2A2424] p-3 rounded-2xl flex flex-col gap-3 mt-2 mb-4 animate-scale-in">
      {/* Global Controls */}
      <div className="flex flex-col bg-[#1E1A1A] rounded-xl p-3 gap-3 relative overflow-hidden">
        {showReps && (
          <div className="flex flex-col items-center w-full">
            <span className="text-[9px] font-bold text-zinc-500 mb-1">REPS GLOBALES</span>
            <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center">
              <div></div> {/* Espaciador izquierdo */}
              <div className="flex items-center gap-2">
                <button 
                  disabled={activeTimerId !== null} 
                  onClick={() => setReps(r => Math.max(0, Number(r) - 1))} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white'}`}
                >
                  <FiMinus className="w-3 h-3" />
                </button>
                <input 
                  type="number" 
                  value={reps}
                  onChange={(e) => activeTimerId === null && setReps(e.target.value)}
                  disabled={activeTimerId !== null}
                  className={`w-12 bg-transparent text-center font-black text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId !== null ? 'text-white/30' : 'text-white'}`}
                />
                <button 
                  disabled={activeTimerId !== null} 
                  onClick={() => setReps(r => Number(r) + 1)} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white'}`}
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
              <div></div> {/* Espaciador derecho */}
            </div>
          </div>
        )}

        {showReps && showTime && <div className="w-full h-px bg-white/5" />}

        {showTime && (
          <div className="flex flex-col items-center w-full relative">
            <span className="text-[9px] font-bold text-zinc-500 mb-1">
              {activeTimerId === 'global' ? (
                <span className="flex items-center gap-1 text-red-500 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  EN VIVO
                </span>
              ) : (
                "TIEMPO GLOBAL"
              )}
            </span>
            
            <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center min-h-[24px]">
              <div></div> {/* Espaciador izquierdo */}
              
              {/* Controles centrales de tiempo */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDuration(d => Math.max(0, Number(d) - 15))} 
                  disabled={activeTimerId !== null}
                  className={`h-6 px-2.5 rounded-full transition-colors flex items-center justify-center font-bold text-[10px] shrink-0 ${activeTimerId === 'global' ? 'opacity-0 pointer-events-none' : (activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white')}`}
                >
                  -15
                </button>
                
                <div className="flex items-center text-white font-black text-lg gap-0.5">
                  <input 
                    type="number" 
                    value={Math.floor((activeTimerId === 'global' ? timerSeconds : duration) / 60).toString().padStart(2, '0')}
                    onChange={(e) => activeTimerId !== 'global' && setDuration(parseInt(e.target.value || 0) * 60 + (duration % 60))}
                    disabled={activeTimerId !== null}
                    className={`w-8 bg-transparent text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId === 'global' ? 'text-red-500' : (activeTimerId !== null ? 'text-white/30' : '')}`}
                  />
                  <span className={activeTimerId === 'global' ? 'text-red-500' : (activeTimerId !== null ? 'text-white/30' : 'text-zinc-500')}>:</span>
                  <input 
                    type="number" 
                    value={((activeTimerId === 'global' ? timerSeconds : duration) % 60).toString().padStart(2, '0')}
                    onChange={(e) => activeTimerId !== 'global' && setDuration(Math.floor(duration / 60) * 60 + parseInt(e.target.value || 0))}
                    disabled={activeTimerId !== null}
                    className={`w-8 bg-transparent text-left outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId === 'global' ? 'text-red-500' : (activeTimerId !== null ? 'text-white/30' : '')}`}
                  />
                </div>

                <button 
                  onClick={() => setDuration(d => Number(d) + 15)} 
                  disabled={activeTimerId !== null}
                  className={`h-6 px-2.5 rounded-full transition-colors flex items-center justify-center font-bold text-[10px] shrink-0 ${activeTimerId === 'global' ? 'opacity-0 pointer-events-none' : (activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white')}`}
                >
                  +15
                </button>
              </div>
              
              {/* Botón de Record anclado a la derecha */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                {activeTimerId !== 'global' ? (
                  <button 
                    onClick={() => handleStartTimer('global')}
                    disabled={activeTimerId !== null}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'}`}
                    title="Iniciar cronómetro"
                  >
                    <VscRecord className="w-3 h-3" />
                  </button>
                ) : (
                  <button 
                    onClick={handleStopTimer}
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white shrink-0 flex items-center justify-center transition-colors"
                    title="Detener cronómetro"
                  >
                    <FiSquare className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showTime && showWeight && <div className="w-full h-px bg-white/5" />}
        {!showTime && showReps && showWeight && <div className="w-full h-px bg-white/5" />}

        {showWeight && (
          <div className="flex flex-col items-center w-full relative">
            <span className="text-[9px] font-bold text-zinc-500 mb-1">PESO GLOBAL</span>
            <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center min-h-[24px]">
              <div></div> {/* Espaciador izquierdo */}
              <div className="flex items-center gap-2">
                <button 
                  disabled={activeTimerId !== null} 
                  onClick={() => setWeight(w => Math.max(0, Number(w) - (unit === 'kg' ? 1 : 2.5)))} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white'}`}
                >
                  <FiMinus className="w-3 h-3" />
                </button>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => activeTimerId === null && setWeight(e.target.value)}
                  disabled={activeTimerId !== null}
                  className={`w-16 bg-transparent text-center font-black text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId !== null ? 'text-white/30' : 'text-white'}`}
                />
                <button 
                  disabled={activeTimerId !== null} 
                  onClick={() => setWeight(w => Number(w) + (unit === 'kg' ? 1 : 2.5))} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 text-white'}`}
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
              <div></div> {/* Espaciador derecho */}
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
              <button 
                onClick={handleToggleUnit}
                disabled={activeTimerId !== null}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {unit}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-2">
        {cards.map((card, idx) => (
          <div key={card.id} className="bg-[#2A2424] rounded-xl p-3 flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${idx * 120}ms`, animationFillMode: 'both' }}>
            <span className="text-zinc-500 font-black text-sm w-4 shrink-0">{idx + 1}°</span>
            <div className="flex-1 flex gap-2">
              
              {showReps && (
                <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-between p-1 px-2">
                  <button 
                    disabled={activeTimerId !== null} 
                    onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, reps: Math.max(0, Number(c.reps) - 1) } : c))} 
                    className={`p-1 transition-colors ${activeTimerId !== null ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}
                  >
                    <FiMinus className="w-3 h-3" />
                  </button>
                  <input 
                    type="number" 
                    value={card.reps}
                    onChange={(e) => activeTimerId === null && setCards(prev => prev.map(c => c.id === card.id ? { ...c, reps: e.target.value } : c))}
                    disabled={activeTimerId !== null}
                    className={`w-8 bg-transparent text-center font-bold transition-colors outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId !== null ? 'text-white/20' : 'text-white/40 focus:text-white'}`}
                  />
                  <button 
                    disabled={activeTimerId !== null} 
                    onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, reps: Number(c.reps) + 1 } : c))} 
                    className={`p-1 transition-colors ${activeTimerId !== null ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}
                  >
                    <PlusIcon className="w-3 h-3" />
                  </button>
                </div>
              )}

              {showTime && (
                <div className={`bg-white/5 rounded-lg items-center p-1 px-2 ${!showWeight && !showReps ? 'grid grid-cols-[1fr_auto_1fr] mx-auto w-[90%]' : 'flex justify-center gap-2 flex-1'}`}>
                  {!showWeight && !showReps && <div></div>}
                  
                  <div className="flex items-center justify-center gap-2">
                    {activeTimerId !== card.id && (
                      <button 
                        disabled={activeTimerId !== null}
                        onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, duration: Math.max(0, Number(c.duration) - 15) } : c))} 
                        className={`px-2 py-1 text-[10px] font-bold transition-colors ${activeTimerId !== null ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}
                      >
                        -15
                      </button>
                    )}
                    <div className="flex items-center text-white font-bold text-sm gap-0.5">
                      <input 
                        type="number" 
                        value={Math.floor((activeTimerId === card.id ? timerSeconds : card.duration) / 60).toString().padStart(2, '0')}
                        onChange={(e) => activeTimerId !== card.id && setCards(prev => prev.map(c => c.id === card.id ? { ...c, duration: parseInt(e.target.value || 0) * 60 + (c.duration % 60) } : c))}
                        disabled={activeTimerId !== null}
                        className={`w-6 bg-transparent text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId === card.id ? 'text-red-500' : (activeTimerId !== null ? 'text-white/20' : 'text-white/40 focus:text-white transition-colors')}`}
                      />
                      <span className={activeTimerId === card.id ? 'text-red-500' : (activeTimerId !== null ? 'text-zinc-700' : 'text-zinc-500')}>:</span>
                      <input 
                        type="number" 
                        value={((activeTimerId === card.id ? timerSeconds : card.duration) % 60).toString().padStart(2, '0')}
                        onChange={(e) => activeTimerId !== card.id && setCards(prev => prev.map(c => c.id === card.id ? { ...c, duration: Math.floor(c.duration / 60) * 60 + parseInt(e.target.value || 0) } : c))}
                        disabled={activeTimerId !== null}
                        className={`w-6 bg-transparent text-left outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${activeTimerId === card.id ? 'text-red-500' : (activeTimerId !== null ? 'text-white/20' : 'text-white/40 focus:text-white transition-colors')}`}
                      />
                    </div>
                    {activeTimerId !== card.id && (
                      <button 
                        disabled={activeTimerId !== null}
                        onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, duration: Number(c.duration) + 15 } : c))} 
                        className={`px-2 py-1 text-[10px] font-bold transition-colors ${activeTimerId !== null ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}
                      >
                        +15
                      </button>
                    )}
                  </div>
                  
                  <div className={!showWeight && !showReps ? 'flex justify-end' : 'flex items-center'}>
                    {activeTimerId !== card.id ? (
                      <button 
                        onClick={() => handleStartTimer(card.id)}
                        disabled={activeTimerId !== null}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-transparent text-zinc-700 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'}`}
                      >
                        <VscRecord className="w-3 h-3" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleStopTimer}
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white flex items-center justify-center shrink-0 transition-colors"
                      >
                        <FiSquare className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {showWeight && (
                <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-between p-1 px-2">
                  <button onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, weight: Math.max(0, Number(c.weight) - (unit === 'kg' ? 1 : 2.5)) } : c))} className="text-white/50 hover:text-white p-1"><FiMinus className="w-3 h-3" /></button>
                  <input 
                    type="number" 
                    value={card.weight}
                    onChange={(e) => setCards(prev => prev.map(c => c.id === card.id ? { ...c, weight: e.target.value } : c))}
                    className="w-8 bg-transparent text-center font-bold text-white/40 focus:text-white transition-colors outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, weight: Number(c.weight) + (unit === 'kg' ? 1 : 2.5) } : c))} className="text-white/50 hover:text-white p-1"><PlusIcon className="w-3 h-3" /></button>
                </div>
              )}
            </div>
            {cards.length > 1 && (
              <button 
                disabled={activeTimerId !== null}
                onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTimerId !== null ? 'bg-red-500/5 text-red-500/30 cursor-not-allowed' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
              >
                <FiMinus className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <button 
            disabled={activeTimerId !== null}
            onClick={() => setCards(prev => [...prev, { id: Date.now(), reps, weight, duration }])}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            +1&nbsp;serie
          </button>
          <button 
            disabled={activeTimerId !== null}
            onClick={() => setCards(prev => [...prev, { id: Date.now(), reps, weight, duration }, { id: Date.now()+1, reps, weight, duration }])}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-colors ${activeTimerId !== null ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            +2&nbsp;series
          </button>
        </div>
        <button 
          disabled={activeTimerId !== null}
          onClick={handleSave}
          className={`px-5 py-2.5 font-black text-sm rounded-xl transition-all ${activeTimerId !== null ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-karga-orange hover:bg-orange-600 text-white shadow-lg shadow-karga-orange/20 active:scale-95'}`}
        >
          Grabar {cards.length} serie(s)
        </button>
      </div>
    </div>
  );
};
