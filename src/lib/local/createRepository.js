import { db } from '../db';

export function createRepository(tableName) {
  const table = db[tableName];

  return {
    async add(data = {}) {
      const { id: incomingId, ...rest } = data;
      const id =
        incomingId !== undefined && incomingId !== null && incomingId !== ''
          ? incomingId
          : crypto.randomUUID();

      // `id` must win over any leftover undefined from callers
      await table.add({ ...rest, id });
      return id;
    },

    async update(id, changes) {
      await table.update(id, changes);
    },

    async remove(id) {
      const record = await table.get(id);
      if (!record) return;

      if (!record.synced) {
        await table.delete(id);
      } else {
        await table.update(id, { deleted: true, synced: false });
      }
    },

    async getAll() {
      return table.filter((r) => !r.deleted).toArray();
    },

    async getPending() {
      return table.filter((r) => !r.synced).toArray();
    },

    async getById(id) {
      const record = await table.get(id);
      if (!record || record.deleted) return null;
      return record;
    },

    async bulkDelete(ids) {
      if (!ids?.length) return;
      await table.bulkDelete(ids);
    },
  };
}
