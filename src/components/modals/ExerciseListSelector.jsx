import { useState } from "react";
import { CheckIcon } from "../icons";
import { FiSearch } from "react-icons/fi";

export default function ExerciseListSelector({
  exercises,
  selectedExercises,
  routineExercises = [],
  isLoading,
  isError,
  onToggleExercise,
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
    </div>
  );
}
