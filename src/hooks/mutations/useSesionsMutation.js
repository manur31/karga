import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteSession,
  insertSession,
  updateSession,
  updateSessionWithSets,
} from "../../service/sessionService";

export const useCreateSession = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return insertSession(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", profile_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["weekActivity", profile_id],
      });
    },
  });
};

export const useDeleteSession = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session_id) => {
      return deleteSession({
        profile_id,
        session_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", profile_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["weekActivity", profile_id],
      });
    },
  });
};
export const useUpdateSession = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ session_id, finishedAt, startedAt, note }) => {
      return updateSession({
        session_id,
        profile_id,
        finishedAt,
        startedAt,
        note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", profile_id],
      });
    },
  });
};
export const useUpdateSessionWithSets = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      updateSessionWithSets({
        ...data,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["sets", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["weekActivity", profile_id],
      });
    },
  });
};
