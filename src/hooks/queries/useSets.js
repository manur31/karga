import { useLiveQuery } from 'dexie-react-hooks';
import { startOfWeek, endOfWeek } from 'date-fns';
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

export const useWeekSets = (profile_id, day) => {
  const data = useLiveQuery(async () => {
    if (!profile_id || !day) return [];

    const ref =
      typeof day === 'string' ? new Date(day + 'T00:00:00') : new Date(day);
    const start = startOfWeek(ref, { weekStartsOn: 1 }).getTime();
    const end = endOfWeek(ref, { weekStartsOn: 1 }).getTime();

    const [sets, exercises] = await Promise.all([
      setsRepository.getAll(),
      db.exercises.toArray(),
    ]);

    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    return sets
      .filter((s) => {
        if (s.profileId !== profile_id || !s.createdAt) return false;
        const t = new Date(s.createdAt).getTime();
        return t >= start && t <= end;
      })
      .map((s) => toUiSet(s, exerciseMap.get(s.exerciseId)));
  }, [profile_id, day]);

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
