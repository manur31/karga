import { useLiveQuery } from 'dexie-react-hooks';
import { bodyProgressRepository } from '../../lib/local/bodyProgressRepository';
import { toUiBodyProgress } from '../../lib/local/uiMappers';

export const useBody = (profile_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id) return [];

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const cutoff = lastWeek.getTime();

    const entries = await bodyProgressRepository.getAll();
    return entries
      .filter((e) => {
        if (e.profileId !== profile_id) return false;
        return new Date(e.createdAt).getTime() >= cutoff;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map(toUiBodyProgress);
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};

export const useWeight = (profile_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id) return [];

    const entries = await bodyProgressRepository.getAll();
    return entries
      .filter(
        (e) =>
          e.profileId === profile_id &&
          e.weight !== null &&
          e.weight !== undefined,
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((e) => ({
        weight: e.weight,
        created_at: e.createdAt,
      }));
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};
