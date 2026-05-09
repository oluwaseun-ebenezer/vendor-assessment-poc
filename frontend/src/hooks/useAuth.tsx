import { createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, useLogin, useLogout } from "@/api/auth";
import { LoginCredentials, User } from "@/types";

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
    navigate("/dashboard");
  };

  const logout = () => {
    logoutMutation.mutate();
    navigate("/login");
  };

  const isAuthenticated = !!user && !!localStorage.getItem("access_token");

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
