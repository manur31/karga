import { useState, useEffect } from "react";
import { FiEdit2, FiCheck, FiMinus } from "react-icons/fi";
import { PlusIcon } from "../icons";
import { useSetsStore } from "../../stores/setsStore";
import { useWeightUnit } from "../../hooks/useWeightUnit";
import { useAuth } from '../../hooks/queries/useAuth';
import { useRestStore } from '../../stores/restStore';
import SetModal from "./SetModal";

const SuperSetExpander = ({ exercise, onSaveDone }) => {
  const { unit } = useWeightUnit();
  const { addSet, removeSet, getLastSetForExercise } = useSetsStore();
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  
  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  const { startRest, deleteRest } = useRestStore();
  const restTime = user?.rest_time ?? 60;
  
  useEffect(() => {
    const lastSet = getLastSetForExercise(exercise.id);
    if (lastSet) {
      setCards([{
        id: Date.now(),
        reps: lastSet.rep || 0,
        weight: unit === 'kg' ? lastSet.weight : Number((lastSet.weight * 2.20462).toFixed(2)),
        completed: false
      }]);
    } else {
      setCards([{ id: Date.now(), reps: 0, weight: 0, completed: false }]);
    }
  }, [exercise, unit, getLastSetForExercise]);

  const handleCompleteCard = (card) => {
    if (!card.completed) {
      // Completing the set
      const newSavedSetId = crypto.randomUUID();
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, completed: true, savedSetId: newSavedSetId } : c));
      
      const cardWeightKg = unit === 'kg' ? Number(card.weight) : Number((Number(card.weight) / 2.20462).toFixed(2));
      addSet({
        id: newSavedSetId,
        profile_id: profile_id || 'mock_profile',
        exercise_id: exercise.id,
        rep: Number(card.reps || 0),
        weight: Number(cardWeightKg.toFixed(2))
      });
      
      startRest(restTime);
    } else {
      // Undoing the completion
      if (card.savedSetId) {
        removeSet(card.savedSetId);
        deleteRest();
      }
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, completed: false, savedSetId: null } : c));
    }
  };

  return (
    <div className="w-full bg-[#1A1616] rounded-xl mt-2 p-4 flex flex-col gap-3 animate-fade-in origin-top border border-[#2A2424]">
      
      {/* Cards List */}
      <div className="flex flex-col gap-2">
        {cards.map((card, idx) => (
          <div 
            key={card.id} 
            className={`rounded-xl p-3 flex items-center gap-3 transition-colors ${card.completed ? 'bg-green-900/30 border border-green-500/50' : 'bg-[#2A2424] border border-transparent'}`}
          >
            <button 
              onClick={() => handleCompleteCard(card)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${card.completed ? 'bg-green-500 border-green-500' : 'border-zinc-500 hover:border-karga-orange'}`}
            >
              {card.completed && <FiCheck className="w-4 h-4 text-white" />}
            </button>
            
            <div className="flex-1 flex items-center">
              <span className={`text-sm font-bold ${card.completed ? 'text-green-500' : 'text-white'}`}>
                {idx + 1}° serie: {card.reps} reps · {card.weight} {unit}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 transition-opacity ${card.completed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button 
                onClick={() => setEditingCard(card)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-karga-orange hover:bg-white/10 shrink-0"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              {cards.length > 1 && (
                <button 
                  onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
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
            const lastCard = cards.length > 0 ? cards[cards.length - 1] : { reps: 0, weight: 0 };
            setCards(prev => [...prev, { id: Date.now(), reps: lastCard.reps, weight: lastCard.weight, completed: false }]);
          }}
          className="w-full py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Agregar otra serie
        </button>
      </div>

      {editingCard && (
        <SetModal
          exercise={{...exercise}}
          onClose={() => setEditingCard(null)}
          onSaveOverride={(data) => {
            setCards(prev => prev.map(c => 
              c.id === editingCard.id 
                ? { ...c, reps: data.rep, weight: unit === 'kg' ? data.weight : Number((data.weight * 2.20462).toFixed(2)) } 
                : c
            ));
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
};
export default SuperSetExpander;
