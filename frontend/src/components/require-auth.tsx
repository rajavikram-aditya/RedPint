import { useNavigate } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { useEffect } from "react";

interface RequireAuthProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * Wraps a page component. If the user is not authenticated or doesn't have
 * the right role, they are redirected.
 *
 * Usage:
 *   <RequireAuth allowedRoles={['donor']}>
 *     <DonorDashboard />
 *   </RequireAuth>
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/" });
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      // Redirect to the correct dashboard
      if (role === "donor") {
        navigate({ to: "/donor/dashboard" });
      } else if (role === "hospital") {
        navigate({ to: "/hospital/dashboard" });
      }
    }
  }, [user, role, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (role && !allowedRoles.includes(role))) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
