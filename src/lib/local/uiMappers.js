/**
 * Map Dexie (camelCase) records → shapes components already consume (snake_case + joins).
 */

export function toUiExercise(exercise) {
  if (!exercise) return null;
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

export function toUiSet(set, exercise = null) {
  return {
    id: set.id,
    set_id: set.id,
    exercise_id: set.exerciseId,
    profile_id: set.profileId,
    weight: set.weight,
    rep: set.rep,
    created_at: set.createdAt,
    synced: set.synced,
    deleted: set.deleted,
    syncError: set.syncError,
    exercises: exercise ? toUiExercise(exercise) : null,
  };
}

export function toUiSession(session) {
  return {
    id: session.id,
    session_id: session.id,
    created_at: session.createdAt,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    profile_id: session.profileId,
    note: session.note ?? null,
    synced: session.synced,
    deleted: session.deleted,
    syncError: session.syncError,
  };
}

export function toUiBodyProgress(entry) {
  return {
    id: entry.id,
    created_at: entry.createdAt,
    profile_id: entry.profileId,
    weight: entry.weight,
    sets_id: entry.setsId ?? null,
    synced: entry.synced,
  };
}

export function toUiRoutine(routine, routineExercises = [], exerciseMap = new Map()) {
  return {
    id: routine.id,
    routine_id: routine.id,
    created_at: routine.createdAt,
    profile_id: routine.profileId,
    name: routine.name,
    description: routine.description ?? null,
    synced: routine.synced,
    routines_exercises: routineExercises
      .slice()
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((re) => ({
        id: re.id,
        routine_id: re.routineId,
        id_exercises: re.exerciseId,
        orden: re.orden ?? 0,
        created_at: re.createdAt,
        rest_time: re.restTime ?? null,
        exercises: toUiExercise(exerciseMap.get(re.exerciseId)),
      })),
  };
}

export function toUiUserExercise(ue, exercise = null) {
  return {
    id: ue.id,
    created_at: ue.createdAt,
    profile_id: ue.profileId,
    exercise_id: ue.exerciseId,
    is_favorite: ue.isFavorite ?? false,
    synced: ue.synced,
    exercises: exercise ? toUiExercise(exercise) : null,
  };
}

export function toUiProfile(profile) {
  if (!profile) return null;
  return {
    profile_id: profile.id,
    created_at: profile.createdAt,
    name: profile.name,
    email: profile.email,
    weight: profile.weight,
    size: profile.size,
    time_for_week: profile.timeForWeek,
    rest_time: profile.restTime,
  };
}
