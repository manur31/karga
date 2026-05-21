export default function Mancuerna({ className = "w-5 h-5" }) {
    return (
      <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="square"
      >
        <line x1="7.5" y1="16.5" x2="16.5" y2="7.5" />
        
        <path d="M4.5 14.5 L9.5 19.5 M3 16 L8 21 M2 18 L6 22" />
        
        <path d="M14.5 4.5 L19.5 9.5 M16 3 L21 8 M18 2 L22 6" />
      </svg>
    );
  }