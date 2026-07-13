import { createPortal } from "react-dom";
import { FiAlertCircle } from "react-icons/fi";

export const ErrorModal = ({ message }) => {
  if (!message) return null;

  return createPortal(
    <>
      <style>
        {`
          @keyframes errorToastIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      <div className="fixed inset-x-0 bottom-24 z-[9999] flex justify-center px-4">
        <div
          className="flex w-full max-w-md items-start gap-3 rounded-2xl border border-red-500/60 bg-[#2A1717]/95 px-4 py-3 text-red-400 shadow-2xl backdrop-blur-md"
          style={{
            animation: "errorToastIn 220ms ease-out",
          }}
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <FiAlertCircle size={18} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-400">Error</h3>

            <p className="mt-0.5 text-sm leading-5 text-red-300">{message}</p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
