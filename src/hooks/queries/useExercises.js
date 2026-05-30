import { useQuery } from "@tanstack/react-query"
import { getExercises, getFavoriteExercises } from "../../service/exersiseService"

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
