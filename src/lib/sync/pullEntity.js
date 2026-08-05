import { db } from '../db';
import { supabase } from '../supabaseClient';

export async function pullEntity({ table, supabaseTable, fromSupabase }) {
  const { data, error } = await supabase.from(supabaseTable).select('*');
  if (error) throw error;

  console.log('Sets desde Supabase:', data)

  const mapped = data.map(row => ({
    ...fromSupabase(row),
    synced: true,
    deleted: false,
  }));

  console.log(mapped)

  try {
    const result = await db[table].bulkPut(mapped);
    console.log('Result:', result);
  } catch (err) {
    console.error(`Error de datos sincronizando ${table}:`, err);
    throw err;
  }
}