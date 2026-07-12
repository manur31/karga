import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "karga-install-prompt";

function fib(n) {
  if (n <= 0) return 1;
  let a = 0, b = 1;
  for (let i = 1; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage no disponible o datos corruptos
  }
  return { promptCount: 0, nextAllowedAt: 0, installed: false };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function useInstallBanner({ isStandalone, isInstallable }) {
  const [shouldShow, setShouldShow] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const state = loadState();

    if (isStandalone || state.installed) {
      saveState({ ...state, installed: true });
      return;
    }

    if (!isInstallable) {
      return;
    }

    if (Date.now() < state.nextAllowedAt) {
      return;
    }

    // Usar setTimeout 0 para salir del ciclo del effect y evitar
    // la advertencia del React Compiler
    setTimeout(() => setShouldShow(true), 0);
  }, [isStandalone, isInstallable]);

  const dismiss = () => {
    const state = loadState();
    const nextCount = state.promptCount + 1;
    const nextDays = fib(nextCount);
    const nextMs = nextDays * 24 * 60 * 60 * 1000;

    saveState({
      promptCount: nextCount,
      nextAllowedAt: Date.now() + nextMs,
      installed: false,
    });

    setShouldShow(false);
  };

  const markInstalled = () => {
    const state = loadState();
    saveState({ ...state, installed: true });
    setShouldShow(false);
  };

  return { shouldShow, dismiss, markInstalled };
}
