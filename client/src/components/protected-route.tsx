import { useAuth } from "../contexts/auth-context";
import { useLocation } from "wouter";
import { useEffect, type ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!isLoading && isAuthenticated && allowedRoles && user) {
      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on their role
        const roleRoutes: Record<string, string> = {
          superadmin: "/admin/users",
          admin: "/admin/users",
          encoder: "/encoder/dashboard",
          checker: "/checker/dashboard",
          reviewer: "/reviewer/dashboard",
          approver: "/approver/dashboard",
          viewer: "/viewer/dashboard",
        };
        const redirectPath = roleRoutes[user.role] || "/login";
        setLocation(redirectPath);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}