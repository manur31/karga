import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSet, deleteSet, updateSet } from "../../service/setService";

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
export const useDeleteSet= ()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data)=>{
      deleteSet(data);
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({
        queryKey:["sets"]
      })
    }
  })
}
export const useUpdateSet = ()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data)=>{
      updateSet(data);
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({
        queryKey:["sets"]
      })
    }
  })
}