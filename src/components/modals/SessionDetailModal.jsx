import { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiClock, FiFileText, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSets } from "../../hooks/queries/useSets";
import { useWeightUnit } from "../../hooks/useWeightUnit";
import ConfirmModal from "./ConfirmModal";
import {
  useDeleteSession,
  useUpdateSessionWithSets,
} from "../../hooks/mutations/useSesionsMutation";
import { getCachedProfile } from "../../storage/profile-storage";
import { EditSessions } from "./EditSessions";

function formatSetDuration(seconds) {
  const s = Number(seconds || 0);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function SessionDetailModal({ session, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditSessions, setShowEditSessions] = useState(false);

  const profile_id = getCachedProfile()?.profile_id;
  const { data: sets } = useSets(profile_id);
  const { displayWeight, unit } = useWeightUnit();
  const { mutateAsync: deleteSessionMutate } = useDeleteSession();
  const { mutateAsync: updateSessionWithSetsMutate } =
    useUpdateSessionWithSets(profile_id);

  if (!session) return null;

  const sessionId = session?.session_id || session?.id;
  const sessionStart = session?.startedAt || session?.time_init;
  const sessionEnd = session?.finishedAt || session?.time_end;

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleEditSessions = async (data) => {
    await updateSessionWithSetsMutate({
      session_id: sessionId,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      note: data.note,
      sets: data.sets,
      deletedSetIds: data.deletedSetIds,
    });
  };

  const handleDelete = async () => {
    try {
      await deleteSessionMutate(sessionId);
      setShowConfirmDelete(false);
      handleClose();
    } catch (error) {
      console.error("Error al eliminar sesión:", error);
    }
  };

  const sessionSets =
    sets?.filter((set) => {
      if (!set.created_at || !sessionStart) return false;
      const setTime = new Date(set.created_at).getTime();
      const initTime = new Date(sessionStart).getTime();
      const endTime = sessionEnd
        ? new Date(sessionEnd).getTime()
        : new Date().getTime();
      return setTime >= initTime && setTime <= endTime;
    }) || [];

  const calculateDuration = (init, end) => {
    if (!end) return "En curso";
    const startDate = new Date(init);
    const endDate = new Date(end);
    const diffInSeconds = Math.floor((endDate - startDate) / 1000);
    if (diffInSeconds < 0) return "00:00:00";
    const h = Math.floor(diffInSeconds / 3600);
    const m = Math.floor((diffInSeconds % 3600) / 60);
    const s = diffInSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const rawDate = new Date(session.startedAt).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const formattedInitTime = new Date(session.startedAt).toLocaleTimeString(
    "es-ES",
    { hour: "2-digit", minute: "2-digit" },
  );

  const formattedEndTime = session.finishedAt
    ? new Date(session.finishedAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "En curso";

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4 ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#2A2424] w-full max-w-md max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden ${isClosing ? "animate-slide-out-down" : "animate-slide-in-up"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {formattedDate}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex flex-col gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <FiClock className="w-4 h-4" />
                <span className="text-sm font-medium">Duración Total</span>
              </div>
              <span className="text-2xl font-black text-[#facc15] tabular-nums tracking-wide">
                {calculateDuration(session.startedAt, session.finishedAt)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  Inicio
                </span>
                <span className="text-white font-medium">
                  {formattedInitTime}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  Fin
                </span>
                <span className="text-white font-medium">
                  {formattedEndTime}
                </span>
              </div>
            </div>
          </div>

          {session.note && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <FiFileText className="w-4 h-4" />
                <span className="text-sm font-medium">Nota</span>
              </div>
              <p className="text-zinc-300 text-sm bg-black/20 p-3 rounded-xl border border-white/5">
                {session.note}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-karga-orange rounded-full"></span>
                Ejercicios Realizados
              </h3>
              <button
                type="button"
                onClick={() => setShowEditSessions(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-karga-orange text-white hover:bg-karga-orange/20 transition-colors"
              >
                <FiEdit2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {sessionSets.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm bg-black/10 rounded-2xl border border-white/5">
                No se registraron sets durante esta sesión.
              </div>
            ) : (
              <div className="space-y-3">
                {sessionSets.map((set) => (
                  <div
                    key={set.set_id || set.id}
                    className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">
                        {set.exercises?.name || "Ejercicio Desconocido"}
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {Array.isArray(set.exercises?.muscle)
                          ? set.exercises.muscle.join(" - ")
                          : set.exercises?.muscle}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      {(set.weight ?? 0) > 0 && (
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">
                            Peso
                          </span>
                          <span className="text-white font-medium">
                            {displayWeight(set.weight)}
                            {unit}
                          </span>
                        </div>
                      )}
                      {(set.rep ?? 0) > 0 && (
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">
                            Reps
                          </span>
                          <span className="text-white font-medium">
                            {set.rep}
                          </span>
                        </div>
                      )}
                      {(set.duration ?? 0) > 0 && (
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">
                            Tiempo
                          </span>
                          <span className="text-white font-medium">
                            {formatSetDuration(set.duration)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditSessions && (
        <EditSessions
          session={session}
          onClose={() => setShowEditSessions(false)}
          sets={sessionSets}
          onSave={async (data) => {
            await handleEditSessions(data);
            setShowEditSessions(false);
          }}
          close={() => handleClose()}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Eliminar sesión"
        description="¿Estás seguro de que quieres eliminar esta sesión de forma permanente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setShowConfirmDelete(false)}
      />
    </div>,
    document.body,
  );
}
