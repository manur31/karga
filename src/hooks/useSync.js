import { useSetsStore } from "../stores/setsStore";
import { useCreateSet } from "../hooks/mutations/useSetsMutations";
import { useSessionStore } from "../stores/sessionStore";
import { useCreateSession } from "./mutations/useSesionsMutation";

function unFormatData(data, session = false) {
  if (session) {
    const { id, synced, createAt, ...rest } = data;
    return rest;
  }
  const { id, synced, ...rest } = data;
  return rest;
}

export const useSyncSets = (profile_id) => {
  const { getPendingSets, markAsSynced } = useSetsStore();
  const { mutateAsync: createSet } = useCreateSet(profile_id);

  const sync = async () => {
    const pendingSets = getPendingSets();
    if (pendingSets.length === 0) return;

    const setsToSync = pendingSets.map((set) => ({
      ...unFormatData(set),
      profile_id: set.profile_id || profile_id,
    }));

    try {
      await createSet(setsToSync);
      pendingSets.forEach((set) => {
        markAsSynced(set.id);
      });
    } catch (error) {
      console.error("Error syncing sets", error);
    }
  };

  return { sync };
};

export const useSyncSessions = (profile_id) => {
  const { getPendingSessions, replaceLocalSession } = useSessionStore();
  const { mutateAsync: createSession } = useCreateSession(profile_id);

  const sync = async () => {
    if (!profile_id) return;

    const pendingSessions = getPendingSessions();

    if (pendingSessions.length === 0) return;

    const sessionsToSync = pendingSessions.map((session) => ({
      profile_id,
      time_init: new Date(session.startedAt).toISOString(),
      time_end: session.finishedAt
        ? new Date(session.finishedAt).toISOString()
        : null,
      note: session.note || null,
    }));

    try {
      const createdSessions = await createSession(sessionsToSync);

      pendingSessions.forEach((localSession, index) => {
        replaceLocalSession(localSession.id, createdSessions[index]);
      });
    } catch (error) {
      console.log("Error syncing sessions", error);
    }
  };

  return { sync };
};
