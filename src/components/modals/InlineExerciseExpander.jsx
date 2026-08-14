import { useEffect, useState } from 'react';
import { FiMinus } from 'react-icons/fi';
import { PlusIcon } from '../icons';
import { useWeightUnit } from '../../hooks/useWeightUnit';
import { useRestStore } from '../../stores/restStore';
import { useCreateSet } from '../../hooks/mutations/useSetsMutations';
import { getCachedProfile } from '../../storage/profile-storage';
import { getLastSetForExercise } from '../../lib/local/setsHelpers';

export default function InlineExerciseExpander({
  exercise,
  onSaveDone,
  rest_time,
}) {
  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;
  const restSeconds = Number(rest_time) || Number(profile.rest_time) || 60;

  const { unit, toggleUnit, convertToKg } = useWeightUnit();
  const { startRest } = useRestStore();
  const { mutateAsync: createSet } = useCreateSet(profile_id);

  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [cards, setCards] = useState([{ id: 1, reps: 0, weight: 0 }]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLast = async () => {
      if (!exercise?.id) return;
      const lastSet = await getLastSetForExercise(exercise.id, profile_id);
      if (cancelled || !lastSet) return;

      const displayWeight =
        unit === 'kg'
          ? lastSet.weight
          : Number((lastSet.weight * 2.20462).toFixed(2));

      setReps(lastSet.rep || 0);
      setWeight(displayWeight || 0);
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          reps: lastSet.rep || 0,
          weight: displayWeight || 0,
        })),
      );
    };

    loadLast();
    return () => {
      cancelled = true;
    };
  }, [exercise?.id, profile_id, unit]);

  useEffect(() => {
    setCards((prev) => prev.map((c) => ({ ...c, reps, weight })));
  }, [reps, weight]);

  const handleToggleUnit = () => {
    if (unit === 'kg') {
      setWeight((prev) => Number((Number(prev) * 2.20462).toFixed(2)));
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          weight: Number((Number(c.weight) * 2.20462).toFixed(2)),
        })),
      );
    } else {
      setWeight((prev) => Number((Number(prev) / 2.20462).toFixed(2)));
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          weight: Number((Number(c.weight) / 2.20462).toFixed(2)),
        })),
      );
    }
    toggleUnit();
  };

  const handleSave = async () => {
    if (!profile_id || isSaving) return;
    setIsSaving(true);

    try {
      const createdAt = new Date().toISOString();
      let lastWeightKg = 0;
      let lastReps = 0;

      for (const card of cards) {
        const weightKg = convertToKg(card.weight);
        const repsValue = Number(card.reps || 0);
        lastWeightKg = Number(weightKg.toFixed(2));
        lastReps = repsValue;

        await createSet({
          profile_id,
          exercise_id: exercise.id,
          rep: repsValue,
          weight: lastWeightKg,
          created_at: createdAt,
        });
      }

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

  const weightStep = unit === 'kg' ? 1 : 2.5;

  return (
    <div className="w-full bg-[#1A1616] rounded-xl mt-2 p-4 flex flex-col gap-4 animate-fade-in origin-top">
      <div className="flex gap-2 items-center bg-white/5 p-3 rounded-xl">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 mb-1">
            REPS GLOBALES
          </span>
          <div className="flex items-center gap-1 w-full justify-between px-1">
            <button
              onClick={() => setReps((r) => Math.max(0, Number(r) - 1))}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-10 bg-transparent text-center font-black text-white text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setReps((r) => Number(r) + 1)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10 mx-1"></div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 mb-1">
            PESO GLOBAL
          </span>
          <div className="flex items-center gap-1 w-full justify-between px-1">
            <button
              onClick={() =>
                setWeight((w) => Math.max(0, Number(w) - weightStep))
              }
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"
            >
              <FiMinus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-10 bg-transparent text-center font-black text-white text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setWeight((w) => Number(w) + weightStep)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
        <button
          onClick={handleToggleUnit}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white uppercase ml-1 shrink-0"
        >
          {unit}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className="bg-[#2A2424] rounded-xl p-3 flex items-center gap-2 animate-fade-in"
            style={{ animationDelay: `${idx * 120}ms`, animationFillMode: 'both' }}
          >
            <span className="text-zinc-500 font-black text-sm w-4 shrink-0">
              {idx + 1}°
            </span>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-between p-1 px-2">
                <button
                  onClick={() =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === card.id
                          ? { ...c, reps: Math.max(0, Number(c.reps) - 1) }
                          : c,
                      ),
                    )
                  }
                  className="text-white/50 hover:text-white p-1"
                >
                  <FiMinus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={card.reps}
                  onChange={(e) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === card.id ? { ...c, reps: e.target.value } : c,
                      ),
                    )
                  }
                  className="w-8 bg-transparent text-center font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === card.id
                          ? { ...c, reps: Number(c.reps) + 1 }
                          : c,
                      ),
                    )
                  }
                  className="text-white/50 hover:text-white p-1"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-between p-1 px-2">
                <button
                  onClick={() =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === card.id
                          ? {
                              ...c,
                              weight: Math.max(0, Number(c.weight) - weightStep),
                            }
                          : c,
                      ),
                    )
                  }
                  className="text-white/50 hover:text-white p-1"
                >
                  <FiMinus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={card.weight}
                  onChange={(e) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === card.id
                          ? { ...c, weight: e.target.value }
                          : c,
                      ),
                    )
                  }
                  className="w-8 bg-transparent text-center font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === card.id
                          ? { ...c, weight: Number(c.weight) + weightStep }
                          : c,
                      ),
                    )
                  }
                  className="text-white/50 hover:text-white p-1"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
            {cards.length > 1 && (
              <button
                onClick={() =>
                  setCards((prev) => prev.filter((c) => c.id !== card.id))
                }
                className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 shrink-0"
              >
                <FiMinus className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCards((prev) => [...prev, { id: Date.now(), reps, weight }])
            }
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs"
          >
            +1&nbsp;serie
          </button>
          <button
            onClick={() =>
              setCards((prev) => [
                ...prev,
                { id: Date.now(), reps, weight },
                { id: Date.now() + 1, reps, weight },
              ])
            }
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs"
          >
            +2&nbsp;series
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !profile_id}
          className="px-5 py-2.5 bg-karga-orange hover:bg-orange-600 disabled:bg-karga-orange/50 text-white font-black text-sm rounded-xl shadow-lg shadow-karga-orange/20 active:scale-95 transition-all"
        >
          {isSaving ? 'Guardando…' : `Grabar ${cards.length} serie(s)`}
        </button>
      </div>
    </div>
  );
}
