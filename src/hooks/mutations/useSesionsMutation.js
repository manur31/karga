import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteSession,
  insertSession,
  updateSession,
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
        session_id,
        profile_id,
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
    mutationFn: ({ session_id, time_end, time_init, note }) => {
      return updateSession({
        session_id,
        profile_id,
        time_end,
        time_init,
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
