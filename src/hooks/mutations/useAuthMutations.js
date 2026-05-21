import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useRegister = (registerData) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => register(registerData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['auth-user']
            })
        }
    })
}

export const useLogin = (loginData) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => login(loginData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['auth-user']
            })
        }
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['auth-user']
            })
        }
    })
}
