export function routineExerciseToSupabase(row) {
  return {
    routine_id: row.routineId,
    id_exercises: row.exerciseId,
    orden: row.orden ?? 0,
    created_at: row.createdAt,
    rest_time: row.restTime ?? null,
  };
}

export function routineExerciseFromSupabase(row) {
  // Deterministic id so pull/push never duplicate the composite server key
  const id = `${row.routine_id}_${row.id_exercises}`;
  return {
    id,
    routineId: row.routine_id,
    exerciseId: row.id_exercises,
    orden: row.orden ?? 0,
    createdAt: row.created_at,
    restTime: row.rest_time ?? null,
    updatedAt: row.created_at,
  };
}
