import { useQuery } from "@tanstack/react-query"
import { getSession } from "../../service/sessionService"

export const useSesions = () => {
    return useQuery({
        queryKey: ['sesions'],
        queryFn: () => {
            getSession
            return []
        }
    })
}