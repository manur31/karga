import { useState, useEffect, useRef } from "react";
import { FiDownload, FiX } from "react-icons/fi";

export default function InstallPWAModal({
  shouldShow,
  isStandalone,
  isInstallable,
  install,
  onDismiss,
  onInstall,
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!shouldShow || isStandalone || !isInstallable) return;

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, 60_000);

    return () => clearTimeout(timerRef.current);
  }, [shouldShow, isStandalone, isInstallable]);

  const handleInstall = async () => {
    try {
      const outcome = await install();
      if (outcome === "accepted") {
        onInstall();
      }
    } catch {
      onInstall();
    }
    close();
  };

  const handleDismiss = () => {
    onDismiss();
    close();
  };

  const close = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 200);
  };

  if (!visible && !closing) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-auto ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      <div
        className={`relative w-full max-w-sm bg-[#2A2424] rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col gap-5 ${
          closing ? "animate-slide-out-down" : "animate-slide-in-up"
        }`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/20 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-karga-orange/15 flex items-center justify-center text-karga-orange">
          <FiDownload className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Descarga Karga
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Instala Karga en tu dispositivo para una experiencia más rápida y
            sin distracciones.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleInstall}
            className="w-full py-3.5 bg-karga-orange hover:bg-orange-600 text-white rounded-2xl font-bold transition-colors active:scale-[0.97]"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-2xl font-bold transition-colors active:scale-[0.97]"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
