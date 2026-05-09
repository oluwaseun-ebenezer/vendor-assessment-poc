import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { LoginCredentials, TokenResponse, User } from "@/types";

// Login
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<TokenResponse>(
        "/auth/login",
        credentials,
      );
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
    },
  });
};

// Logout
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  });
};

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    },
    enabled: !!localStorage.getItem("access_token"),
    retry: false,
  });
};
