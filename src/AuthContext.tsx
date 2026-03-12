import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  OAuthProvider,
  type User 
} from 'firebase/auth';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inner component that can use Convex hooks (needs to be inside ConvexProvider)
function AuthProviderInner({
  children,
  user,
  setProfile,
  setLoading,
}: {
  children: React.ReactNode;
  user: User | null;
  setProfile: (p: UserProfile | null) => void;
  setLoading: (l: boolean) => void;
}) {
  const convexUser = useQuery(
    api.users.getUserByUid,
    user ? { uid: user.uid } : 'skip'
  );

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    // convexUser is undefined while loading, null when not found, or the user object
    if (convexUser !== undefined) {
      if (convexUser) {
        setProfile({
          uid: convexUser.uid,
          username: convexUser.username,
          displayName: convexUser.displayName,
          bio: convexUser.bio,
          photoURL: convexUser.photoURL,
          isVerified: convexUser.isVerified,
          socialLinks: convexUser.socialLinks,
          role: convexUser.role,
          createdAt: convexUser.createdAt,
        } as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }
  }, [convexUser, user, setProfile, setLoading]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      } else {
        // Will be resolved by AuthProviderInner via Convex query
        setLoading(true);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const appleProvider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, appleProvider);
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithGoogle, 
      signInWithApple,
      signInWithEmail,
      signUpWithEmail,
      logout 
    }}>
      <AuthProviderInner
        user={user}
        setProfile={setProfile}
        setLoading={setLoading}
      >
        {children}
      </AuthProviderInner>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
