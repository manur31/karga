export function bodyProgressToSupabase(entry) {
  return {
    id: entry.id,
    created_at: entry.createdAt,
    profile_id: entry.profileId,
    weight: entry.weight,
    sets_id: entry.setsId ?? null,
  };
}

export function bodyProgressFromSupabase(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    profileId: row.profile_id,
    weight: row.weight,
    setsId: row.sets_id ?? null,
    updatedAt: row.created_at,
  };
}
