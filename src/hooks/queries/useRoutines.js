import { useQuery } from "@tanstack/react-query";
import { getRoutines, getRoutineforID } from "../../service/routinesService";
export const useRoutines = () => {
  return useQuery({
    queryKey: ["routines"],
    queryFn: getRoutines,
  });
};
export const useRoutineforID = (routine_id) => {
  return useQuery({
    queryKey: ["routine", routine_id],
    queryFn: () => getRoutineforID(routine_id),
  });
};
