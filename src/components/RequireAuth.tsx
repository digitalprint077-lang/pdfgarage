import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SitePageShell from "./SitePageShell";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <SitePageShell>
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <p className="text-[rgb(var(--muted))]">Loading your account…</p>
        </div>
      </SitePageShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
