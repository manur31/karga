import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';

export function useSets() {
  const sets = useLiveQuery(
    () => db.sets.where('deleted').equals(0).toArray(),
    []
  );

  return {
    data: sets,
    isLoading: sets === undefined,
  };
}

import { useQuery } from "@tanstack/react-query";
import { getSets, getSetforExercise } from "../../service/setService";
// export const useSets = (profile_id) => {
//   return useQuery({
//     queryKey: ["sets", profile_id],
//     queryFn: () => getSets(profile_id),
//     enabled: !!profile_id,
//   });
// };
export const useSetsForExercise = (profile_id, exercise_id) => {
  return useQuery({
    queryKey: ["setsForExercise", profile_id, exercise_id],
    queryFn: () => getSetforExercise({ profile_id, exercise_id }),
    enabled: !!profile_id && !!exercise_id,
  });
};
