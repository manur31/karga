import { setsRepository } from './setsRepository';
import { toUiSet } from './uiMappers';

function byCreatedAtDesc(a, b) {
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

/**
 * Latest set for an exercise (UI shape).
 */
export async function getLastSetForExercise(exerciseId, profileId) {
  if (!exerciseId) return null;

  const sets = await setsRepository.getAll();
  const filtered = sets
    .filter((s) => {
      if (s.exerciseId !== exerciseId) return false;
      if (profileId && s.profileId !== profileId) return false;
      return true;
    })
    .sort(byCreatedAtDesc);

  if (!filtered.length) return null;
  return toUiSet(filtered[0]);
}

/**
 * All sets from the most recent training day for an exercise (UI shape, chronological).
 */
export async function getPreviousSessionSetsForExercise(exerciseId, profileId) {
  if (!exerciseId) return [];

  const sets = await setsRepository.getAll();
  const filtered = sets
    .filter((s) => {
      if (s.exerciseId !== exerciseId) return false;
      if (profileId && s.profileId !== profileId) return false;
      return true;
    })
    .sort(byCreatedAtDesc);

  if (!filtered.length) return [];

  const lastDay = new Date(filtered[0].createdAt).toDateString();
  return filtered
    .filter((s) => new Date(s.createdAt).toDateString() === lastDay)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((s) => toUiSet(s));
}
