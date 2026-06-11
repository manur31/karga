import { useSetsStore } from '../stores/setsStore'
import { useCreateSet } from '../hooks/mutations/useSetsMutations'
import { useSesionStore } from '../stores/sesionStore'
import { useCreateSession } from './mutations/useSesionsMutation'
import { se } from 'date-fns/locale'

function unFormatData(data, session = false) {
    if (session) {
        const { id, synced, createAt, ...rest } = data
        return rest
    }
    const { id, synced, ...rest } = data
    return rest
}

export const useSyncSets = (profile_id) => {
    const { getPendingSets, markAsSynced } = useSetsStore()
    const { mutate: createSet, isError, isSuccess } = useCreateSet(profile_id)

    const sync = () => {
        const pendingSets = getPendingSets()
        if (pendingSets.length === 0) return 

        const setsToSync = pendingSets.map(set => unFormatData(set))
        
        createSet(setsToSync)

        if (isError) {
            console.error('Error syncing sets')
            return
        }

        if (isSuccess) {
            pendingSets.forEach(set => {
                markAsSynced(set.id)
            })
        }
    }

    return { sync }
}

export const useSyncSessions = (profile_id) => {
    const { getPendingSessions, markAsSynced } = useSesionStore()
    const { mutate: createSession, isError, isSuccess } = useCreateSession(profile_id)

    const sync = () => {
        const pendingSessions = getPendingSessions()
        if (pendingSessions.length === 0) return 

        const sessionsToSync = pendingSessions.map(session => unFormatData(session, session = true))
        
        createSession(sessionsToSync)

        if (isError) {
            console.error('Error syncing sessions')
            return
        }

        if (isSuccess) {
            pendingSessions.forEach(session => {
                markAsSynced(session.id)
            })
        }
    }

    return { sync }
}
