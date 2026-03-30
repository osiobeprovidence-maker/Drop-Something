import { useEffect } from "react";
import { useAdmin } from "@/src/context/AdminContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

/**
 * Admin Route Wrapper
 * 
 * This component handles the routing logic for the admin panel:
 * - If admin is logged in (via localStorage session), show the dashboard
 * - Otherwise, show the login page
 * 
 * Session validation:
 * - Stored in localStorage as "adminSession"
 * - Includes timestamp for expiration checking (24 hours)
 * - Can be cleared by calling adminLogout()
 */
export default function AdminRoute() {
  const { isAdmin, isLoading, adminLogout, sessionToken } = useAdmin();

  // Handle session expiration or invalid session
  useEffect(() => {
    if (!isLoading && isAdmin && sessionToken) {
      const session = localStorage.getItem("adminSession");
      if (!session) {
        // Session was cleared externally, logout
        void adminLogout();
      }
    }
  }, [isAdmin, isLoading, adminLogout, sessionToken]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="text-sm font-medium text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show login page if not admin, otherwise show dashboard
  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}
