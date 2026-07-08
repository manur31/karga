import Dexie from 'dexie';
import { scheduleSync } from './sync/syncScheduler';

export const db = new Dexie('KargaDB');

db.version(1).stores({
  sets: 'id, synced, deleted, createdAt',
  sessions: 'id, synced, deleted, createdAt',
  bodyEntries: 'id, synced, deleted, createdAt',
  routines: 'id, synced, deleted, createdAt',
  exercises: 'id, synced, deleted, createdAt',
  favoriteExercises: 'id, synced, deleted, createdAt',
  setsForExercise: 'id, synced, deleted, createdAt',
});

// Hook genérico de creación — se aplica igual a cada tabla
function attachCreatingHook(table) {
  db[table].hook('creating', (primKey, obj) => {
    obj.synced = obj.synced ?? false;
    obj.deleted = obj.deleted ?? false;
    obj.createdAt = obj.createdAt ?? new Date().toISOString();
    obj.updatedAt = new Date().toISOString();

    scheduleSync()
  });
}

// Hook genérico de actualización
function attachUpdatingHook(table) {
  db[table].hook('updating', (modifications) => {
    if (modifications.synced === undefined) {
        scheduleSync()
      return { synced: false, updatedAt: new Date().toISOString() };
    }
  });
}

['sets', 'sessions', 'bodyEntries', 'routines', 'exercises', 'favoriteExercises', 'setsForExercise'].forEach(table => {
  attachCreatingHook(table);
  attachUpdatingHook(table);
});