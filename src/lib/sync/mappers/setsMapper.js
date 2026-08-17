export function setToSupabase(set) {
  return {
    set_id: set.id,
    exercise_id: set.exerciseId,
    profile_id: set.profileId,
    weight: set.weight,
    rep: set.rep,
    duration: set.duration ?? 0,
    created_at: set.createdAt,
  };
}

export function setFromSupabase(row) {
  return {
    id: row.set_id,
    exerciseId: row.exercise_id,
    profileId: row.profile_id,
    weight: row.weight,
    rep: row.rep,
    duration: row.duration ?? 0,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}
