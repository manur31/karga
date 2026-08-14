import { useState } from "react";
import { CheckIcon, PlusIcon } from "../icons";
import { FiSearch } from "react-icons/fi";

export default function ExerciseListSelector({
  exercises,
  selectedExercises,
  routineExercises = [], // Optional: for exercises already in a routine
  isLoading,
  isError,
  onToggleExercise,
  onCreateCustomExercise,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const sanitizedQuery = searchQuery.trim().toLowerCase();

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(sanitizedQuery)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end mb-1 pl-1">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Ejercicios disponibles
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-karga-orange font-bold">
            {selectedExercises.length} seleccionados
          </span>
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <FiSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="mb-2 animate-fade-in">
          <input
            type="text"
            placeholder="Ej: Peso muerto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input-bg border border-transparent rounded-2xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-karga-orange transition-colors font-medium shadow-inner"
          />
        </div>
      )}

      {isLoading && exercises.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-red-400 text-sm text-center p-4 bg-red-500/10 rounded-2xl border border-red-500/10 font-medium">
          Error al cargar los ejercicios.
        </div>
      ) : (
        filteredExercises &&
        filteredExercises.map((exercise) => {
          const alreadyInRoutine = routineExercises.some(
            (re) => re.id_exercises === exercise.id
          );
          const isSelected = selectedExercises.includes(exercise.id);

          return (
            <div
              key={exercise.id}
              onClick={() => {
                if (alreadyInRoutine) return;
                onToggleExercise(exercise.id);
              }}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                alreadyInRoutine
                  ? "opacity-40 cursor-not-allowed bg-black/20 border-transparent"
                  : isSelected
                  ? "bg-karga-gray border-green-500/50 shadow-lg shadow-green-500/5 cursor-pointer"
                  : "bg-karga-gray border-transparent hover:bg-white/2 cursor-pointer"
              }`}
            >
              <div className="flex flex-col flex-1 pr-4">
                <span className="text-[15px] text-zinc-100 font-bold tracking-tight">
                  {exercise.name}
                </span>
                <span className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                  {alreadyInRoutine ? (
                    "Ya está en la rutina"
                  ) : (
                    <span className="capitalize">
                      {Array.isArray(exercise.muscle)
                        ? exercise.muscle.join(" - ")
                        : exercise.muscle}
                    </span>
                  )}
                </span>
              </div>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 ${
                  alreadyInRoutine
                    ? "border-transparent"
                    : isSelected
                    ? "border-green-500 bg-green-500/10 scale-105"
                    : "border-zinc-600 bg-transparent"
                }`}
              >
                {alreadyInRoutine ? (
                  <CheckIcon className="w-4 h-4 text-zinc-500" />
                ) : isSelected ? (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                ) : null}
              </div>
            </div>
          );
        })
      )}

export default function ExerciseListSelector({
  exercises = [],
  selectedExercises = [],
  routineExercises = [],
  isLoading = false,
  isError = false,
  onToggleExercise,
  onExerciseClick,
}) {
  const routineExerciseIds = new Set(
    (routineExercises || [])
      .map((re) => re.id_exercises || re.exerciseId || re.exercises?.id)
      .filter(Boolean),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-400 text-sm font-medium">
        Error al cargar ejercicios
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm font-medium border border-dashed border-white/10 rounded-2xl">
        No hay ejercicios disponibles
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {exercises.map((exercise) => {
        const alreadyInRoutine = routineExerciseIds.has(exercise.id);
        const isSelected = selectedExercises.includes(exercise.id);

        return (
          <button
            key={exercise.id}
            type="button"
            disabled={alreadyInRoutine}
            onClick={() => {
              if (alreadyInRoutine) return;
              if (onToggleExercise) onToggleExercise(exercise.id);
              else if (onExerciseClick) onExerciseClick(exercise);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-colors ${
              alreadyInRoutine
                ? 'bg-white/5 border-transparent opacity-40 cursor-not-allowed'
                : isSelected
                  ? 'bg-karga-orange/15 border-karga-orange/40'
                  : 'bg-input-bg border-transparent hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-bold text-white tracking-tight truncate">
                  {exercise.name}
                </span>
                <span className="text-[11px] text-zinc-500 font-semibold capitalize mt-0.5">
                  {Array.isArray(exercise.muscle)
                    ? exercise.muscle.join(' - ')
                    : exercise.muscle}
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected || alreadyInRoutine
                    ? 'bg-karga-orange border-karga-orange'
                    : 'border-zinc-500'
                }`}
              >
                {(isSelected || alreadyInRoutine) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
