import { useMemo, useState } from "react";
import { FiCheck, FiPlay, FiX } from "react-icons/fi";
import { useAuth } from "../../hooks/queries/useAuth";
import { useRoutines } from "../../hooks/queries/useRoutines";
import { useCreateSession } from "../../hooks/mutations/useSesionsMutation";

export const NewTrainModal = ({ isOpen, onClose, onStarted }) => {
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);

  const { data: profile } = useAuth();

  const profile_id = profile?.profile_id;

  const { data: routines = [], isLoading: isLoadingRoutines } =
    useRoutines(profile_id);

  const { mutateAsync: createSession, isPending } =
    useCreateSession(profile_id);

  const selectedRoutine = useMemo(() => {
    return routines.find((routine) => routine.routine_id === selectedRoutineId);
  }, [routines, selectedRoutineId]);

  const handleStartTraining = async () => {
    if (!selectedRoutine) return;

    const session = await createSession({
      time_init: new Date().toISOString(),
      time_end: null,
      note: selectedRoutine.name,
    });

    onStarted?.({
      session,
      routine: selectedRoutine,
    });

    setSelectedRoutineId(null);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl bg-karga-gray p-5 text-white border border-white/10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Nuevo entrenamiento</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Elegí la rutina que vas a realizar hoy.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl bg-white/10 p-2 text-zinc-400 transition hover:text-white disabled:opacity-50"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
          {isLoadingRoutines ? (
            <div className="flex justify-center py-8">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/10 border-t-karga-orange" />
            </div>
          ) : routines.length === 0 ? (
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm font-bold text-white">
                Todavía no tenés rutinas creadas.
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Creá una rutina primero para poder iniciar un entrenamiento.
              </p>
            </div>
          ) : (
            routines.map((routine) => {
              const isSelected = selectedRoutineId === routine.routine_id;

              return (
                <button
                  key={routine.routine_id}
                  type="button"
                  onClick={() => setSelectedRoutineId(routine.routine_id)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-karga-orange bg-karga-orange/10"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {routine.name}
                    </h3>

                    {routine.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                        {routine.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs font-semibold text-zinc-500">
                      {routine.routines_exercises?.length || 0} ejercicios
                    </p>
                  </div>

                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-karga-orange text-white"
                        : "bg-white/10 text-zinc-500"
                    }`}
                  >
                    {isSelected && <FiCheck size={16} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={handleStartTraining}
          disabled={!selectedRoutine || isPending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-karga-orange py-4 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            "Iniciando..."
          ) : (
            <>
              <FiPlay size={18} />
              Iniciar Sesion
            </>
          )}
        </button>
      </div>
    </div>
  );
};
