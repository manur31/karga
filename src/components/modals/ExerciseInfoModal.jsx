import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft } from '../icons';

export default function ExerciseInfoModal({ exercise, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  if (!exercise) return null;

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return createPortal(
    <div 
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-70 p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleCloseWithAnimation(); }}
    >
      <div 
        className={`bg-dark-bg w-full max-w-md max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-input-bg border-b border-white/5 shrink-0 z-20">
          <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-black text-white tracking-tight flex-1 text-center pr-9 truncate">
            {exercise.name}
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-6 scrollbar-none [&::-webkit-scrollbar]:none z-10">
          
          {/* GIF PLACEHOLDER */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Demostración</h3>
            <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Descripción</h3>
            <div className="bg-input-bg p-5 rounded-3xl flex flex-col gap-3 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {exercise.description ? (
                <p>{exercise.description}</p>
              ) : (
                <p className="text-zinc-500 italic text-center py-2">No hay descripción disponible para este ejercicio.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
