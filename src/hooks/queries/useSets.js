import { useQuery } from "@tanstack/react-query"
import { getSets } from "../../service/setService"
export const useSets = () => {
    return useQuery({
        queryKey: ['sets'],
        queryFn: getSets
    })
}