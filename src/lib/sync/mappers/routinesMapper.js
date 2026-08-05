export function routineToSupabase(routine) {
  return {
    routine_id: routine.id,
    created_at: routine.createdAt,
    profile_id: routine.profileId,
    name: routine.name,
    description: routine.description ?? null,
  };
}

export function routineFromSupabase(row) {
  return {
    id: row.routine_id,
    createdAt: row.created_at,
    profileId: row.profile_id,
    name: row.name,
    description: row.description ?? null,
    updatedAt: row.created_at,
  };
}
