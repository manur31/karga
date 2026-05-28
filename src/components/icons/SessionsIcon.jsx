export default function SessionsIcon({ className = "w-6 h-6 mb-0.5" }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="m14.4 14.4-4.8-4.8" />
        <path d="M18.65 21.35a2.83 2.83 0 0 0-3.96 0l-1.77-1.77" />
        <path d="m21.35 18.65-1.77-1.77a2.83 2.83 0 0 0 0-3.96" />
        <path d="m2.65 5.35 1.77 1.77a2.83 2.83 0 0 0 3.96 0" />
        <path d="M5.35 2.65a2.83 2.83 0 0 0-3.96 0" />
        <path d="m11.08 4.5 1.77-1.77a2.83 2.83 0 0 0-3.96 0" />
      </svg>
    );
  }