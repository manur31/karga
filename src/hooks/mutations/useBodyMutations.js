import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerWeight } from "../../service/bodyService";

export const useRegisterWeight = (profile_id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weight) => {
      return registerWeight({
        weight,
        profile_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["body", profile_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["progress", profile_id],
      });
    },
  });
};
