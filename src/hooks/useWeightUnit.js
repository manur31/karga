import { useSettingsStore } from '../stores/settingsStore';

export function useWeightUnit() {
  const { weightUnit, setWeightUnit } = useSettingsStore();

  const toggleUnit = () => {
    setWeightUnit(weightUnit === 'kg' ? 'lb' : 'kg');
  };

  const displayWeight = (kgWeight) => {
    if (!kgWeight && kgWeight !== 0) return 0;
    if (weightUnit === 'lb') {
      return Number((kgWeight * 2.20462).toFixed(2));
    }
    return Number(kgWeight);
  };

  const convertToKg = (inputWeight) => {
    if (!inputWeight && inputWeight !== 0) return 0;
    if (weightUnit === 'lb') {
      return Number((inputWeight / 2.20462).toFixed(2));
    }
    return Number(inputWeight);
  };

  return {
    unit: weightUnit,
    toggleUnit,
    displayWeight,
    convertToKg,
  };
}
