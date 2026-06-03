import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createRoutines,
  insertExercisesRoutine,
} from "../../service/routinesService";

export const useCreateRoutines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createRoutines(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
    },
  });
};
export const useInsertExercisesRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => insertExercisesRoutine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines_exercises"],
      });
    },
  });
};
