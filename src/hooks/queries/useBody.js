import { useQuery } from "@tanstack/react-query";
import { getLastWeight, getWeeklyProgress } from "../../service/bodyService";
export const useBody = (profile_id) => {
  return useQuery({
    queryKey: ["body", profile_id],
    queryFn: () => getLastWeight(profile_id),
  });
};
export const useProgress = (profile_id) => {
  return useQuery({
    queryKey: ["progress", profile_id],
    queryFn: () => getWeeklyProgress(profile_id),
  });
};
