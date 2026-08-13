export function userExerciseToSupabase(row) {
  return {
    id: row.id,
    created_at: row.createdAt,
    profile_id: row.profileId,
    exercise_id: row.exerciseId,
    is_favorite: row.isFavorite ?? true,
  };
}

export function userExerciseFromSupabase(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    profileId: row.profile_id,
    exerciseId: row.exercise_id,
    isFavorite: row.is_favorite ?? false,
    updatedAt: row.created_at,
  };
}
