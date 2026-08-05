import { useMutation } from '@tanstack/react-query';
import { setsRepository } from '../../lib/local/setsRepository';
import { useSessionStore } from '../../stores/sessionStore';

export const useCreateSet = (_profile_id) => {
  return useMutation({
    mutationFn: async (data) => {
      const items = Array.isArray(data) ? data : [data];
      const ids = [];

      for (const item of items) {
        const id = await setsRepository.add({
          profileId: item.profile_id || item.profileId || _profile_id,
          exerciseId: item.exercise_id || item.exerciseId,
          weight: item.weight,
          rep: item.rep ?? item.reps ?? 0,
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        });
        ids.push(id);

        // Track sets belonging to the active session (ephemeral)
        const session = useSessionStore.getState();
        if (session.isStarted) {
          session.addSessionSetId(id);
        }
      }

      return ids;
    },
  });
};

export const useDeleteSet = () => {
  return useMutation({
    mutationFn: async (set_id) => {
      await setsRepository.remove(set_id);
    },
  });
};

export const useUpdateSet = () => {
  return useMutation({
    mutationFn: async ({ set_id, rep, weight }) => {
      await setsRepository.update(set_id, {
        rep,
        weight,
      });
    },
  });
};
