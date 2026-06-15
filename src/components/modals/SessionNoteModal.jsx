import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SessionNoteModal({ isOpen, onClose, initialNote, onSave }) {
  const [localNote, setLocalNote] = useState(initialNote || '');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalNote(initialNote || '');
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleSave = () => {
    onSave(localNote);
    handleClose();
  };

  return createPortal(
    <div 
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-[#2A2424] w-full max-w-sm rounded-3xl flex flex-col shadow-2xl overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20">
          <h2 className="text-lg font-bold text-white tracking-wide">Añadir una nota</h2>
          <button 
            onClick={handleSave}
            className="text-karga-orange font-bold text-sm px-3 py-1.5 bg-karga-orange/10 hover:bg-karga-orange/20 rounded-xl transition-colors"
          >
            Guardar
          </button>
        </div>

        <div className="p-5 flex flex-col">
          <textarea
            autoFocus
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Empieza a escribir tu nota. Por ejemplo: Hoy me sentí con mucha energía..."
            className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-500 outline-none focus:border-karga-orange/50 transition-colors resize-none text-sm"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
