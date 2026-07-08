// src/hooks/useSync.js
import { useEffect } from 'react';
import { db } from '../lib/db';
import { pullDataFromServer } from '../lib/sync/pullDataFromServer';
import { pushPendingData } from '../lib/sync/pushPendingData';
import { runSyncNow } from '../lib/sync/syncScheduler';
import { useLiveQuery } from 'dexie-react-hooks';

async function onAppOpen() {
  if (!navigator.onLine) return;

  const setsCount = await db.sets.count();
  
  console.log(setsCount)
  // cuando agregues más entidades, súmalas aquí:
  // const sessionsCount = await db.sessions.count();

  const dexieIsEmpty = setsCount === 0;

  if (dexieIsEmpty) {
    await pullDataFromServer();
  } else {
    await pushPendingData();
  }
}

export function useSync() {
  useEffect(() => {
    onAppOpen();

    function handleOnline() {
      runSyncNow();
    }

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
}

// import { useSetsStore } from '../stores/setsStore'
// import { useCreateSet } from '../hooks/mutations/useSetsMutations'
// import { useSesionStore } from '../stores/sesionStore'
// import { useCreateSession } from './mutations/useSesionsMutation'
// import { se } from 'date-fns/locale'

// function unFormatData(data, session = false) {
//     if (session) {
//         const { id, synced, createAt, ...rest } = data
//         return rest
//     }
//     const { id, synced, ...rest } = data
//     return rest
// }

// export const useSyncSets = (profile_id) => {
//     const { getPendingSets, markAsSynced } = useSetsStore()
//     const { mutateAsync: createSet } = useCreateSet(profile_id)

//     const sync = async () => {
//         const pendingSets = getPendingSets()
//         if (pendingSets.length === 0) return 

//         const setsToSync = pendingSets.map(set => ({
//             ...unFormatData(set),
//             profile_id: set.profile_id || profile_id
//         }))
        
//         try {
//             await createSet(setsToSync)
//             pendingSets.forEach(set => {
//                 markAsSynced(set.id)
//             })
//         } catch (error) {
//             console.error('Error syncing sets', error)
//         }
//     }

//     return { sync }
// }

// export const useSyncSessions = (profile_id) => {
//     const { getPendingSessions, markAsSynced } = useSesionStore()
//     const { mutateAsync: createSession } = useCreateSession(profile_id)

//     const sync = async () => {
//         const pendingSessions = getPendingSessions()
//         if (pendingSessions.length === 0) return 

//         const sessionsToSync = pendingSessions.map(session => {
//             const created_at = session.created_at || session.createAt || session.startedAt || new Date();
//             const startedAt = session.startedAt || new Date();
//             const finishedAt = session.finishedAt || new Date();

//             return {
//                 startedAt: new Date(startedAt).toISOString(),
//                 finishedAt: new Date(finishedAt).toISOString(),
//                 created_at: new Date(created_at).toISOString(),
//                 profile_id: session.profile_id || profile_id,
//                 note: session.note || null
//             };
//         });
        
//         try {
//             await createSession(sessionsToSync)
//             pendingSessions.forEach(session => {
//                 markAsSynced(session.id)
//             })
//         } catch (error) {
//             console.error('Error syncing sessions', error)
//         }
//     }

//     return { sync }
// }
