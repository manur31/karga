import { useQuery } from "@tanstack/react-query"

export const useSets = () => {
    return useQuery({
        queryKey: ['sets'],
        queryFn: () => {
            // TODO: Implement set fetching
            return []
        }
    })
}