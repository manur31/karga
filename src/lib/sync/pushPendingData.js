// src/lib/sync/pushPendingData.js
import { pushEntity } from './pushEntity';
import { syncableEntities } from './syncRegistry';

export async function pushPendingData() {
  const results = await Promise.all(
    syncableEntities.map(entity => pushEntity(entity))
  );
  return { success: results.every(r => r.success) };
}