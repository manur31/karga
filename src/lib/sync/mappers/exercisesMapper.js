export function exerciseFromSupabase(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    description: row.description ?? null,
    image: row.image ?? null,
    muscle: row.muscle ?? [],
    isPopulary: row.is_populary ?? false,
  };
}

// exercises are read-only — no toSupabase for normal sync.
// Custom (non-popular) exercises still need an upsert path when created offline.
export function exerciseToSupabase(exercise) {
  return {
    id: exercise.id,
    created_at: exercise.createdAt,
    name: exercise.name,
    description: exercise.description ?? null,
    image: exercise.image ?? null,
    muscle: exercise.muscle ?? [],
    is_populary: exercise.isPopulary ?? false,
  };
}
