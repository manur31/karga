import Dexie from 'dexie';
import { scheduleSync } from './sync/syncScheduler';

export const db = new Dexie('KargaDB');

// Flag set by the sync layer so hooks do not re-schedule during pull/push writes
export let isSyncWrite = false;

export function setSyncWrite(value) {
  isSyncWrite = value;
}

db.version(2).stores({
  sets: 'id, synced, deleted, createdAt, profileId, exerciseId',
  sessions: 'id, synced, deleted, createdAt, profileId, startedAt',
  bodyProgress: 'id, synced, deleted, createdAt, profileId',
  routines: 'id, synced, deleted, createdAt, profileId',
  routinesExercises: 'id, synced, deleted, createdAt, routineId, exerciseId',
  userExercises: 'id, synced, deleted, createdAt, profileId, exerciseId',
  profile: 'id, synced, deleted, createdAt',
  exercises: 'id, isPopulary, name',
});

const SYNCABLE_TABLES = [
  'sets',
  'sessions',
  'bodyProgress',
  'routines',
  'routinesExercises',
  'userExercises',
  'profile',
];

function attachCreatingHook(table) {
  db[table].hook('creating', (_primKey, obj) => {
    obj.synced = obj.synced ?? false;
    obj.deleted = obj.deleted ?? false;
    obj.createdAt = obj.createdAt ?? new Date().toISOString();
    obj.updatedAt = obj.updatedAt ?? new Date().toISOString();
    obj.syncError = obj.syncError ?? null;

    if (!isSyncWrite) {
      scheduleSync();
    }
  });
}

function attachUpdatingHook(table) {
  db[table].hook('updating', (modifications) => {
    // Explicit sync status writes come from the sync layer — do not reschedule
    if (modifications.synced !== undefined) {
      return;
    }

    if (!isSyncWrite) {
      scheduleSync();
    }

    return {
      synced: false,
      updatedAt: new Date().toISOString(),
      syncError: null,
    };
  });
}

SYNCABLE_TABLES.forEach((table) => {
  attachCreatingHook(table);
  attachUpdatingHook(table);
});
