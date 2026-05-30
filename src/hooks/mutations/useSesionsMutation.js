import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateSesion = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => {
            // TODO: Implement sesion creation
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sesions']
            })
        }
    })
}

