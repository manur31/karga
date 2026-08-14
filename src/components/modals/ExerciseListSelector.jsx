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
