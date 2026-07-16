import { useQuery } from "@tanstack/react-query";
import { getBodyLastWeek, getWeight } from "../../service/bodyService";

export const useBody = (profile_id) => {
  return useQuery({
    queryKey: ["body", profile_id],
    queryFn: () => getBodyLastWeek(profile_id),
  });
};
export const useWeight = (profile_id) => {
  return useQuery({
    queryKey: ["weightHistory", profile_id],
    queryFn: () => getWeight(profile_id),
    enabled: !!profile_id,
  });
};
