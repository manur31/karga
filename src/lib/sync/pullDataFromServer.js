import { pullEntity } from './pullEntity';
import { syncableEntities, pullOnlyEntities } from './syncRegistry';

export async function pullDataFromServer() {
  // Catalog first so joins work after user data lands
  for (const entity of pullOnlyEntities) {
    await pullEntity(entity);
  }

  for (const entity of syncableEntities) {
    await pullEntity(entity);
  }
}
