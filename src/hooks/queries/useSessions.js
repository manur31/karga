import { useQuery } from "@tanstack/react-query";
import { getSession, getWeekActivity } from "../../service/sessionService";

export const useSessions = (profile_id) => {
  return useQuery({
    queryKey: ["sessions", profile_id],
    queryFn: () => getSession(profile_id),
    enabled: !!profile_id,
  });
};
export const useWeekActivity = (profile_id) => {
  return useQuery({
    queryKey: ["weekActivity", profile_id],
    queryFn: () => getWeekActivity(profile_id),
    enabled: !!profile_id,
  });
};
