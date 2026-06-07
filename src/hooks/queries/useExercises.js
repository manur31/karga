import { useQuery } from "@tanstack/react-query"
import { getExercises, getFavoriteExercises, getExerciseForID } from "../../service/exersiseService"

export const useExercises = () => {
    return useQuery({
        queryKey: ['exercises'],
        queryFn: getExercises
    })
}

export const useFavoriteExercises = () => {
    return useQuery({
        queryKey: ['favoriteExercises'],
        queryFn: getFavoriteExercises
    })
}
export const useExerciseForID = (id) => {
    return useQuery({
        queryKey: ['exerciseForID', id],
        queryFn: () => getExerciseForID(id),
        enabled: !!id,
    })
}