import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AuthContextType {
  user: FirebaseUser | null;
  convexUserId: Id<"users"> | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
  isNewUser: boolean;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const storeUser = useMutation(api.users.storeUser);
  
  // Query to check if the user has a creator profile
  const creator = useQuery(api.creators.getCreatorByUserId, { 
    userId: convexUserId || undefined
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
      // 1. Immediately update the Firebase user state
      setUser(firebaseUser);
      
      // 2. If no user, we're definitely not loading anymore
      if (!firebaseUser) {
        setConvexUserId(null);
        setIsLoading(false);
        setIsNewUser(false);
        return;
      }

      // 3. Sync with Convex in the background, but don't let it block the app if it hangs
      try {
        const result = await storeUser({
          name: firebaseUser.displayName || "Anonymous",
          email: firebaseUser.email || "",
          image: firebaseUser.photoURL || undefined,
          tokenIdentifier: firebaseUser.uid,
        });
        
        // storeUser now returns an object with id and isNew
        if (typeof result === "object" && result !== null) {
          setConvexUserId((result as any).id);
          setIsNewUser((result as any).isNew);
        } else {
          setConvexUserId(result as any);
        }
      } catch (error) {
        console.error("Error storing user in Convex:", error);
      } finally {
        // 4. Always resolve loading state once we've tried to sync
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [storeUser]);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      convexUserId, 
      isLoading: isLoading || isCreatorLoading, 
      signOut, 
      reloadUser, 
      isNewUser, 
      hasProfile 
    }}>
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
