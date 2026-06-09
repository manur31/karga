import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToFavorite,
  createExercise,
  deleteExercise,
  updateFavorite,
} from "../../service/exersiseService";

export const useCreateExercise = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return createExercise({
        ...data,
        profile_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercises", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["favoriteExercises", profile_id],
      });
    },
  });
};

export const useAddToFavorite = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercise_id) => {
      return addToFavorite({
        exercise_id,
        profile_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercises", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["favoriteExercises", profile_id],
      });
    },
  });
};

export const useUpdateFavorite = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exercise_id, is_favorite }) => {
      return updateFavorite({
        exercise_id,
        profile_id,
        is_favorite,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercises", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["favoriteExercises", profile_id],
      });
    },
  });
};

export const useDeleteExercise = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercise_id) => {
      return deleteExercise({
        exercise_id,
        profile_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercises", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["favoriteExercises", profile_id],
      });
    },
  });
};
