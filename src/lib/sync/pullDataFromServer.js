import { pullEntity } from './pullEntity';
import { syncableEntities } from './syncRegistry';

export async function pullDataFromServer() {
  await Promise.all(
    syncableEntities.map(entity => pullEntity(entity))
  );
}