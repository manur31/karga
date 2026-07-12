import { FiPlay, FiX, FiEdit3 } from "react-icons/fi";
import { useSessionStore } from "../stores/sessionStore";
import { useState, useRef, useEffect } from "react";
import useCurrentTime from "../hooks/useCurrentTime";
import formatMs from "../lib/formatMs";
import { useSyncSessions, useSyncSets } from "../hooks/useSync";
import { useLocation } from "react-router";
import ConfirmModal from "./modals/ConfirmModal";
import ManualSessionModal from "./modals/ManualSessionModal";
import SessionNoteModal from "./modals/SessionNoteModal";

function SessionTimer({profile_id}) {
  const {
    start,
    discard,
    finish,
    isStarted,
    isPaused,
    startedAt,
    pausedAt,
    totalPausedMs,
    note,
    setNote
  } = useSessionStore();

  // Tick cada segundo para reactividad — Date.now() actualizado
  const now = useCurrentTime();

  const { sync: syncSessions } = useSyncSessions(profile_id);
  const { sync: syncSets } = useSyncSets(profile_id);

  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  const menuRef = useRef(null);

  // ─── Cálculo del elapsed basado en timestamps ───────────────
  // Si está pausada: el tiempo se congela en pausedAt
  // Si está corriendo: se calcula contra now
  const elapsedMs = isPaused
    ? pausedAt - startedAt - totalPausedMs
    : now - startedAt - totalPausedMs;

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setIsClosing(false);
    }, 200);
  };

  const toggleMenu = () => {
    if (showMenu && !isClosing) {
      closeMenu();
    } else if (!showMenu) {
      setShowMenu(true);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (showMenu && !isClosing) {
          closeMenu();
        }
      }
    }
    
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, isClosing]);

  const handleDiscard = () => {
    discard();
    setShowMenu(false);
    setIsClosing(false);
    setShowConfirmDiscard(false);
  };

  const handleFinish = () => {
    finish(profile_id);
    setShowMenu(false);
    setIsClosing(false);
    syncSessions(profile_id);
    syncSets(profile_id);
  };

  const isSessionsPage = location.pathname.toLowerCase().includes('/sessions');

  if (!isStarted && !isSessionsPage) return null;

  if (!isStarted) {
    return (
      <>
        <div className="fixed bottom-[107px] z-40 w-full max-w-md mx-auto left-0 right-0 flex justify-end px-4 pointer-events-none">
        <div className="relative pointer-events-auto" ref={menuRef}>
            {(showMenu || isClosing) && (
              <div className={`absolute bottom-full right-0 mb-4 bg-[#2A2424] py-3 px-4 rounded-2xl flex flex-col gap-3 min-w-48 border border-white/5 shadow-2xl text-left ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <button 
                  className="text-white text-sm font-bold text-left hover:text-karga-orange transition-colors"
                  onClick={() => { start(); setShowMenu(false); setIsClosing(false); }}
                >
                  Empezar sesión
                </button>
                <div className="h-px bg-white/5 w-full" />
                <button 
                  className="text-white text-sm font-bold text-left hover:text-karga-orange transition-colors"
                  onClick={() => { closeMenu(); setShowManualModal(true); }}
                >
                  Entrada manual
                </button>
              </div>
            )}
            <button 
              onClick={toggleMenu} 
              className="w-14 h-14 bg-karga-orange hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-karga-orange/20 transition-all active:scale-95"
            >
              <FiPlay className="w-6 h-6 text-white ml-1" />
            </button>
          </div>
        </div>

        {showManualModal && (
          <ManualSessionModal onClose={() => setShowManualModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-[90px] left-0 right-0 bg-[#2A2424] border-t border-white/5 text-white py-3 px-6 z-40 shadow-lg animate-slide-in-up">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-karga-orange animate-pulse" />
            <span className="font-bold text-sm text-zinc-300 tracking-wide">
              Sesión activa: <span className="text-white tabular-nums ml-1">{formatMs(elapsedMs, true)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowNoteModal(true)} 
              className={`w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors ${note ? 'text-karga-orange border-karga-orange/30' : 'text-zinc-300'}`}
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <div className="relative" ref={menuRef}>
              <button 
                onClick={toggleMenu} 
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5 text-zinc-300" />
              </button>
              
              {(showMenu || isClosing) && (
              <div className={`absolute bottom-full right-0 mb-4 bg-[#2A2424] py-3 px-4 rounded-2xl flex flex-col gap-3 min-w-48 border border-white/5 shadow-2xl text-left ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <button 
                  onClick={handleFinish} 
                  className="text-white text-sm font-bold text-left hover:text-karga-orange transition-colors"
                >
                  Finalizar sesión
                </button>
                <div className="h-px bg-white/5 w-full" />
                <button 
                  onClick={() => { closeMenu(); setShowConfirmDiscard(true); }} 
                  className="text-red-500 text-sm font-bold text-left hover:text-red-400 transition-colors"
                >
                  Descartar sesión
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmDiscard}
        title="¿Descartar sesión?"
        description="Se perderá el progreso actual de esta sesión y no se guardará en tu historial."
        confirmText="Descartar"
        cancelText="Cancelar"
        danger={true}
        onConfirm={handleDiscard}
        onClose={() => setShowConfirmDiscard(false)}
      />

      {showManualModal && (
        <ManualSessionModal onClose={() => setShowManualModal(false)} />
      )}

      {showNoteModal && (
        <SessionNoteModal 
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          initialNote={note}
          onSave={setNote}
        />
      )}
    </>
  );
}

export default SessionTimer;
