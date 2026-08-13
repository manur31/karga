export function profileToSupabase(profile) {
  return {
    profile_id: profile.id,
    created_at: profile.createdAt,
    name: profile.name ?? null,
    email: profile.email ?? null,
    weight: profile.weight ?? null,
    size: profile.size ?? null,
    time_for_week: profile.timeForWeek ?? null,
    rest_time: profile.restTime ?? null,
  };
}

export function profileFromSupabase(row) {
  return {
    id: row.profile_id,
    createdAt: row.created_at,
    name: row.name ?? null,
    email: row.email ?? null,
    weight: row.weight ?? null,
    size: row.size ?? null,
    timeForWeek: row.time_for_week ?? null,
    restTime: row.rest_time ?? null,
    updatedAt: row.created_at,
  };
}
