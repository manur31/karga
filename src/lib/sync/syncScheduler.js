import { pushPendingData } from './pushPendingData';

const SYNC_DELAY = 45 * 60 * 1000; // 45 minutes
const RETRY_DELAY = 2 * 60 * 1000; // 2 minutes on network failure

let scheduledTimeoutId = null;

async function executeSync() {
  scheduledTimeoutId = null;
  if (!navigator.onLine) return;

  const result = await pushPendingData();

  if (!result.success) {
    scheduledTimeoutId = setTimeout(executeSync, RETRY_DELAY);
  }
}

export function scheduleSync() {
  if (scheduledTimeoutId !== null) return;
  scheduledTimeoutId = setTimeout(executeSync, SYNC_DELAY);
}

export function cancelScheduledSync() {
  if (scheduledTimeoutId !== null) {
    clearTimeout(scheduledTimeoutId);
    scheduledTimeoutId = null;
  }
}

export function runSyncNow() {
  cancelScheduledSync();
  if (navigator.onLine) {
    return executeSync();
  }
}
