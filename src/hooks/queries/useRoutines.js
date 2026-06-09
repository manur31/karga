import { useQuery } from "@tanstack/react-query";
import { getRoutines } from "../../service/routinesService";

export const useRoutines = (profile_id) => {
  return useQuery({
    queryKey: ["routines", profile_id],
    queryFn: () => getRoutines(profile_id),
    enabled: !!profile_id,
  });
};
