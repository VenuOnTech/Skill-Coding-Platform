import React, { createContext, useContext, useState } from "react";
import { useGetMe, UserProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateLocalUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("codequest_token"));
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: { enabled: !!token, retry: false } as any,
  });

  const login = (newToken: string, _userProfile: UserProfile) => {
    localStorage.setItem("codequest_token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("codequest_token");
    setToken(null);
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  const updateLocalUser = (updates: Partial<UserProfile>) => {
    if (user) {
      queryClient.setQueryData(getGetMeQueryKey(), { ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      token,
      isLoading: !!token && isUserLoading,
      login,
      logout,
      updateLocalUser,
    }}>
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
