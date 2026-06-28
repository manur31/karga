import { useQuery } from "@tanstack/react-query";
import { getBodyLastWeek } from "../../service/bodyService";

export const useBody = (profile_id) => {
  return useQuery({
    queryKey: ["body", profile_id],
    queryFn: () => getBodyLastWeek(profile_id),
  });
};
