import { useMutation } from '@tanstack/react-query';
import { routinesRepository } from '../../lib/local/routinesRepository';
import { routinesExercisesRepository } from '../../lib/local/routinesExercisesRepository';
import { profileRepository } from '../../lib/local/profileRepository';
import { getCachedProfile } from '../../storage/profile-storage';

export const useCreateRoutines = (profile_id) => {
  return useMutation({
    mutationFn: async (data) => {
      const pid = data.profile_id || profile_id;
      const id = await routinesRepository.add({
        profileId: pid,
        name: data.name,
        description: data.description ?? null,
      });

      // Return shape components expect (routine_id)
      return {
        routine_id: id,
        id,
        name: data.name,
        description: data.description ?? null,
        profile_id: pid,
      };
    },
  });
};

export const useInsertExercisesRoutine = (profile_id) => {
  return useMutation({
    mutationFn: async (data) => {
      const pid = data.profile_id || profile_id;
      let restTime = data.rest_time;

      if (restTime == null) {
        const profile =
          (await profileRepository.getById(pid)) || getCachedProfile();
        restTime =
          profile?.restTime ?? profile?.rest_time ?? 60;
      }

      const id = `${data.routine_id}_${data.id_exercises}`;
      await routinesExercisesRepository.add({
        id,
        routineId: data.routine_id,
        exerciseId: data.id_exercises,
        orden: data.orden ?? 0,
        restTime,
      });

      return [{ id, routine_id: data.routine_id, id_exercises: data.id_exercises }];
    },
  });
};

export const useDeleteRoutines = () => {
  return useMutation({
    mutationFn: async (routine_id) => {
      // Soft/hard delete linked routine exercises first
      const allRe = await routinesExercisesRepository.getAll();
      const linked = allRe.filter((re) => re.routineId === routine_id);
      for (const re of linked) {
        await routinesExercisesRepository.remove(re.id);
      }
      await routinesRepository.remove(routine_id);
    },
  });
};

export const useEditRoutines = () => {
  return useMutation({
    mutationFn: async (data) => {
      const routineId = data.routine_id || data.id;
      await routinesRepository.update(routineId, {
        name: data.name,
        description: data.description,
      });
      return {
        routine_id: routineId,
        name: data.name,
        description: data.description,
      };
    },
  });
};

export const useDeleteExercisesRoutine = () => {
  return useMutation({
    mutationFn: async ({ routine_id, id_exercises }) => {
      const ids = Array.isArray(id_exercises) ? id_exercises : [id_exercises];
      const allRe = await routinesExercisesRepository.getAll();

      for (const re of allRe) {
        if (re.routineId === routine_id && ids.includes(re.exerciseId)) {
          await routinesExercisesRepository.remove(re.id);
        }
      }
    },
  });
};
