import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createRoutines,
  insertExercisesRoutine,
  deleteRoutines,
  updateRoutines,
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
      queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
    },
  });
};

export const useDeleteRoutines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRoutines(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
    },
  });
};
export const useEditRoutines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateRoutines(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
    },
  });
};
