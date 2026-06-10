import { useAuth } from "../hooks/queries/useAuth";
import { useEffect, useState } from "react";
import { getExercises } from "../service/exersiseService";
import { useSetsStore } from "../stores/setsStore";
import { useForm } from "react-hook-form";
import { useWeightUnit } from "../hooks/useWeightUnit";

export default function SetsPage() {
  const [editingId, setEditingId] = useState(null);

  const { sets, addSet, removeSet, markAsSynced, editSet } = useSetsStore();
  const { unit, displayWeight } = useWeightUnit();

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    getValues,
    formState: { errors } 
  } = useForm({ mode: "all" });

  const pending = sets.filter((s) => !s.synced).length;
  const volume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  function onSubmit(data) {
    const w = parseFloat(data.weight);
    const r = parseInt(data.reps);
    if (editingId) {
      editSet(editingId, { weight: w, reps: r });
      setEditingId(null);
    } else {
      addSet({ weight: w, reps: r });
    }
    console.log(data)
    reset();
    console.log(getValues());
  }

  function handleEdit(s) {
    setEditingId(s.id);
    setValue("weight", s.weight);
    setValue("reps", s.reps);
  }

  function handleCancel() {
    setEditingId(null);
    reset();
  }

  function markAllSynced() {
    sets.filter((s) => !s.synced).forEach((s) => markAsSynced(s.id));
  }

  return (
    <div className="max-w-lg mx-auto p-6 font-sans">

      {/* Formulario */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {editingId ? "Editando set" : "Nuevo set"}
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2.5 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Peso (kg)</label>
              <input
                type="number"
                placeholder="0"
                step="0.5"
                className="h-9 px-3 border border-gray-300 rounded-lg text-sm text-black outline-none focus:border-gray-500 w-full"
                {...register("weight", {
                  required: true,
                  min: 0.1,
                  valueAsNumber: true,
                })}
              />
              {errors.weight && (
                <span className="text-[10px] text-red-500">Requerido</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Repeticiones</label>
              <input
                type="number"
                placeholder="0"
                step="1"
                className="h-9 px-3 border border-gray-300 rounded-lg text-sm text-black outline-none focus:border-gray-500 w-full"
                {...register("reps", {
                  required: true,
                  min: 1,
                  valueAsNumber: true,
                })}
              />
              {errors.reps && (
                <span className="text-[10px] text-red-500">Requerido</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {errors.weight || errors.reps ? (
                <span className="invisible text-[10px]">_</span>
              ) : null}
              <button
                type="submit"
                className="h-9 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap hover:bg-gray-700 transition-colors"
              >
                {editingId ? "Actualizar" : "+ Agregar"}
              </button>
            </div>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Sets totales</p>
          <p className="text-xl font-semibold text-gray-900">{sets.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Pendientes</p>
          <p className="text-xl font-semibold text-gray-900">{pending}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Volumen total</p>
          <p className="text-xl font-semibold text-gray-900">{displayWeight(volume)} {unit}</p>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex-1 m-0">
            Sets registrados
          </p>
          <button
            onClick={markAllSynced}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            ↺ Sync all
          </button>
        </div>

        {sets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No hay sets aún. Agrega uno arriba.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sets.map((s, i) => (
              <div
                key={s.id}
                className={`grid grid-cols-[28px_1fr_1fr_auto] items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                  editingId === s.id
                    ? "bg-gray-100 border-gray-400"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span className="text-[11px] text-gray-400 font-medium">
                  #{i + 1}
                </span>
                <span className="text-sm text-gray-900">
                  {displayWeight(s.weight)} <small className="text-gray-400">{unit}</small>
                </span>
                <span className="text-sm text-gray-900">
                  {s.reps} <small className="text-gray-400">reps</small>
                </span>
                <div className="flex gap-1.5 items-center">
                  {s.synced ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ synced
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => markAsSynced(s.id)}
                        className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-600 cursor-pointer hover:bg-white transition-colors"
                        title="Marcar como sincronizado"
                      >
                        ↺
                      </button>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        pending
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer text-sm px-1 transition-colors"
                    title="Editar set"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => removeSet(s.id)}
                    className="text-gray-300 hover:text-red-400 cursor-pointer text-sm px-1 transition-colors"
                    aria-label="Eliminar set"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}