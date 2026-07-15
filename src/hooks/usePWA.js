import { useState, useEffect, useCallback, useRef } from "react";

export default function usePWA() {
  const [isStandalone, setIsStandalone] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches,
  );
  const [isInstallable, setIsInstallable] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsStandalone(true);
      setIsInstallable(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    prompt.prompt();
    const result = await prompt.userChoice;

    deferredPromptRef.current = null;
    setIsInstallable(false);

    if (result.outcome === "accepted") {
      setIsStandalone(true);
    }

    return result.outcome;
  }, []);

  return { isStandalone, isInstallable, install };
}
