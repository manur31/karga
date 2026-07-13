import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authGoogle, login, logout, register, setProfile } from "../../service/authService"

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });
    },
  });
};

export const useAuthGoogle = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authGoogle,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['auth-user']
            })
        }
    })
}

export const useLogin = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: login,
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
 
export const useOnboarding = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: setProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['auth-user']
            })
        }
    })
}