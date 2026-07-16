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
  const { getPendingSessions, markAsSynced } = useSessionStore();
  const { mutateAsync: createSession } = useCreateSession(profile_id);

  const sync = async () => {
    const pendingSessions = getPendingSessions();
    if (pendingSessions.length === 0) return;

    const sessionsToSync = pendingSessions.map((session) => {
      const rest = unFormatData(session, true);
      const created_at =
        rest.created_at ||
        rest.createAt ||
        rest.startedAt ||
        new Date();
      const startedAt = rest.startedAt || new Date();
      const finishedAt = rest.finishedAt || new Date();

      return {
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date(finishedAt).toISOString(),
        created_at: new Date(created_at).toISOString(),
        profile_id: rest.profile_id || profile_id,
        note: rest.note || null,
      };
    });


    try {
      await createSession(sessionsToSync);
      pendingSessions.forEach((session) => {
        markAsSynced(session.id);
      });
    } catch (error) {
      console.error("Error syncing sessions", error);
    }
  };

  return { sync };
};
