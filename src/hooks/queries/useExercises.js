import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { userExercisesRepository } from '../../lib/local/userExercisesRepository';
import { toUiExercise, toUiUserExercise } from '../../lib/local/uiMappers';

/**
 * Popular exercises not already in the user's library
 * (matches previous Supabase query shape).
 */
export const useExercises = (profile_id) => {
  const data = useLiveQuery(async () => {
    const [exercises, userExercises] = await Promise.all([
      db.exercises.toArray(),
      profile_id ? userExercisesRepository.getAll() : Promise.resolve([]),
    ]);

    const ownedIds = new Set(
      userExercises
        .filter((ue) => ue.profileId === profile_id)
        .map((ue) => ue.exerciseId),
    );

    return exercises
      .filter((e) => e.isPopulary === true && !ownedIds.has(e.id))
      .map(toUiExercise);
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
    isError: false,
  };
};

export const useFavoriteExercises = (profile_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id) return [];

    const [userExercises, exercises] = await Promise.all([
      userExercisesRepository.getAll(),
      db.exercises.toArray(),
    ]);

    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    return userExercises
      .filter((ue) => ue.profileId === profile_id)
      .map((ue) => toUiUserExercise(ue, exerciseMap.get(ue.exerciseId)));
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
    isError: false,
  };
};
