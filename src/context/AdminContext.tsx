import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  loginError: string | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  checkAdminSession: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const adminLoginMutation = useMutation(api.adminAuth.login);

  // Check for existing admin session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        // Optional: Verify session hasn't expired
        const sessionAge = Date.now() - session.timestamp;
        const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < SESSION_TIMEOUT) {
          setIsAdmin(true);
        } else {
          // Session expired
          localStorage.removeItem("adminSession");
          setIsAdmin(false);
        }
      } catch (error) {
        localStorage.removeItem("adminSession");
        setIsAdmin(false);
      }
    }
    setIsLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string) => {
    console.log("🔐 [AdminContext] Login attempt:", { email });
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log("🔐 [AdminContext] Calling backend adminAuth.login mutation...");
      const result = await adminLoginMutation({
        email,
        password,
      });
      console.log("✅ [AdminContext] Backend returned result:", result);

      if (result.success) {
        console.log("✅ [AdminContext] Login successful. Setting admin session...");
        // Store admin session in localStorage
        const session = {
          isAdmin: true,
          email: result.adminEmail,
          timestamp: result.timestamp,
        };
        localStorage.setItem("adminSession", JSON.stringify(session));
        setIsAdmin(true);
        console.log("✅ [AdminContext] Admin session stored in localStorage");
      } else {
        console.warn("⚠️ [AdminContext] Login result success=false");
        setLoginError("Login failed: Invalid response");
        setIsAdmin(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      console.error("❌ [AdminContext] Login error:", {
        error,
        errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      setLoginError(errorMessage);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem("adminSession");
    setIsAdmin(false);
    setLoginError(null);
  };

  const checkAdminSession = (): boolean => {
    const session = localStorage.getItem("adminSession");
    return !!session && isAdmin;
  };

  const value: AdminContextType = {
    isAdmin,
    isLoading,
    loginError,
    adminLogin,
    adminLogout,
    checkAdminSession,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
