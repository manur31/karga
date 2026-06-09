import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteSession, insertSessionx } from "../../service/sessionService"


export const useCreateSession = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data) => {
            insertSessionx(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['sessions']
            })
        }
    })
}
export const useUpdateSession=()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data)=>{
        }
    })
}
export const useDeleteSession()=>{
    const queryClient= useQueryClient()
    return useMutation ({
        mutationFn: (id)=>{
            deleteSession(id);
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({
                queryKey:["sessions"]
            })
        }
    })
}

