import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addToFavorite,
  createExercise,
  deleteExercise,
  updateFavorite,
} from "../../service/exersiseService";

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return createExercise(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercises"],
      });
      queryClient.invalidateQueries({
        queryKey: ["favoriteExercises"],
      });
    },
  });
};

export const useAddToFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToFavorite,
    onMutate: async (exerciseId) => {
      await queryClient.cancelQueries({ queryKey: ["favoriteExercises"] });
      await queryClient.cancelQueries({ queryKey: ["exercises"] });

      const previousFavorites = queryClient.getQueryData(["favoriteExercises"]);
      const previousExercises = queryClient.getQueryData(["exercises"]);

      if (previousExercises) {
        const exerciseToMove = previousExercises.find(ex => ex.id === exerciseId);
        if (exerciseToMove) {
          queryClient.setQueryData(["exercises"], previousExercises.filter(ex => ex.id !== exerciseId));
          queryClient.setQueryData(["favoriteExercises"], [
            ...(previousFavorites || []),
            { exercise_id: exerciseId, is_favorite: true, exercises: exerciseToMove }
          ]);
        }
      }
      return { previousFavorites, previousExercises };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favoriteExercises"], context.previousFavorites);
      }
      if (context?.previousExercises) {
        queryClient.setQueryData(["exercises"], context.previousExercises);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteExercises"] });
    },
  });
};

export const useUpdateFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exercise_id, is_favorite }) => {
      return updateFavorite({ exercise_id, is_favorite });
    },
    onMutate: async ({ exercise_id, is_favorite }) => {
      await queryClient.cancelQueries({ queryKey: ["favoriteExercises"] });
      
      const previousFavorites = queryClient.getQueryData(["favoriteExercises"]);
      
      if (previousFavorites) {
        queryClient.setQueryData(
          ["favoriteExercises"],
          previousFavorites.map(ue => 
            ue.exercise_id === exercise_id 
              ? { ...ue, is_favorite } 
              : ue
          )
        );
      }
      
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favoriteExercises"], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteExercises"] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteExercises"] });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routines_exercises"] });
    },
  });
};
