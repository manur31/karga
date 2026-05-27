export default function ArrowLeft({ className = "" }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="24"
        height="24"
        fill="none"
        viewBox="0 -1.5 20 24"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.5 4.5l-6 6m0 0l6 6m-6-6H22" />
      </svg>
    );
  }