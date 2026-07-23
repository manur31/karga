import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authGoogle,
  login,
  logout,
  register,
  setProfile,
  updateProfileDays,
  updateProfileRestTime,
} from "../../service/authService";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });
    },
  });
};

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
        onSuccess: (data) => {
            queryClient.setQueryData(['auth-user'], data.profile)
            queryClient.invalidateQueries({
                queryKey: ['auth-user']
            })
        }
    })
}

export const useUpdateProfileDays = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileDays,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });
    },
  });
};

export const useUpdateProfileRestTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileRestTime,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });
    },
  });
};