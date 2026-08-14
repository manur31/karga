import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPlay } from 'react-icons/fi';
import Mancuerna from '../icons/Mancuerna';

export default function StartWorkoutModal({
  isOpen,
  onClose,
  routines = [],
  onSelectRoutine,
  onStartFree,
}) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex flex-col justify-end pointer-events-auto">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full sm:max-w-md sm:mx-auto bg-[#1A1616] rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}
      >
        <div
          className="w-full flex justify-center py-4 shrink-0 cursor-pointer"
          onClick={handleClose}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 z-20"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="px-6 pb-6 flex flex-col flex-1 overflow-hidden">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Empezar entrenamiento
          </h2>
          <p className="text-sm font-medium text-zinc-400 mb-6">
            ¿Qué vas a entrenar hoy?
          </p>

          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-6">
            <button
              onClick={() => {
                onStartFree?.();
                handleClose();
              }}
              className="w-full bg-karga-orange/10 hover:bg-karga-orange/20 border border-karga-orange/30 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-karga-orange flex items-center justify-center shrink-0 shadow-lg shadow-karga-orange/30">
                <FiPlay className="w-6 h-6 text-white ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[16px]">
                  Entrenamiento Libre
                </span>
                <span className="text-zinc-400 text-xs font-medium">
                  Grabar sets sin seguir una rutina
                </span>
              </div>
            </button>

            <div className="h-px w-full bg-white/5 my-4" />

            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
              Tus rutinas
            </h3>

            {(routines || []).map((routine) => (
              <button
                key={routine.routine_id || routine.id}
                onClick={() => {
                  onSelectRoutine?.(routine.routine_id || routine.id);
                  handleClose();
                }}
                className="w-full bg-[#2A2424] hover:bg-[#332C2C] border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Mancuerna className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-white font-bold text-[16px] truncate">
                    {routine.name}
                  </span>
                  <span className="text-zinc-400 text-xs font-medium truncate">
                    {routine.description || 'Sin descripción'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
