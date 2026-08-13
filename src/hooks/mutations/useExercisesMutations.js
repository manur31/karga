import { useMutation } from '@tanstack/react-query';
import { db, setSyncWrite } from '../../lib/db';
import { userExercisesRepository } from '../../lib/local/userExercisesRepository';
import { scheduleSync } from '../../lib/sync/syncScheduler';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToFavorite,
  createExercise,
  deleteExercise,
  updateFavorite,
} from "../../service/exersiseService";

export const useCreateExercise = (profile_id) => {
  return useMutation({
    mutationFn: async (data) => {
      const pid = data.profile_id || profile_id;
      const exerciseId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Local catalog entry (custom = not popular)
      setSyncWrite(true);
      try {
        await db.exercises.put({
          id: exerciseId,
          name: data.name,
          muscle: data.muscle || [],
          description: data.description ?? null,
          image: data.image ?? null,
          isPopulary: false,
          createdAt: now,
        });
      } finally {
        setSyncWrite(false);
      }

      const userExerciseId = await userExercisesRepository.add({
        profileId: pid,
        exerciseId,
        isFavorite: true,
      });

      // Custom exercises need a push (handled in pushPendingData)
      scheduleSync();

      return [
        {
          id: userExerciseId,
          exercise_id: exerciseId,
          profile_id: pid,
          is_favorite: true,
        },
      ];
    },
  });
};

export const useAddToFavorite = (profile_id) => {
  return useMutation({
    mutationFn: async (exercise_id) => {
      const existing = await userExercisesRepository.getAll();
      const found = existing.find(
        (ue) =>
          ue.profileId === profile_id && ue.exerciseId === exercise_id,
      );

      if (found) {
        await userExercisesRepository.update(found.id, { isFavorite: true });
        return [{ id: found.id, exercise_id, is_favorite: true }];
      }

      const id = await userExercisesRepository.add({
        profileId: profile_id,
        exerciseId: exercise_id,
        isFavorite: true,
      });

      return [{ id, exercise_id, profile_id, is_favorite: true }];
    },
  });
};

export const useUpdateFavorite = (profile_id) => {
  return useMutation({
    mutationFn: async ({ exercise_id, is_favorite }) => {
      const existing = await userExercisesRepository.getAll();
      const found = existing.find(
        (ue) =>
          ue.profileId === profile_id && ue.exerciseId === exercise_id,
      );

      if (!found) return [];

      await userExercisesRepository.update(found.id, {
        isFavorite: is_favorite,
      });

      return [{ id: found.id, exercise_id, is_favorite }];
    },
  });
};

export const useDeleteExercise = (profile_id) => {
  return useMutation({
    mutationFn: async (exercise_id) => {
      const existing = await userExercisesRepository.getAll();
      const found = existing.find(
        (ue) =>
          ue.profileId === profile_id && ue.exerciseId === exercise_id,
      );

      if (found) {
        await userExercisesRepository.remove(found.id);
      }

      // Remove custom (non-popular) exercise from local catalog
      const exercise = await db.exercises.get(exercise_id);
      if (exercise && exercise.isPopulary === false) {
        setSyncWrite(true);
        try {
          await db.exercises.delete(exercise_id);
        } finally {
          setSyncWrite(false);
        }
      }
    },
  });
};

export const useUpdateExercise = () => {
  return useMutation({
    mutationFn: async ({ id, name, muscle }) => {
      // Custom exercises live only in Dexie until pushCustomExercises runs
      setSyncWrite(true);
      try {
        await db.exercises.update(id, {
          ...(name !== undefined ? { name } : {}),
          ...(muscle !== undefined ? { muscle } : {}),
        });
      } finally {
        setSyncWrite(false);
      }
      scheduleSync();
      return { id, name, muscle };
    },
  });
};
