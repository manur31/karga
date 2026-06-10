import { useState } from 'react';
import { ArrowLeft } from '../../icons';

export default function ExerciseInfoModal({ exercise, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  if (!exercise) return null;

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="fixed top-0 bottom-[76px] left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex flex-col overflow-hidden pointer-events-none">
      
      <div className={`w-full h-full flex flex-col relative bg-[var(--color-dark-bg)] pointer-events-auto ${
        isClosing ? 'animate-slide-out-custom' : 'animate-slide-in-custom'
      }`}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 bg-[var(--color-input-bg)] shrink-0 z-20">
          <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-black text-white tracking-tight flex-1 text-center pr-9 truncate">
            {exercise.name}
          </span>
        </div>

        {/* CONTENT SKELETON */}
        <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:none z-10">
          
          {/* GIF PLACEHOLDER */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Demostración</h3>
            <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
            </div>
          </div>

          {/* DESCRIPTION PLACEHOLDER */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Descripción</h3>
            <div className="bg-[var(--color-input-bg)] p-5 rounded-3xl flex flex-col gap-3">
              <div className="w-full h-3 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-[90%] h-3 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-[95%] h-3 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-[80%] h-3 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-[60%] h-3 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
