import { useState, useEffect } from "react";

/**
 * Hook que mantiene un estado "now" actualizado cada segundo con Date.now().
 * Útil para calcular duraciones/tiempo restante reactivamente desde timestamps.
 * No utiliza Zustand ni persiste datos.
 */
export default function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
