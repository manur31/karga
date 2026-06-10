import { useState, useEffect } from 'react';

const STORAGE_KEY = 'karga_weight_unit';
const EVENT_NAME = 'karga_weight_unit_changed';

export function useWeightUnit() {
  const [unit, setUnitState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'kg';
  });

  // Inicializar desde localStorage y escuchar cambios en tiempo real
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Cambios desde esta misma pestaña
      if (e.type === EVENT_NAME) {
        setUnitState(e.detail);
      }
      // Cambios desde otras pestañas
      if (e.key === STORAGE_KEY) {
        setUnitState(e.newValue || 'kg');
      }
    };

    window.addEventListener(EVENT_NAME, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setUnit = (newUnit) => {
    localStorage.setItem(STORAGE_KEY, newUnit);
    setUnitState(newUnit);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newUnit }));
  };

  const toggleUnit = () => {
    setUnit(unit === 'kg' ? 'lb' : 'kg');
  };

  // Convierte un peso (que en DB siempre es kg) a la unidad actual para mostrarlo
  const displayWeight = (kgWeight) => {
    if (!kgWeight && kgWeight !== 0) return 0;
    if (unit === 'lb') {
      return Number((kgWeight * 2.20462).toFixed(2));
    }
    return Number(kgWeight);
  };

  // Convierte un peso ingresado por el usuario (en la unidad actual) a KG para guardarlo en DB
  const convertToKg = (inputWeight) => {
    if (!inputWeight && inputWeight !== 0) return 0;
    if (unit === 'lb') {
      return Number((inputWeight / 2.20462).toFixed(2));
    }
    return Number(inputWeight);
  };

  return { unit, toggleUnit, displayWeight, convertToKg };
}
