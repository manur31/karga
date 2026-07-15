import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiLogOut,
  FiSettings,
  FiUser,
  FiClock,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { useAuth } from "../../hooks/queries/useAuth";
import {
  useUpdateProfileDays,
  useUpdateProfileRestTime,
} from "../../hooks/mutations/useAuthMutations";
import { useSettingsStore } from "../../stores/settingsStore";
import { logout } from "../../service/authService";

export default function ProfileModal({ isOpen, onClose }) {
  const { data: user } = useAuth();
  const { weightUnit, setWeightUnit } = useSettingsStore();

  const [trainingDays, setTrainingDays] = useState(1);
  const [restTime, setRestTime] = useState(60);

  const { mutate: updateProfileDays, isPending: isUpdatingDays } =
    useUpdateProfileDays();

  const { mutate: updateProfileRestTime, isPending: isUpdatingRestTime } =
    useUpdateProfileRestTime();

  useEffect(() => {
    if (!user || !isOpen) return;

    setTrainingDays(Number(user.time_for_week) || 1);
    setRestTime(Number(user.rest_time) || 60);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/welcome";
  };

  const changeTrainingDays = (amount) => {
    if (!user?.profile_id || isUpdatingDays) return;

    const newValue = Math.min(Math.max(trainingDays + amount, 1), 7);

    if (newValue === trainingDays) return;

    setTrainingDays(newValue);

    updateProfileDays(
      {
        profile_id: user.profile_id,
        time_for_week: newValue,
      },
      {
        onError: () => {
          setTrainingDays(trainingDays);
        },
      },
    );
  };

  const changeRestTime = (amount) => {
    if (!user?.profile_id || isUpdatingRestTime) return;

    const newValue = Math.min(Math.max(restTime + amount, 15), 300);

    if (newValue === restTime) return;

    setRestTime(newValue);

    updateProfileRestTime(
      {
        profile_id: user.profile_id,
        rest_time: newValue,
      },
      {
        onError: () => {
          setRestTime(restTime);
        },
      },
    );
  };

  const formatRestTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
      return `${minutes} min`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#2A2424] shadow-2xl animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-black/20 p-5">
          <h2 className="text-lg font-bold text-white">Perfil y Ajustes</h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/50 transition-colors hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* User Info */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <FiUser size={28} className="text-white/20" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">
                {user?.name || "Usuario Karga"}
              </h3>

              <p className="text-xs text-white/40">
                {user?.email || "usuario@ejemplo.com"}
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-2">
            <h4 className="pl-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
              Preferencias
            </h4>

            {/* Unidad de peso */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2.5">
                <FiSettings className="text-karga-orange" size={18} />

                <span className="text-sm font-medium text-white">
                  Unidad de peso
                </span>
              </div>

              <div className="flex rounded-xl border border-white/5 bg-black/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setWeightUnit("kg")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    weightUnit === "kg"
                      ? "bg-karga-orange text-white shadow-md"
                      : "text-white/40"
                  }`}
                >
                  KG
                </button>

                <button
                  type="button"
                  onClick={() => setWeightUnit("lb")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    weightUnit === "lb"
                      ? "bg-karga-orange text-white shadow-md"
                      : "text-white/40"
                  }`}
                >
                  LB
                </button>
              </div>
            </div>

            {/* Tiempo de descanso */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2.5">
                <FiClock className="text-karga-orange" size={18} />

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    Tiempo de descanso
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => changeRestTime(-15)}
                  disabled={restTime <= 15 || isUpdatingRestTime}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <FiChevronLeft size={18} />
                </button>

                <span className="min-w-13.5 text-center text-xs font-bold text-white">
                  {formatRestTime(restTime)}
                </span>

                <button
                  type="button"
                  onClick={() => changeRestTime(15)}
                  disabled={restTime >= 300 || isUpdatingRestTime}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Días de entrenamiento */}
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2.5">
                <FiCalendar className="text-karga-orange" size={18} />

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    Días de entrenamiento
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => changeTrainingDays(-1)}
                  disabled={trainingDays <= 1 || isUpdatingDays}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <FiChevronLeft size={18} />
                </button>

                <span className="min-w-9.5 text-center text-xs font-bold text-white">
                  {trainingDays} {trainingDays === 1 ? "día" : "días"}
                </span>

                <button
                  type="button"
                  onClick={() => changeTrainingDays(1)}
                  disabled={trainingDays >= 7 || isUpdatingDays}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/5 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/20"
            >
              <FiLogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
