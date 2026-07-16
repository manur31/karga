export default function ChevronIcon({ className = "w-4 h-4", direction = "left", ...props }) {
    return (
      <svg
        className={`
          ${className} 
          transition-transform duration-200
          ${direction === "right" ? "rotate-180" : ""}
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    );
  }