import { db } from '../db';
import { supabase } from '../supabaseClient';

export async function pushEntity({ table, supabaseTable, toSupabase }) {
  const pending = await db[table].where('synced').equals(0).toArray();
  if (pending.length === 0) return { success: true };

  const toDelete = pending.filter(r => r.deleted);
  const toUpsert = pending.filter(r => !r.deleted);

  try {
    if (toDelete.length > 0) {
      const ids = toDelete.map(r => r.id);
      const { error } = await supabase.from(supabaseTable).delete().in('id', ids);
      if (error) throw error;
      await db[table].bulkDelete(ids);
    }

    if (toUpsert.length > 0) {
      const payload = toUpsert.map(toSupabase);
      const { error } = await supabase.from(supabaseTable).upsert(payload);
      if (error) throw error;

      await db.transaction('rw', db[table], async () => {
        for (const r of toUpsert) {
          await db[table].update(r.id, { synced: true });
        }
      });
    }

    return { success: true };
  } catch (err) {
    const isNetworkError = err.message?.includes('fetch') || !navigator.onLine;

    if (!isNetworkError) {
      console.error(`Error de datos sincronizando ${table}:`, err);
      await db.transaction('rw', db[table], async () => {
        for (const r of pending) {
          await db[table].update(r.id, { synced: false, syncError: err.message });
        }
      });
      return { success: true }; // no reintentar en bucle
    }

    console.error(`Error de red sincronizando ${table}:`, err);
    return { success: false };
  }
}