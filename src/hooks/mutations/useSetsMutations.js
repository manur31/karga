// src/hooks/mutations/useSetsMutations.js
import { setsRepository } from '../../lib/local/setsRepository';

export function useAddSet() {
  return {
    mutate: (data) => setsRepository.add(data),
  };
}

export function useUpdateSet() {
  return {
    mutate: ({ id, changes }) => setsRepository.update(id, changes),
  };
}

export function useDeleteSet() {
  return {
    mutate: (id) => setsRepository.remove(id),
  };
}

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { createSet, deleteSet, updateSet } from "../../service/setService";

// export const useCreateSet = (profile_id) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data) => {
//       return createSet(data);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["sets", profile_id],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["setsForExercise", profile_id],
//       });
//     },
//   });
// };

// export const useDeleteSet = (profile_id) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (set_id) => {
//       return deleteSet({ set_id, profile_id });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["sets", profile_id],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["setsForExercise", profile_id],
//       });
//     },
//   });
// };

// export const useUpdateSet = (profile_id) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ set_id, rep, weight }) => {
//       return updateSet({ set_id, rep, weight, profile_id });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["sets", profile_id],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["setsForExercise", profile_id],
//       });
//     },
//   });
// };
