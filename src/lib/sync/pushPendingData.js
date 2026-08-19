import { db } from '../db';
import { supabase } from '../supabaseClient';
import { pushEntity } from './pushEntity';
import { syncableEntities, exerciseToSupabase } from './syncRegistry';

/**
 * Custom (non-popular) exercises are created locally and must exist on the
 * server before user_exercises / sets FKs can succeed. Push them first.
 */
async function pushCustomExercises() {
  const custom = await db.exercises
    .filter((e) => e.isPopulary === false)
    .toArray();

  if (custom.length === 0) return { success: true };

  try {
    const payload = custom.map(exerciseToSupabase);
    const { error } = await supabase.from('exercises').upsert(payload);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    const isNetwork =
      !navigator.onLine ||
      err?.message?.toLowerCase?.().includes('fetch') ||
      err?.name === 'TypeError';

    if (!isNetwork) {
      console.error('Data error pushing custom exercises:', err);
      return { success: true };
    }
    console.error('Network error pushing custom exercises:', err);
    return { success: false };
  }
}

export async function pushPendingData() {
  const customResult = await pushCustomExercises();
  if (!customResult.success) return { success: false };

  // Order matters for FKs: profile → routines → routinesExercises → userExercises → sets/sessions/body
  const order = [
    'profile',
    'routines',
    'routinesExercises',
    'userExercises',
    'sessions',
    'sets',
    'bodyProgress',
  ];

  const byTable = Object.fromEntries(
    syncableEntities.map((e) => [e.table, e]),
  );

  const results = [];
  for (const table of order) {
    const entity = byTable[table];
    if (!entity) continue;
    results.push(await pushEntity(entity));
  }

  // Any entity not in the ordered list
  for (const entity of syncableEntities) {
    if (!order.includes(entity.table)) {
      results.push(await pushEntity(entity));
    }
  }

  return { success: results.every((r) => r.success) };
}
