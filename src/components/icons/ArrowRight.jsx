export default function ArrowRight({ className = "", viewBox = "0 -1.5 20 24", ...props }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="24"
        height="24"
        fill="none"
        viewBox={viewBox}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M16.5 4.5l6 6m0 0l-6 6m6-6H2" />
      </svg>
    );
  }