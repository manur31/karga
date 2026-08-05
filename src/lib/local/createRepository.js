import { db } from '../db';

export function createRepository(tableName) {
  const table = db[tableName];

  return {
    async add(data) {
      const id = crypto.randomUUID();
      await table.add({ id, ...data });
      return id;
    },

    async update(id, changes) {
      await table.update(id, changes);
    },

    async remove(id) {
      const record = await table.get(id);
      if (!record) return;

      if (!record.synced) {
        // nunca llegó al servidor, lo eliminamos directo
        await table.delete(id);
      } else {
        // ya existe en Supabase, hay que avisarle al sync
        await table.update(id, { deleted: true, synced: false });
      }
    },

    async getAll() {
      return table.where('deleted').equals(0).toArray();
    },

    async getPending() {
      return table.where('synced').equals(0).toArray();
    },
  };
}