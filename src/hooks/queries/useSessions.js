import { useQuery } from "@tanstack/react-query";
import { getSession } from "../../service/sessionService";

export const useSessions = (profile_id) => {
  return useQuery({
    queryKey: ["sessions", profile_id],
    queryFn: () => getSession(profile_id),
    enabled: !!profile_id,
  });
};
