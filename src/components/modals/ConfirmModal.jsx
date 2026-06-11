import React, { useEffect, useState } from 'react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  description, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onClose, 
  danger = false 
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-[#2A2424] w-full max-w-sm rounded-3xl p-6 flex flex-col shadow-2xl border border-white/5 ${isClosing ? 'animate-fade-out' : 'animate-slide-in-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black text-white mb-2">{title}</h2>
        {description && (
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
            {description}
          </p>
        )}
        
        <div className="flex gap-3 mt-auto">
          <button 
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors shadow-lg ${
              danger 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-karga-orange hover:bg-orange-600 shadow-karga-orange/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
