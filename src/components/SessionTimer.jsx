import { FiPlay, FiX, FiEdit3 } from "react-icons/fi";
import { useSessionStore } from "../stores/sessionStore";
import { useState, useRef, useEffect, useCallback } from "react";
import useCurrentTime from "../hooks/useCurrentTime";
import formatMs from "../lib/formatMs";
import { useLocation, useNavigate } from "react-router";
import ConfirmModal from "./modals/ConfirmModal";
import ManualSessionModal from "./modals/ManualSessionModal";
import SessionNoteModal from "./modals/SessionNoteModal";
import {
  useFinishSession,
  useDiscardSession,
} from "../hooks/mutations/useSesionsMutation";

function SessionTimer({ profile_id }) {
  const {
    start,
    isStarted,
    isPaused,
    startedAt,
    pausedAt,
    totalPausedMs,
    note,
    setNote,
  } = useSessionStore();

  const navigate = useNavigate();
  const now = useCurrentTime();
  const { mutateAsync: finishSession } = useFinishSession(profile_id);
  const { mutateAsync: discardSession } = useDiscardSession();

  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showKeepSetsModal, setShowKeepSetsModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const menuRef = useRef(null);
  // Prevents ConfirmModal's post-confirm onClose from double-running discard
  const keepSetsDecidedRef = useRef(false);

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

  const handleRequestDiscard = () => {
    closeMenu();
    setShowConfirmDiscard(false);
    setShowKeepSetsModal(true);
  };

  const handleDiscardKeepSets = useCallback(async (keepSets) => {
    keepSetsDecidedRef.current = true;
    setShowKeepSetsModal(false);
    try {
      await discardSession({ keepSets });
    } catch (err) {
      console.error("Error discarding session:", err);
    }
  }, [discardSession]);

  const handleFinish = async () => {
    setShowMenu(false);
    setIsClosing(false);
    try {
      await finishSession();
      navigate("/hoy");
    } catch (err) {
      console.error("Error finishing session:", err);
    }
  };

  const isSessionsPage = location.pathname.toLowerCase().includes("/sessions");

  if (!isStarted && !isSessionsPage) return null;

  if (!isStarted) {
    return (
      <>
        <div className="fixed bottom-26.75 z-50 w-full max-w-md mx-auto left-0 right-0 flex justify-end px-4 pointer-events-none">
          <div className="relative pointer-events-auto" ref={menuRef}>
            {(showMenu || isClosing) && (
              <div
                className={`absolute bottom-full right-0 mb-4 bg-[#2A2424] py-3 px-4 rounded-2xl flex flex-col gap-3 min-w-48 border border-white/5 shadow-2xl text-left ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
              >
                <button
                  className="text-white text-sm font-bold text-left hover:text-karga-orange transition-colors"
                  onClick={() => {
                    start();
                    setShowMenu(false);
                    setIsClosing(false);
                  }}
                >
                  Empezar sesión
                </button>
                <div className="h-px bg-white/5 w-full" />
                <button
                  className="text-white text-sm font-bold text-left hover:text-karga-orange transition-colors"
                  onClick={() => {
                    closeMenu();
                    setShowManualModal(true);
                  }}
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
      <div className="fixed bottom-22.5 left-0 right-0 bg-[#2A2424] border-t border-white/5 text-white py-3 px-6 z-40 shadow-lg animate-slide-in-up">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-karga-orange animate-pulse" />
            <span className="font-bold text-sm text-zinc-300 tracking-wide">
              Sesión activa:{" "}
              <span className="text-white tabular-nums ml-1">
                {formatMs(elapsedMs, true)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNoteModal(true)}
              className={`w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors ${note ? "text-karga-orange border-karga-orange/30" : "text-zinc-300"}`}
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
                <div
                  className={`absolute bottom-full right-0 mb-4 bg-[#2A2424] py-3 px-4 rounded-2xl flex flex-col gap-3 min-w-48 border border-white/5 shadow-2xl text-left ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
                >
                  <button
                    onClick={handleFinish}
                    className="text-white text-sm font-bold text-left hover:text-karga-orange transition-colors"
                  >
                    Finalizar sesión
                  </button>
                  <div className="h-px bg-white/5 w-full" />
                  <button
                    onClick={() => {
                      closeMenu();
                      setShowConfirmDiscard(true);
                    }}
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
        description="Se descartará esta sesión del historial. A continuación podrás elegir si conservar los sets registrados."
        confirmText="Continuar"
        cancelText="Cancelar"
        danger={true}
        onConfirm={handleRequestDiscard}
        onClose={() => setShowConfirmDiscard(false)}
      />

      <ConfirmModal
        isOpen={showKeepSetsModal}
        title="¿Conservar los sets registrados?"
        description="Si eliges No, se eliminarán todos los sets de esta sesión. Si eliges Sí, los sets se mantienen y se sincronizarán."
        confirmText="Sí, conservar"
        cancelText="No, eliminar"
        danger={false}
        onConfirm={() => handleDiscardKeepSets(true)}
        onClose={() => {
          // cancel / backdrop → delete sets; ignore the onClose that follows confirm
          if (keepSetsDecidedRef.current) {
            keepSetsDecidedRef.current = false;
            return;
          }
          handleDiscardKeepSets(false);
        }}
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
