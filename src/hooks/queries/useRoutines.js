import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { routinesRepository } from '../../lib/local/routinesRepository';
import { routinesExercisesRepository } from '../../lib/local/routinesExercisesRepository';
import { toUiRoutine } from '../../lib/local/uiMappers';

export const useRoutines = (profile_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id) return [];

    const [routines, allRe, exercises] = await Promise.all([
      routinesRepository.getAll(),
      routinesExercisesRepository.getAll(),
      db.exercises.toArray(),
    ]);

    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
    const reByRoutine = new Map();

    for (const re of allRe) {
      if (!reByRoutine.has(re.routineId)) {
        reByRoutine.set(re.routineId, []);
      }
      reByRoutine.get(re.routineId).push(re);
    }

    return routines
      .filter((r) => r.profileId === profile_id)
      .map((r) =>
        toUiRoutine(r, reByRoutine.get(r.id) || [], exerciseMap),
      );
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};
