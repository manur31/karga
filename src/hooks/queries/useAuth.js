import { useQuery } from "@tanstack/react-query"


export const useAuth = () => {
    return useQuery({
        queryKey: ['auth-user'],
        queryFn: () => {
            // TODO: Implement auth query
        },
        staleTime: Infinity
    })
}