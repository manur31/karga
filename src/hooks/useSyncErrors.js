import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

const TABLES = [
  'sets',
  'sessions',
  'bodyProgress',
  'routines',
  'routinesExercises',
  'userExercises',
  'profile',
];

/**
 * Live list of local records that failed to sync (data errors).
 */
export function useSyncErrors() {
  const errors = useLiveQuery(async () => {
    const results = [];

    for (const table of TABLES) {
      const rows = await db[table]
        .filter((r) => !!r.syncError)
        .toArray();

      for (const row of rows) {
        results.push({
          table,
          id: row.id,
          syncError: row.syncError,
          updatedAt: row.updatedAt,
        });
      }
    }

    return results;
  }, []);

  return {
    data: errors ?? [],
    isLoading: errors === undefined,
    hasErrors: (errors?.length ?? 0) > 0,
  };
}
