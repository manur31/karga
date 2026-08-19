import { db, setSyncWrite } from '../db';
import { supabase } from '../supabaseClient';

function isNetworkError(err) {
  if (!navigator.onLine) return true;
  const msg = err?.message?.toLowerCase?.() || '';
  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    err?.name === 'TypeError'
  );
}

async function deleteRemoteRecords({
  supabaseTable,
  pkField,
  compositeKeys,
  toDelete,
}) {
  if (pkField === 'composite' && compositeKeys?.length) {
    for (const record of toDelete) {
      let query = supabase.from(supabaseTable).delete();
      for (const key of compositeKeys) {
        query = query.eq(key.remote, record[key.local]);
      }
      const { error } = await query;
      if (error) throw error;
    }
    return;
  }

  const ids = toDelete.map((r) => r.id);
  const { error } = await supabase
    .from(supabaseTable)
    .delete()
    .in(pkField, ids);
  if (error) throw error;
}

export async function pushEntity({
  table,
  supabaseTable,
  toSupabase,
  pkField = 'id',
  compositeKeys,
}) {
  const pending = await db[table].filter((r) => !r.synced).toArray();
  if (pending.length === 0) return { success: true };

  const toDelete = pending.filter((r) => r.deleted);
  const toUpsert = pending.filter((r) => !r.deleted);

  try {
    if (toDelete.length > 0) {
      await deleteRemoteRecords({
        supabaseTable,
        pkField,
        compositeKeys,
        toDelete,
      });

      setSyncWrite(true);
      try {
        await db[table].bulkDelete(toDelete.map((r) => r.id));
      } finally {
        setSyncWrite(false);
      }
    }

    if (toUpsert.length > 0) {
      const payload = toUpsert.map(toSupabase);
      const { error } = await supabase.from(supabaseTable).upsert(payload);
      if (error) throw error;

      setSyncWrite(true);
      try {
        await db.transaction('rw', db[table], async () => {
          for (const r of toUpsert) {
            await db[table].update(r.id, {
              synced: true,
              syncError: null,
            });
          }
        });
      } finally {
        setSyncWrite(false);
      }
    }

    return { success: true };
  } catch (err) {
    if (!isNetworkError(err)) {
      console.error(`Data error syncing ${table}:`, err);
      setSyncWrite(true);
      try {
        await db.transaction('rw', db[table], async () => {
          for (const r of pending) {
            await db[table].update(r.id, {
              syncError: err.message || String(err),
            });
          }
        });
      } finally {
        setSyncWrite(false);
      }
      // Do not retry data errors in a loop
      return { success: true };
    }

    console.error(`Network error syncing ${table}:`, err);
    return { success: false };
  }
}
