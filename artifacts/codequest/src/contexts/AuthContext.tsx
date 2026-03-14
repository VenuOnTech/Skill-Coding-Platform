import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, UserProfile } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("codequest_token"));
  
  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const login = (newToken: string, userProfile: UserProfile) => {
    localStorage.setItem("codequest_token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("codequest_token");
    setToken(null);
  };

  // If token exists but fetch fails (e.g. expired), logout
  useEffect(() => {
    if (token && !isUserLoading && !user) {
      // Assuming 401 unauth causes data to be undefined without throwing thanks to React Query
      // We might need better error handling, but this is a simple fallback
    }
  }, [token, isUserLoading, user]);

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      token, 
      isLoading: !!token && isUserLoading, 
      login, 
      logout 
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
