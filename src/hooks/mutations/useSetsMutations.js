import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateSet = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => {
            // TODO: Implement set creation
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sets']
            })
        }
    })
}
