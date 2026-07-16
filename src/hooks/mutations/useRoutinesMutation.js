import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createRoutines,
  insertExercisesRoutine,
  deleteRoutines,
  updateRoutines,
  deleteExercisesRoutine,
} from "../../service/routinesService";

export const useCreateRoutines = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      createRoutines({
        ...data,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines", profile_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
    },
  });
};

export const useInsertExercisesRoutine = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      insertExercisesRoutine({
        ...data,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines", profile_id],
      });
    },
  });
};

export const useDeleteRoutines = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine_id) =>
      deleteRoutines({
        routine_id,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines", profile_id],
      });
    },
  });
};

export const useEditRoutines = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      updateRoutines({
        ...data,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines", profile_id],
      });
    },
  });
};

export const useDeleteExercisesRoutine = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      deleteExercisesRoutine({
        ...data,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routines", profile_id],
      });
    },
  });
};
