import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useWeightUnit } from "../../hooks/useWeightUnit";
import { CheckIcon, PlusIcon } from "../icons";
import { useRestStore } from "../../stores/restStore";
import { useCreateSet } from "../../hooks/mutations/useSetsMutations";
import { getLastSetForExercise } from "../../lib/local/setsHelpers";
import { FiMinus, FiX, FiSquare } from "react-icons/fi";
import { VscRecord } from "react-icons/vsc";
import { getCachedProfile } from "../../storage/profile-storage";

export default function SetModal({ exercise, onClose, onSaveOverride }) {
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);

  const trackingType =
    exercise?.tracking_type || exercise?.trackingType || "weight_reps";
  const showWeight =
    trackingType === "weight_reps" || trackingType === "weight_time";
  const showReps = trackingType === "weight_reps";
  const showTime = trackingType === "time" || trackingType === "weight_time";

  const { unit, toggleUnit, convertToKg } = useWeightUnit();

  const [etiqueta, setEtiqueta] = useState("none");
  const [isEtiquetaModalOpen, setIsEtiquetaModalOpen] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartTimer = () => {
    setIsRecording(true);
    setTimerSeconds(0);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopTimer = () => {
    setDuration(timerSeconds);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleToggleUnit = () => {
    if (unit === "kg") {
      setWeight((prev) => Number((Number(prev) * 2.20462).toFixed(2)));
    } else {
      setWeight((prev) => Number((Number(prev) / 2.20462).toFixed(2)));
    }
    toggleUnit();
  };

  const { startRest } = useRestStore();

  const profile = getCachedProfile() || {};
  const profile_id = profile.profile_id;
  const restTime = profile?.rest_time ?? 60;

  const { mutateAsync: createSet } = useCreateSet(profile_id);

  useEffect(() => {
    let cancelled = false;

    const loadLast = async () => {
      if (!exercise?.id) return;
      const lastSet = await getLastSetForExercise(exercise.id, profile_id);
      if (cancelled || !lastSet) return;
      // Assume last set weight is stored in kg and needs to be displayed in current unit
      const displayWeight =
        unit === "kg"
          ? lastSet.weight
          : Number((lastSet.weight * 2.20462).toFixed(2));
      setReps(lastSet.rep || 0);
      setWeight(displayWeight || 0);
      setDuration(lastSet.duration || 0);
    };

    loadLast();
    return () => {
      cancelled = true;
    };
  }, [exercise?.id, profile_id, unit]);

  if (!exercise) return null;

  const handleCloseWithAnimation = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!profile_id || isSaving) return;

    setIsSaving(true);
    const weightInKg = convertToKg(weight);
    const repsValue = Number(reps || 0);
    const finalDuration = isRecording ? timerSeconds : Number(duration || 0);

    if (isRecording) {
      handleStopTimer();
    }

    try {
      const setData = {
        profile_id,
        exercise_id: exercise.id,
        rep: showReps ? Number(reps || 0) : 0,
        weight: showWeight ? Number(weightInKg.toFixed(2)) : 0,
        duration: showTime ? finalDuration : 0,
      };

      if (onSaveOverride) {
        onSaveOverride(setData);
      } else {
        await createSet(setData);
        startRest({
          seconds: restTime,
          lastSet: {
            exerciseName: exercise.name,
            weightKg: Number(weightInKg.toFixed(2)),
            reps: repsValue,
          },
        });
      }

      handleCloseWithAnimation(null);
    } catch (error) {
      console.error("Error al guardar el set:", error);
      setIsSaving(false);
    }
  };

  const handleAdjustReps = (amount) => {
    setReps((prev) => Math.max(0, Number(prev || 0) + amount));
  };

  const handleAdjustDuration = (amount) => {
    setDuration((prev) => Math.max(0, Number(prev || 0) + amount));
  };

  const handleAdjustWeight = (amount) => {
    setWeight((prev) => {
      const val = Number(prev || 0) + amount;
      return Math.max(0, parseFloat(val.toFixed(2)));
    });
  };

  const handleFocus = (e) => {
    if (e.target.value === "0") {
      e.target.value = "";
    }
    e.target.select();
  };

  const weightStep = unit === "kg" ? 1 : 2.5;

  const getInputTextSize = (value) => {
    const len = String(value).length;
    if (len >= 5) return "text-2xl sm:text-3xl";
    if (len === 4) return "text-3xl sm:text-4xl";
    return "text-4xl sm:text-5xl";
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex flex-col justify-end pointer-events-auto">
      {/* Overlay oscuro para cerrar */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleCloseWithAnimation}
      />

      {/* Contenedor Bottom Sheet */}
      <div
        className={`relative w-full sm:max-w-md sm:mx-auto bg-dark-bg rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-8 h-auto ${
          isClosing ? "animate-slide-out-down" : "animate-slide-in-up"
        }`}
      >
        {/* Drag handle */}
        <div
          className="w-full flex justify-center py-4 shrink-0 cursor-pointer"
          onClick={handleCloseWithAnimation}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* X Close button */}
        <button
          onClick={handleCloseWithAnimation}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95 z-20"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Contenido */}
        <div className="px-6 flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight mb-8 truncate pr-10">
            {exercise.name}
          </h2>

          {/* ZONA DE INPUTS */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Lado izquierdo: REPS */}
            {showReps && (
              <div className="flex flex-col items-center justify-center py-6 px-2 bg-white/5 rounded-3xl relative">
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3">
                  Repeticiones
                </span>
                <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center min-h-8 px-2 relative">
                  <div></div>
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <button
                      disabled={isRecording}
                      onClick={() => handleAdjustReps(-1)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20 active:scale-95"}`}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      onFocus={handleFocus}
                      disabled={isRecording}
                      className={`bg-transparent text-center font-black tracking-tighter outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputTextSize(reps)} ${isRecording ? "text-white/30" : "text-white"}`}
                      style={{
                        width: `${Math.max(2, String(reps).length)}ch`,
                        boxSizing: "content-box",
                      }}
                    />

                    <button
                      disabled={isRecording}
                      onClick={() => handleAdjustReps(1)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20 active:scale-95"}`}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div></div>
                </div>
              </div>
            )}

            {/* Lado izquierdo: TIEMPO */}
            {showTime && (
              <div className="flex flex-col items-center justify-center py-6 px-2 bg-white/5 rounded-3xl relative">
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3">
                  {isRecording ? (
                    <span className="flex items-center gap-1 text-red-500 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      EN VIVO
                    </span>
                  ) : (
                    "Tiempo (MM:SS)"
                  )}
                </span>
                <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center min-h-8 px-2 relative">
                  <div></div>
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <button
                      disabled={isRecording}
                      onClick={() => handleAdjustDuration(-15)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${isRecording ? "opacity-0 pointer-events-none" : "bg-white/10 text-white hover:bg-white/20 active:scale-95"}`}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>

                    <div
                      className={`flex items-center justify-center gap-0.5 font-black transition-all ${isRecording ? "text-red-500" : "text-white"}`}
                    >
                      <input
                        type="number"
                        value={Math.floor(
                          (isRecording ? timerSeconds : duration) / 60,
                        )}
                        onChange={(e) =>
                          setDuration(
                            parseInt(e.target.value || 0) * 60 +
                              (duration % 60),
                          )
                        }
                        onFocus={handleFocus}
                        disabled={isRecording}
                        style={{
                          width: `${Math.max(1, String(Math.floor((isRecording ? timerSeconds : duration) / 60)).length)}ch`,
                          boxSizing: "content-box",
                        }}
                        className={`bg-transparent p-0 text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all tracking-tighter ${String(Math.floor((isRecording ? timerSeconds : duration) / 60)).length + 3 >= 5 ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"} ${isRecording ? "text-red-500" : ""}`}
                      />
                      <span
                        className={`pb-1 ${String(Math.floor((isRecording ? timerSeconds : duration) / 60)).length + 3 >= 5 ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"} ${isRecording ? "text-red-500" : ""}`}
                      >
                        :
                      </span>
                      <input
                        type="number"
                        value={((isRecording ? timerSeconds : duration) % 60)
                          .toString()
                          .padStart(2, "0")}
                        onChange={(e) =>
                          setDuration(
                            Math.floor(duration / 60) * 60 +
                              parseInt(e.target.value || 0),
                          )
                        }
                        onFocus={handleFocus}
                        disabled={isRecording}
                        style={{ width: "2ch", boxSizing: "content-box" }}
                        className={`bg-transparent p-0 text-left outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all tracking-tighter ${String(Math.floor((isRecording ? timerSeconds : duration) / 60)).length + 3 >= 5 ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"} ${isRecording ? "text-red-500" : ""}`}
                      />
                    </div>

                    <button
                      disabled={isRecording}
                      onClick={() => handleAdjustDuration(15)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${isRecording ? "opacity-0 pointer-events-none" : "bg-white/10 text-white hover:bg-white/20 active:scale-95"}`}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-end relative z-10">
                    {!isRecording ? (
                      <button
                        onClick={handleStartTimer}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors bg-red-500/20 hover:bg-red-500/30 text-red-500"
                      >
                        <VscRecord className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleStopTimer}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white shrink-0 flex items-center justify-center transition-colors shadow-lg shadow-red-500/40"
                      >
                        <FiSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lado derecho: WEIGHT */}
            {showWeight && (
              <div className="flex flex-col items-center justify-center py-6 px-2 bg-white/5 rounded-3xl relative">
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3">
                  Peso ({unit.toUpperCase()})
                </span>
                <div className="grid grid-cols-[1fr_auto_1fr] w-full items-center min-h-8 px-2 relative">
                  <div></div>
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <button
                      disabled={isRecording}
                      onClick={() => handleAdjustWeight(-weightStep)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20 active:scale-95"}`}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      onFocus={handleFocus}
                      disabled={isRecording}
                      className={`bg-transparent text-center font-black tracking-tighter outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputTextSize(weight)} ${isRecording ? "text-white/30" : "text-white"}`}
                      style={{
                        width: `${Math.max(2, String(weight).length)}ch`,
                        boxSizing: "content-box",
                      }}
                    />

                    <button
                      disabled={isRecording}
                      onClick={() => handleAdjustWeight(weightStep)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20 active:scale-95"}`}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div></div>
                </div>
              </div>
            )}
          </div>

          {/* ETIQUETAS/OPCIONES RÁPIDAS & BOTÓN GUARDAR EN LA MISMA FILA */}
          <div className="flex items-center justify-between mt-2 gap-4">
            <div className="flex items-center gap-2 overflow-visible">
              {/* Dropdown Etiqueta */}
              <div className="relative">
                <button
                  disabled={isRecording}
                  onClick={() => {
                    setIsEtiquetaModalOpen(!isEtiquetaModalOpen);
                  }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors capitalize ${
                    isRecording
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : etiqueta !== "none"
                        ? "bg-karga-orange text-white shadow-lg shadow-karga-orange/20"
                        : "bg-white/10 hover:bg-white/20 text-zinc-300"
                  }`}
                >
                  {etiqueta === "none" ? "Etiqueta" : etiqueta}
                </button>

                {isEtiquetaModalOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-36 bg-[#2A2424] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in flex flex-col">
                    {["none", "calentamiento", "amrap", "pr", "fallo"].map(
                      (opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setEtiqueta(opt);
                            setIsEtiquetaModalOpen(false);
                          }}
                          className={`px-4 py-3 text-sm text-left font-semibold capitalize transition-colors ${
                            etiqueta === opt
                              ? "bg-karga-orange/20 text-karga-orange"
                              : "text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          {opt === "none" ? "Sin etiqueta" : opt}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Botón LB / KG */}
              {showWeight && (
                <button
                  disabled={isRecording}
                  onClick={handleToggleUnit}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase transition-colors ${isRecording ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-white/10 hover:bg-white/20 text-zinc-300"}`}
                >
                  {unit === "kg" ? "LB" : "KG"}
                </button>
              )}
            </div>

            {/* Botón Guardar */}
            <button
              onClick={handleSave}
              disabled={isSaving || isRecording}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                isSaving || isRecording
                  ? "bg-karga-orange/50 cursor-not-allowed"
                  : "bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 shadow-lg shadow-[#1DB954]/20"
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
