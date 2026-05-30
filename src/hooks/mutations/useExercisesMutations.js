import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addToFavorite, createExercise, deleteExercise, updateFavorite } from "../../service/exersiseService"

export const useCreateExercise = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => {
            createExercise(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises']
            })
        }
    })
}

export const useAddToFavorite = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id) => {
            addToFavorite(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises', 'favoriteExercises']
            })
        }
    })
}

export const useUpdateFavorite = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, is_favorite}) => {
            updateFavorite({id, is_favorite})
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises', 'favoriteExercises']
            })
        }
    })
}

export const useDeleteExercise = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id) => {
            deleteExercise(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises', 'favoriteExercises']
            })
        }
    })
}
