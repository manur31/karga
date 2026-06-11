import React, { useState } from 'react';
import { useSesionStore } from '../stores/sesionStore';
import { useAuth } from '../hooks/queries/useAuth';
import { useCreateSession } from '../hooks/mutations/useSesionsMutation';
import { FiPlay, FiPause, FiX, FiTrash2, FiCheck, FiPlusCircle } from 'react-icons/fi';
import Mancuerna from './icons/Mancuerna';
import { useNavigate } from 'react-router';
import ConfirmModal from './modals/ConfirmModal';

export default function GlobalSessionBar() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  const { mutateAsync: createSession } = useCreateSession(profile_id);

  const {
    start,
    pause,
    discard,
    finish,
    seconds,
    continue: continueTimer,
    isStarted,
    timer,
  } = useSesionStore();

  const [showActiveMenu, setShowActiveMenu] = useState(false);
  const [showInactiveMenu, setShowInactiveMenu] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  const isTimerRunning = timer !== null;

  const fmtTime = (seconds) => {
    const hour = Math.floor(seconds / 3600);
    const minute = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    if (hour > 0) {
      return `${hour}:${String(minute).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    return `${minute}:${String(sec).padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isTimerRunning) {
      pause();
    } else {
      continueTimer();
    }
  };

  const handleStartNow = () => {
    start();
    setShowInactiveMenu(false);
  };

  const handleDiscard = () => {
    setShowConfirmDiscard(true);
    setShowActiveMenu(false);
  };

  const confirmDiscard = () => {
    discard();
  };

  const handleFinish = async () => {
    const { startedAt } = useSesionStore.getState();
    const finishedAt = new Date();
    
    finish();
    setShowActiveMenu(false);

    // Si startedAt viene de localStorage (hidratado por Zustand), será un string. 
    // Asegurémonos de que sea un objeto Date.
    const validStartedAt = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;

    if (profile_id && validStartedAt) {
      await createSession({
        startedAt: validStartedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        note: "",
      });
    }
  };

  if (!isStarted) {
    return (
      <div className="fixed bottom-[105px] left-0 right-0 z-30 flex justify-center px-4 mb-2 pointer-events-none">
        <div className="w-full max-w-md flex flex-col items-end relative">
          
          {/* INACTIVE MENU POPUP */}
          {showInactiveMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-800 border border-white/5 rounded-2xl p-2 shadow-2xl pointer-events-auto animate-fade-in origin-bottom-right">
              <button onClick={handleStartNow} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-white font-medium text-sm">
                <span>Iniciar ahora</span>
                <FiPlay className="text-karga-orange" />
              </button>
              <button onClick={() => setShowInactiveMenu(false)} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-white font-medium text-sm">
                <span>Entrada manual</span>
                <FiPlusCircle className="text-zinc-400" />
              </button>
            </div>
          )}

          <div className="w-full flex justify-end pointer-events-auto pb-2 pr-2">
            <button 
              onClick={() => setShowInactiveMenu(!showInactiveMenu)}
              className={`font-black text-sm transition-all duration-300 px-4 py-2 rounded-xl border ${
                showInactiveMenu 
                  ? 'text-karga-orange bg-black/90 border-karga-orange/30 shadow-[0_0_15px_rgba(255,77,0,0.4)]' 
                  : 'text-karga-orange/60 bg-black/40 border-white/5 backdrop-blur-md hover:text-karga-orange/80'
              }`}
            >
              Nueva Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-[85px] left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md relative pointer-events-auto">
        
        {/* ACTIVE MENU POPUP */}
        {showActiveMenu && (
          <div className="absolute bottom-full right-4 mb-2 w-56 bg-zinc-800 border border-white/5 rounded-2xl p-2 shadow-2xl animate-fade-in origin-bottom-right">
            <button onClick={handleFinish} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-white font-medium text-sm">
              <span>Finalizar</span>
              <FiCheck className="text-zinc-400" />
            </button>
            <button onClick={handleDiscard} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-red-500 font-medium text-sm">
              <span>Descartar Sesión</span>
              <FiTrash2 />
            </button>
          </div>
        )}

        <div className="bg-zinc-900/90 backdrop-blur-md border-t border-white/5 px-6 py-3 flex items-center justify-between shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
          <div className="flex items-center">
            <span className="text-white font-bold text-3xl tabular-nums tracking-wide">{fmtTime(seconds)}</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handlePlayPause} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-white">
              {isTimerRunning ? <FiPause className="w-6 h-6 fill-current" /> : <FiPlay className="w-6 h-6 fill-current" />}
            </button>
            <button onClick={() => setShowActiveMenu(!showActiveMenu)} className="w-10 h-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-zinc-400 hover:text-white">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal 
        isOpen={showConfirmDiscard}
        onClose={() => setShowConfirmDiscard(false)}
        onConfirm={confirmDiscard}
        title="Descartar sesión"
        description="¿Estás seguro de que quieres descartar la sesión actual? Se perderá todo el progreso."
        confirmText="Descartar"
        cancelText="Cancelar"
        danger={true}
      />
    </>
  );
}
