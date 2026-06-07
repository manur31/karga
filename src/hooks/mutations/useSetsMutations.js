import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSet } from "../../service/setService";

export const useCreateSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      createSet(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sets"],
      });
    },
  });
};
