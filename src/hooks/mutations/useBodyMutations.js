import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerWeight } from "../../service/bodyService";

export const useRegisterWeight = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      registerWeight({
        ...data,
        profile_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      queryClient.invalidateQueries({
        queryKey: ["profile", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["body", profile_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["bodyLastWeek", profile_id],
      });
    },
  });
};
