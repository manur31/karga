import { useQuery } from "@tanstack/react-query"
import { getProfile } from "../../service/authService"

export const useAuth = () => {
    return useQuery({
        queryKey: ['auth-user'],
        queryFn: getProfile,
        staleTime: Infinity
    })
} 