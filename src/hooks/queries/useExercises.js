import { useQuery } from "@tanstack/react-query"

export const useExercises = () => {
    return useQuery({
        queryKey: ['exercises'],
        queryFn: () => {
            // TODO: Implement exercise fetching
            return []
        }
    })
    
}