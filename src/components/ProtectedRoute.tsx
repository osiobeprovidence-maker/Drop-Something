import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { user, isLoading, hasProfile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in but hasn't completed onboarding, redirect them there
  // Unless they are already on the onboarding page
  if (!hasProfile && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // If the user has a profile but tries to go back to onboarding, send them to dashboard
  if (hasProfile && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  // In a real app, you would check admin status from Convex/Firestore data
  // For now, we allow the authenticated user
  return <>{children}</>;
};
