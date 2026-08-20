import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function DiscardSessionModal({
  isOpen,
  onClose,
  onConfirmDiscardAll,
  onConfirmKeepSets,
  hasSets,
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleDiscardAll = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirmDiscardAll();
    }, 300);
  };

  const handleKeepSets = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirmKeepSets();
    }, 300);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-dark-bg border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col gap-5 ${
          isClosing ? "animate-fade-out" : "animate-scale-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            ¿Descartar sesión?
          </h3>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed">
            {hasSets
              ? "Se descartará esta sesión del historial. ¿Qué deseas hacer con los sets registrados durante la misma?"
              : "Se descartará esta sesión. Esta acción no se puede deshacer."}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {hasSets ? (
            <>
              <button
                onClick={handleKeepSets}
                className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-colors active:scale-[0.98]"
              >
                Sí, pero sincronizar sets
              </button>
              <button
                onClick={handleDiscardAll}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                Sí, y eliminar sets
              </button>
            </>
          ) : (
            <button
              onClick={handleDiscardAll}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98]"
            >
              Descartar
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-full py-3.5 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-bold rounded-2xl transition-colors active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
