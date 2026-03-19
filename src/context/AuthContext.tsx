import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AuthContextType {
  user: FirebaseUser | null;
  convexUserId: Id<"users"> | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const id = await storeUser({
            name: firebaseUser.displayName || "Anonymous",
            email: firebaseUser.email || "",
            image: firebaseUser.photoURL || undefined,
            tokenIdentifier: firebaseUser.uid,
          });
          setConvexUserId(id);
        } catch (error) {
          console.error("Error storing user in Convex:", error);
        }
      } else {
        setConvexUserId(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [storeUser]);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, convexUserId, isLoading, signOut }}>
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
