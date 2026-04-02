import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "../lib/firebase";
import { setupFirebaseAuthWithConvex } from "../lib/convex";

interface AuthContextType {
  user: FirebaseUser | null;
  convexUserId: Id<"users"> | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
  isNewUser: boolean;
  hasProfile: boolean;
  authSyncError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SYNC_RETRY_DELAYS_MS = [200, 500, 1000, 1500];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't sync your account. Please try again.";
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authSyncError, setAuthSyncError] = useState<string | null>(null);

  const storeUser = useMutation(api.users.storeUser);
  const creator = useQuery(api.creators.getCreatorByUserId, {
    userId: convexUserId || undefined,
  });

  const isCreatorLoading = convexUserId !== null && creator === undefined;
  const hasProfile = creator !== null && creator !== undefined;

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthSyncError(null);

      await setupFirebaseAuthWithConvex(firebaseUser);

      if (!firebaseUser) {
        setConvexUserId(null);
        setIsLoading(false);
        setIsNewUser(false);
        setAuthSyncError(null);
        return;
      }

      try {
        let result: Awaited<ReturnType<typeof storeUser>> | null = null;

        for (let attempt = 0; attempt <= USER_SYNC_RETRY_DELAYS_MS.length; attempt += 1) {
          try {
            result = await storeUser({
              username: firebaseUser.displayName || undefined,
              name: firebaseUser.displayName || "Anonymous",
              image: firebaseUser.photoURL || undefined,
            });
            break;
          } catch (error) {
            const isLastAttempt = attempt === USER_SYNC_RETRY_DELAYS_MS.length;

            console.error(
              `[AuthContext] Error storing user in Convex (attempt ${attempt + 1})`,
              error,
            );

            if (isLastAttempt) {
              throw error;
            }

            await setupFirebaseAuthWithConvex(firebaseUser);
            await wait(USER_SYNC_RETRY_DELAYS_MS[attempt]);
          }
        }

        if (!result) {
          throw new Error("Account sync did not complete.");
        }

        const newId = result.id;
        setConvexUserId(newId);
        setIsNewUser(Boolean(result.isNew));

        setAuthSyncError(null);
      } catch (error) {
        setConvexUserId(null);
        setIsNewUser(false);
        setAuthSyncError(getErrorMessage(error));
        console.error("Error storing user in Convex:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [storeUser]);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        convexUserId,
        isLoading: isLoading || isCreatorLoading,
        signOut,
        reloadUser,
        isNewUser,
        hasProfile,
        authSyncError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
