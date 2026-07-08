export function setToSupabase(set) {
  return {
    set_id: set.id,
    exercise_id: set.exerciseId,
    profile_id: set.profileId,
    weight: set.weight,
    reps: set.reps,
    created_at: set.createdAt,
  };
}

export function setFromSupabase(row) {
  return {
    id: row.set_id,
    exerciseId: row.exercise_id,
    profile_id: row.profile_id,
    weight: row.weight,
    reps: row.reps,
    createdAt: row.created_at,
  };
}