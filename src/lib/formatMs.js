/**
 * Convierte milisegundos a una cadena formateada HH:MM:SS o MM:SS.
 * Si showHours es true o los minutos >= 60, muestra HH:MM:SS.
 * Siempre muestra al menos MM:SS.
 */
const formatMs = (ms, showHours = false) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showHours || hours > 0) {
    return [hours, minutes, seconds]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  }

  return [minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
};

export default formatMs;
