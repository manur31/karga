import { useLiveQuery } from 'dexie-react-hooks';
import { startOfWeek, endOfWeek } from 'date-fns';
import { sessionsRepository } from '../../lib/local/sessionsRepository';
import { toUiSession } from '../../lib/local/uiMappers';

export const useSessions = (profile_id) => {
  const data = useLiveQuery(async () => {
    if (!profile_id) return [];

    const sessions = await sessionsRepository.getAll();
    return sessions
      .filter((s) => s.profileId === profile_id)
      .map(toUiSession);
  }, [profile_id]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};

export const useWeekActivity = (profile_id, day) => {
  const data = useLiveQuery(async () => {
    if (!profile_id || !day) return [];

    const ref =
      typeof day === "string" ? new Date(day + "T00:00:00") : new Date(day);
    const start = startOfWeek(ref, { weekStartsOn: 1 }).getTime();
    const end = endOfWeek(ref, { weekStartsOn: 1 }).getTime();

    const sessions = await sessionsRepository.getAll();
    return sessions
      .filter((s) => {
        if (s.profileId !== profile_id || !s.startedAt) return false;
        const t = new Date(s.startedAt).getTime();
        return t >= start && t <= end;
      })
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
      )
      .map(toUiSession);
  }, [profile_id, day]);

  return {
    data: data ?? [],
    isLoading: data === undefined,
    error: null,
  };
};
