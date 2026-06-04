import { useQuery } from "@tanstack/react-query";
import { getRoutines } from "../../service/routinesService";
export const useRoutines = () => {
  return useQuery({
    queryKey: ["routines"],
    queryFn: getRoutines,
  });
};
