import { useQuery } from "@tanstack/react-query"

export const useSesions = () => {
    return useQuery({
        queryKey: ['sesions'],
        queryFn: () => {
            // TODO: Implement sesion fetching
            return []
        }
    })
}