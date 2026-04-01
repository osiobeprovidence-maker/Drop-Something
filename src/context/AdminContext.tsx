import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/src/context/AuthContext";

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  loginError: string | null;
  sessionToken: string | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  checkAdminSession: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [hasCheckedStoredSession, setHasCheckedStoredSession] = useState(false);

  const adminLoginMutation = useMutation(api.adminAuth.login);
  const adminLogoutMutation = useMutation(api.adminAuth.logout);
  const { isLoading: authLoading, signOut } = useAuth();
  const currentUser = useQuery(api.users.currentUser);

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const expiresAt = typeof session.expiresAt === "number"
          ? session.expiresAt
          : (typeof session.timestamp === "number" ? session.timestamp + (24 * 60 * 60 * 1000) : 0);

        if (typeof session.token === "string" && session.token && expiresAt > Date.now()) {
          setSessionToken(session.token);
          setIsAdmin(true);
        } else {
          localStorage.removeItem("adminSession");
        }
      } catch {
        localStorage.removeItem("adminSession");
      }
    }
    setHasCheckedStoredSession(true);
  }, []);

  useEffect(() => {
    if (!hasCheckedStoredSession || authLoading || currentUser === undefined) {
      return;
    }

    if (
      currentUser?.role === "admin" ||
      currentUser?.role === "super_admin"
    ) {
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    setIsAdmin(!!sessionToken);
    setIsLoading(false);
  }, [authLoading, currentUser, hasCheckedStoredSession, sessionToken]);

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const result = await adminLoginMutation({
        email,
        password,
      });

      if (!result.success) {
        setLoginError("Login failed: Invalid response");
        setIsAdmin(false);
        return;
      }

      const session = {
        isAdmin: true,
        email: result.adminEmail,
        timestamp: result.timestamp,
        expiresAt: result.expiresAt,
        token: result.token,
      };

      localStorage.setItem("adminSession", JSON.stringify(session));
      setSessionToken(result.token);
      setIsAdmin(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setLoginError(errorMessage);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = async () => {
    const tokenToRevoke = sessionToken;

    localStorage.removeItem("adminSession");
    setSessionToken(null);
    setIsAdmin(false);
    setLoginError(null);

    if (tokenToRevoke) {
      try {
        await adminLogoutMutation({ token: tokenToRevoke });
      } catch {
        // Best-effort cleanup; the local session has already been cleared.
      }
    }

    if (
      currentUser?.role === "admin" ||
      currentUser?.role === "super_admin"
    ) {
      await signOut();
    }
  };

  const checkAdminSession = (): boolean => isAdmin;

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
        loginError,
        sessionToken,
        adminLogin,
        adminLogout,
        checkAdminSession,
      }}
    >
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
