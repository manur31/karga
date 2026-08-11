import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiClock,
  FiCalendar,
  FiFileText,
  FiTrash2,
  FiSave,
  FiPlus,
} from "react-icons/fi";
import { format } from "date-fns";

import ExerciseSelectorModal from "./ExerciseSelectorModal";
import SetModal from "./SetModal";

export const EditSessions = ({ session, sets = [], onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [deletedSetIds, setDeletedSetIds] = useState([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [activeExerciseForSet, setActiveExerciseForSet] = useState(null);

  const [editedSets, setEditedSets] = useState(() =>
    sets.map((set) => ({
      ...set,
      rep: set.rep ?? "",
      weight: set.weight ?? "",
    })),
  );

  const initialStartDate = session?.startedAt
    ? new Date(session.startedAt)
    : new Date();

  const initialEndDate = session?.finishedAt
    ? new Date(session.finishedAt)
    : new Date();

  const [date, setDate] = useState(() =>
    format(initialStartDate, "yyyy-MM-dd"),
  );

  const [startTime, setStartTime] = useState(() =>
    format(initialStartDate, "HH:mm"),
  );

  const [endTime, setEndTime] = useState(() => format(initialEndDate, "HH:mm"));

  const [note, setNote] = useState(session?.note || "");

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      onClose();
    }, 200);
  };

  const getNormalizedExercise = (exercise) => {
    return exercise?.exercises || exercise?.exercise || exercise;
  };

  const getExerciseId = (exercise) => {
    const normalizedExercise = getNormalizedExercise(exercise);

    return (
      exercise?.exercise_id ||
      normalizedExercise?.exercise_id ||
      normalizedExercise?.id ||
      exercise?.id
    );
  };

  const handleSelectExercise = (exercise) => {
    setIsExerciseSelectorOpen(false);
    setActiveExerciseForSet(exercise);
  };

  const handleSaveNewExerciseSet = (setData) => {
    if (!activeExerciseForSet) return;

    const normalizedExercise = getNormalizedExercise(activeExerciseForSet);
    const exerciseId = getExerciseId(activeExerciseForSet);

    if (!exerciseId) {
      console.log("No se encontró exercise_id:", activeExerciseForSet);
      return;
    }

    setEditedSets((prev) => [
      ...prev,
      {
        ...setData,
        tempId: crypto.randomUUID(),
        set_id: null,
        exercise_id: setData.exercise_id || exerciseId,
        exercises: normalizedExercise,
        exercise: normalizedExercise,
        rep: setData.rep ?? "",
        weight: setData.weight ?? "",
        created_at: null,
      },
    ]);

    setActiveExerciseForSet(null);
  };

  const handleAddSetToExercise = (group) => {
    setEditedSets((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        set_id: null,
        exercise_id: group.exerciseId,
        exercises: group.exercise,
        exercise: group.exercise,
        rep: "",
        weight: "",
        created_at: null,
      },
    ]);
  };

  const handleChangeSet = (setId, field, value) => {
    setEditedSets((prev) =>
      prev.map((set) =>
        getSetId(set) === setId
          ? {
              ...set,
              [field]: value,
            }
          : set,
      ),
    );
  };

  const handleDeleteSet = (set) => {
    const setId = getSetId(set);

    if (set.set_id) {
      setDeletedSetIds((prev) => [...prev, set.set_id]);
    }

    setEditedSets((prev) => prev.filter((item) => getSetId(item) !== setId));
  };

  const exercisesWithSets = useMemo(() => {
    const groups = [];

    editedSets.forEach((set) => {
      const exercise = set.exercises || set.exercise;

      const exerciseId =
        exercise?.exercise_id || exercise?.id || set.exercise_id;

      if (!exerciseId) return;

      let group = groups.find((item) => item.exerciseId === exerciseId);

      if (!group) {
        group = {
          exerciseId,
          exercise,
          sets: [],
        };

        groups.push(group);
      }

      group.sets.push(set);
    });

    return groups;
  }, [editedSets]);

  const handleSave = () => {
    const startedAt = new Date(`${date}T${startTime}`);
    let finishedAt = new Date(`${date}T${endTime}`);

    if (finishedAt < startedAt) {
      finishedAt = new Date(finishedAt.getTime() + 86400000);
    }

    const validSets = editedSets.filter((set) => {
      const hasExercise = Boolean(set.exercise_id);
      const hasRep =
        set.rep !== "" && set.rep !== null && set.rep !== undefined;
      const hasWeight =
        set.weight !== "" && set.weight !== null && set.weight !== undefined;

      return hasExercise && hasRep && hasWeight;
    });

    const payload = {
      session_id: session?.session_id || session?.id,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      note,
      sets: validSets.map((set, index) => {
        const totalSets = validSets.length;
        const durationMs = finishedAt.getTime() - startedAt.getTime();

        const createdAt =
          set.created_at ||
          new Date(
            startedAt.getTime() + (durationMs / (totalSets + 1)) * (index + 1),
          ).toISOString();

        return {
          ...set,
          rep: Number(set.rep),
          weight: Number(set.weight),
          created_at: createdAt,
        };
      }),
      deletedSetIds,
    };

    onSave?.(payload);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-[#2A2424] shadow-2xl ${
          isClosing ? "animate-slide-out-down" : "animate-slide-in-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-black/20 p-5">
          <div>
            <h2 className="text-xl font-black tracking-wide text-white">
              Editar sesión
            </h2>
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Modificá los datos del entrenamiento
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* FECHA Y HORARIOS */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/20 p-4">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <FiCalendar className="h-3.5 w-3.5" />
                Fecha
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="scheme-dark rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition-colors focus:border-karga-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <FiClock className="h-3.5 w-3.5" />
                  Inicio
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="scheme-dark rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition-colors focus:border-karga-orange"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <FiClock className="h-3.5 w-3.5" />
                  Fin
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="scheme-dark rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition-colors focus:border-karga-orange"
                />
              </div>
            </div>
          </div>

          {/* NOTAS */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <FiFileText className="h-3.5 w-3.5" />
              Notas
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Añade una nota a esta sesión..."
              className="h-24 resize-none rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-karga-orange/50"
            />
          </div>

          {/* EJERCICIOS */}
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="h-6 w-1.5 rounded-full bg-karga-orange" />
              Ejercicios
            </h3>

            {exercisesWithSets.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-black/10 py-8 text-center text-sm text-zinc-500">
                Esta sesión no tiene sets cargados.
              </div>
            ) : (
              <div className="space-y-4">
                {exercisesWithSets.map((group) => (
                  <div
                    key={group.exerciseId}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white">
                        {group.exercise?.name || "Ejercicio"}
                      </span>

                      {group.exercise?.muscle && (
                        <span className="text-xs capitalize text-zinc-500">
                          {Array.isArray(group.exercise.muscle)
                            ? group.exercise.muscle.join(" • ")
                            : group.exercise.muscle}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {group.sets.map((set, index) => {
                        const setId = getSetId(set);

                        return (
                          <div
                            key={setId}
                            className="grid grid-cols-[24px_1fr_1fr_32px] items-center gap-2 rounded-xl bg-white/5 p-2"
                          >
                            <span className="text-center text-xs font-bold text-zinc-500">
                              {index + 1}
                            </span>

                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) =>
                                handleChangeSet(setId, "weight", e.target.value)
                              }
                              className="w-full rounded-lg border border-white/5 bg-black/20 px-2 py-2 text-center text-sm font-bold text-white outline-none focus:border-karga-orange"
                              placeholder="Kg"
                            />

                            <input
                              type="number"
                              value={set.rep}
                              onChange={(e) =>
                                handleChangeSet(setId, "rep", e.target.value)
                              }
                              className="w-full rounded-lg border border-white/5 bg-black/20 px-2 py-2 text-center text-sm font-bold text-white outline-none focus:border-karga-orange"
                              placeholder="Reps"
                            />

                            <button
                              type="button"
                              onClick={() => handleDeleteSet(set)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleAddSetToExercise(group)}
                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/10"
                      >
                        <FiPlus className="h-4 w-4" />
                        Añadir set
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsExerciseSelectorOpen(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 py-4 text-sm font-bold text-zinc-400 transition-all hover:border-karga-orange/40 hover:bg-karga-orange/5 hover:text-karga-orange"
            >
              <FiPlus className="h-4 w-4" />
              Buscar ejercicio
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-white/5 bg-black/20 p-5">
          <button
            type="button"
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-karga-orange py-4 font-black text-white shadow-lg shadow-karga-orange/20 transition-colors hover:bg-orange-600"
          >
            <FiSave className="h-5 w-5" />
            Guardar cambios
          </button>
        </div>
      </div>

      {isExerciseSelectorOpen && (
        <div
          className="fixed inset-0 z-[200]"
          onClick={(e) => e.stopPropagation()}
        >
          <ExerciseSelectorModal
            onClose={() => setIsExerciseSelectorOpen(false)}
            onSelect={handleSelectExercise}
          />
        </div>
      )}

      {activeExerciseForSet && (
        <div
          className="fixed inset-0 z-[200]"
          onClick={(e) => e.stopPropagation()}
        >
          <SetModal
            exercise={activeExerciseForSet}
            onClose={() => setActiveExerciseForSet(null)}
            onSaveOverride={handleSaveNewExerciseSet}
          />
        </div>
      )}
    </div>,
    document.body,
  );
};

const getSetId = (set) => {
  return set.set_id || set.id || set.tempId;
};
