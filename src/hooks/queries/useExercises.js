import { useQuery } from "@tanstack/react-query";
import {
  getExercises,
  getFavoriteExercises,
} from "../../service/exersiseService";

export const useExercises = (profile_id) => {
  return useQuery({
    queryKey: ["exercises", profile_id],
    queryFn: () => getExercises(profile_id),
  });
};

export const useFavoriteExercises = (profile_id) => {
  return useQuery({
    queryKey: ["favoriteExercises", profile_id],
    queryFn: () => getFavoriteExercises(profile_id),
  });
};
