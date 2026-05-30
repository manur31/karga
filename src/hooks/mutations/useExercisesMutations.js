import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateExercise = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => {
            // TODO: Implement exercise creation
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises']
            })
        }
    })
}

export const useUpdateExercise = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => {
            // TODO: Implement exercise update
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises']
            })
        }
    })
}

export const useDeleteExercise = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id) => {
            // TODO: Implement exercise deletion
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['exercises']
            })
        }
    })
}
