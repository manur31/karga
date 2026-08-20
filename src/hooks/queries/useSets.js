import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { setsRepository } from '../../lib/local/setsRepository';
import { toUiSet } from '../../lib/local/uiMappers';

export const useSets = (profile_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id) return [];

    const [sets, exercises] = await Promise.all([
      setsRepository.getAll(),
      db.exercises.toArray(),
    ]);

    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    return sets
      .filter((s) => s.profileId === profile_id)
      .map((s) => toUiSet(s, exerciseMap.get(s.exerciseId)));
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};

export const useSetsForExercise = (profile_id, exercise_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id || !exercise_id) return [];

    const [sets, exercise] = await Promise.all([
      setsRepository.getAll(),
      db.exercises.get(exercise_id),
    ]);
 
    return sets
      .filter(
        (s) => s.profileId === profile_id && s.exerciseId === exercise_id,
      )
      .map((s) => toUiSet(s, exercise));
  }, [profile_id, exercise_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};
