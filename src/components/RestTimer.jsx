import formatMs from '../lib/formatMs';
import { useRestStore } from '../stores/restStore';
import { FiX } from 'react-icons/fi';
import { useEffect } from 'react';
import useCurrentTime from '../hooks/useCurrentTime';

function RestTimer() {
    const { endAt, isRunning, _pausedMs, deleteRest, completeRest } = useRestStore();
    const now = useCurrentTime();

    // ─── Cálculo del remaining basado en timestamps ────────────
    // Si está corriendo: remaining = endAt - now
    // Si está pausado: remaining = _pausedMs (valor almacenado)
    // Si no hay timer: remaining = 0
    const remainingMs = isRunning && endAt
      ? Math.max(0, endAt - now)
      : _pausedMs || 0;

    // Detectar expiración del timer y limpiar el store
    useEffect(() => {
      if (isRunning && endAt && remainingMs <= 0) {
        completeRest();
      }
    }, [isRunning, endAt, remainingMs, completeRest]);

    // No mostrar nada si no hay timer activo ni pausado
    if (!isRunning && !_pausedMs) return null;

    const isWarning = remainingMs > 0 && remainingMs <= 10000;
    const isFinished = remainingMs <= 0;
    
    const timeString = `${isFinished ? '-' : ''}${formatMs(remainingMs)}`;

    let textColor = "text-white";
    let dotColor = "bg-green-500";
    let containerClasses = "bg-[#2A2424] border-white/10";

    if (isWarning) {
      textColor = "text-yellow-400";
      dotColor = "bg-yellow-400";
      containerClasses = "bg-[#332C24] border-yellow-400/30 animate-pulse";
    } else if (isFinished) {
      textColor = "text-red-500";
      dotColor = "bg-red-500";
      containerClasses = "bg-[#332424] border-red-500/30 shadow-red-500/20";
    }

    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in-down pointer-events-none">
        <div className={`flex items-center gap-4 px-5 py-2.5 rounded-full shadow-2xl border pointer-events-auto transition-colors duration-300 ${containerClasses}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${!isFinished && 'animate-pulse'}`} />
            <span className="text-xs font-bold text-zinc-400 tracking-wide uppercase">Descanso</span>
            <span className={`tabular-nums font-black text-lg tracking-tight ${textColor}`}>
              {timeString}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button 
            onClick={deleteRest}
            className="flex items-center justify-center p-1 -mr-2 text-zinc-400 hover:text-white rounded-full transition-colors active:scale-95"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
}

export default RestTimer
