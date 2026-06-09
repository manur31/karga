import { useQuery } from "@tanstack/react-query";
import { getSets, getSetforExercise } from "../../service/setService";
export const useSets = (profile_id) => {
  return useQuery({
    queryKey: ["sets", profile_id],
    queryFn: () => getSets(profile_id),
    enabled: !!profile_id,
  });
};
export const useSetsForExercise = (profile_id, exercise_id) => {
  return useQuery({
    queryKey: ["setsForExercise", profile_id, exercise_id],
    queryFn: () => getSetforExercise(profile_id, exercise_id),
    enabled: !!profile_id && !!exercise_id,
  });
};
