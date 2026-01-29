// import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
// import { useLocation } from "wouter";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { queryClient, apiRequest } from "../lib/queryClient";


// type UserWithoutPassword = {
//   id: number;
//   username: string;
//   role: string;
//   fullName?: string;
//   email?: string;
// };


// interface AuthContextType {
//   user: UserWithoutPassword | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   logout: () => Promise<void>;
//   refetchUser: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [, setLocation] = useLocation();

//   // Fetch current session
//   const { data, isLoading, refetch } = useQuery<{ user: UserWithoutPassword }>({
//     queryKey: ["/api/auth/session"],
//     retry: false,
//     refetchOnWindowFocus: true,
//   });

//   // Logout mutation
//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       await apiRequest("POST", "/api/auth/logout");
//     },
//     onSuccess: () => {
//       queryClient.setQueryData(["/api/auth/session"], null);
//       setLocation("/login");
//     },
//   });

//   const logout = async () => {
//     await logoutMutation.mutateAsync();
//   };

//   const refetchUser = async () => {
//     await refetch();
//   };

//   const value: AuthContextType = {
//     user: data?.user || null,
//     isLoading,
//     isAuthenticated: !!data?.user,
//     logout,
//     refetchUser,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }


import { createContext, useContext, useEffect, useState } from "react";

type User = {
  username: string;
  password?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 🔥 hydrate from localStorage on refresh
  useEffect(() => {
    const role = localStorage.getItem("role");
    const isAuth = localStorage.getItem("isAuthenticated");

    if (role && isAuth === "true") {
      setUser({ role, username: "", password: "" } as User);
    }
  }, []);

  const login = (role: string) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("role", role);
    setUser({ role, username: "", password: "" });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
