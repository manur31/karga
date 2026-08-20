import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function WalkthroughSpotlight({ targetRef, onTargetClick, children, padding = 8 }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const updateRect = () => {
      if (targetRef?.current) {
        setRect(targetRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    
    let observer;
    if (targetRef?.current) {
      observer = new ResizeObserver(updateRect);
      observer.observe(targetRef.current);
    }

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [targetRef]);

  useEffect(() => {
    if (!targetRef?.current || !onTargetClick) return;
    const el = targetRef.current;
    
    const handleClick = () => {
      onTargetClick();
    };
    
    el.addEventListener('click', handleClick);
    return () => {
      el.removeEventListener('click', handleClick);
    };
  }, [targetRef, onTargetClick]);

  if (!rect) return null;

  const top = rect.top - padding;
  const bottom = rect.bottom + padding;
  const left = rect.left - padding;
  const right = rect.right + padding;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none animate-fade-in">
      <div 
        className="absolute inset-0 bg-[#121212]/90 pointer-events-auto backdrop-blur-sm"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 
            ${left}px ${top}px, 
            ${right}px ${top}px, 
            ${right}px ${bottom}px, 
            ${left}px ${bottom}px, 
            ${left}px ${top}px
          )`
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      
      {/* Wrapper to hold tooltip positioned exactly at target */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`
        }}
      >
        <div className="pointer-events-auto w-full h-full relative">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
