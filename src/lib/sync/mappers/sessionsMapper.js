export function sessionToSupabase(session) {
  return {
    session_id: session.id,
    created_at: session.createdAt,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    profile_id: session.profileId,
    note: session.note ?? null,
  };
}

export function sessionFromSupabase(row) {
  return {
    id: row.session_id,
    createdAt: row.created_at,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    profileId: row.profile_id,
    note: row.note ?? null,
    updatedAt: row.created_at,
  };
}
