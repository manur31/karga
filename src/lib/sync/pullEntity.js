import { db, setSyncWrite } from '../db';
import { supabase } from '../supabaseClient';

export async function pullEntity({
  table,
  supabaseTable,
  fromSupabase,
  readOnly = false,
}) {
  const { data, error } = await supabase.from(supabaseTable).select('*');
  if (error) throw error;
  if (!data?.length) return;

  const mapped = data.map((row) => {
    const base = fromSupabase(row);
    if (readOnly) {
      return base;
    }
    return {
      ...base,
      synced: true,
      deleted: false,
      syncError: null,
    };
  });

  setSyncWrite(true);
  try {
    await db[table].bulkPut(mapped);
  } finally {
    setSyncWrite(false);
  }
}
