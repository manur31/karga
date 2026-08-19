import { useEffect, useState } from 'react';
import { FiEdit2, FiCheck, FiMinus } from 'react-icons/fi';
import { PlusIcon } from '../icons';
import { useWeightUnit } from '../../hooks/useWeightUnit';
import { useRestStore } from '../../stores/restStore';
import { useCreateSet, useDeleteSet } from '../../hooks/mutations/useSetsMutations';
import { getCachedProfile } from '../../storage/profile-storage';
import { getLastSetForExercise } from '../../lib/local/setsHelpers';
import SetModal from './SetModal';

const SuperSetExpander = ({ exercise, onSaveDone, rest_time }) => {
  const { unit, convertToKg } = useWeightUnit();
  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;
  const restSeconds = Number(rest_time) || Number(profile.rest_time) || 60;

  const trackingType = exercise?.tracking_type || exercise?.trackingType || 'weight_reps';
  const showWeight = trackingType === 'weight_reps' || trackingType === 'weight_time';
  const showReps = trackingType === 'weight_reps';
  const showTime = trackingType === 'time' || trackingType === 'weight_time';

  const [cards, setCards] = useState([{ id: Date.now(), reps: 0, weight: 0, duration: 0, completed: false }]);
  const [editingCard, setEditingCard] = useState(null);
  const [isWorking, setIsWorking] = useState(false);

  const { startRest, deleteRest } = useRestStore();
  const { mutateAsync: createSet } = useCreateSet(profile_id);
  const { mutateAsync: deleteSet } = useDeleteSet();

  const formatDuration = (seconds) => {
    const s = Number(seconds || 0);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let cancelled = false;

    const loadLast = async () => {
      if (!exercise?.id) return;
      const lastSet = await getLastSetForExercise(exercise.id, profile_id);
      if (cancelled) return;

      if (lastSet) {
        setCards([
          {
            id: Date.now(),
            reps: lastSet.rep || 0,
            weight:
              unit === 'kg'
                ? lastSet.weight
                : Number((lastSet.weight * 2.20462).toFixed(2)),
            duration: lastSet.duration || 0,
            completed: false,
          },
        ]);
      } else {
        setCards([{ id: Date.now(), reps: 0, weight: 0, duration: 0, completed: false }]);
      }
    };

    loadLast();
    return () => {
      cancelled = true;
    };
  }, [exercise?.id, profile_id, unit]);

  const handleCompleteCard = async (card) => {
    if (isWorking || !profile_id) return;
    setIsWorking(true);

    try {
      if (!card.completed) {
        const weightKg = convertToKg(card.weight);
        const repsValue = Number(card.reps || 0);
        const durationValue = Number(card.duration || 0);
        const createdAt = new Date().toISOString();

        const ids = await createSet({
          profile_id,
          exercise_id: exercise.id,
          rep: showReps ? repsValue : 0,
          weight: showWeight ? Number(weightKg.toFixed(2)) : 0,
          duration: showTime ? durationValue : 0,
          created_at: createdAt,
        });
        const savedSetId = Array.isArray(ids) ? ids[0] : ids;

        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? { ...c, completed: true, savedSetId } : c,
          ),
        );

        startRest({
          seconds: restSeconds,
          lastSet: {
            exerciseName: exercise.name,
            weightKg: Number(weightKg.toFixed(2)),
            reps: repsValue,
          },
        });
      } else {
        if (card.savedSetId) {
          await deleteSet(card.savedSetId);
          deleteRest();
        }
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id
              ? { ...c, completed: false, savedSetId: null }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error('Error al completar serie:', error);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="w-full bg-[#1A1616] h-fit rounded-xl  p-4 flex flex-col gap-3 animate-fade-in origin-top border border-[#2A2424]">
      <div className="flex flex-col gap-2">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`rounded-xl p-3 flex items-center gap-3 transition-colors ${
              card.completed
                ? 'bg-green-900/30 border border-green-500/50'
                : 'bg-[#2A2424] border border-transparent'
            }`}
          >
            <button
              onClick={() => handleCompleteCard(card)}
              disabled={isWorking}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                card.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-zinc-500 hover:border-karga-orange'
              }`}
            >
              {card.completed && <FiCheck className="w-4 h-4 text-white" />}
            </button>

            <div className="flex-1 flex items-center">
              <span
                className={`text-sm font-bold ${
                  card.completed ? 'text-green-500' : 'text-white'
                }`}
              >
                {idx + 1}° serie:
                {showReps ? ` ${card.reps} reps` : ''}
                {showWeight ? ` · ${card.weight} ${unit}` : ''}
                {showTime ? ` · ${formatDuration(card.duration)}` : ''}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 transition-opacity ${
                card.completed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <button
                onClick={() => setEditingCard(card)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-karga-orange hover:bg-white/10 shrink-0"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              {cards.length > 1 && (
                <button
                  onClick={() =>
                    setCards((prev) => prev.filter((c) => c.id !== card.id))
                  }
                  className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 shrink-0"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={() => {
            const lastCard =
              cards.length > 0 ? cards[cards.length - 1] : { reps: 0, weight: 0, duration: 0 };
            setCards((prev) => [
              ...prev,
              {
                id: Date.now(),
                reps: lastCard.reps,
                weight: lastCard.weight,
                duration: lastCard.duration || 0,
                completed: false,
              },
            ]);
          }}
          className="w-full py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Agregar otra serie
        </button>
      </div>

        {editingCard && (
          <SetModal
            exercise={{ ...exercise }}
            rest_time={restSeconds}
            onClose={() => setEditingCard(null)}
            onSaveOverride={(data) => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === editingCard.id
                    ? {
                        ...c,
                        reps: data.rep,
                        weight:
                          unit === 'kg'
                            ? data.weight
                            : Number((data.weight * 2.20462).toFixed(2)),
                        duration: data.duration ?? 0,
                      }
                    : c,
                ),
              );
              setEditingCard(null);
            }}
          />
        )}
    </div>
  );
};

export default SuperSetExpander;
