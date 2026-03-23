import { ConvexReactClient } from "convex/react";
import { User as FirebaseUser } from "firebase/auth";

// Single Convex client instance for the entire app
let convexClient: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient {
  if (!convexClient) {
    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    
    if (!convexUrl) {
      console.error("VITE_CONVEX_URL is not set. Please check your .env file.");
      throw new Error("VITE_CONVEX_URL is not configured");
    }

    // Ensure URL has no trailing slash to prevent double-slash in WebSocket connections
    const cleanUrl = convexUrl.replace(/\/$/, "");

    convexClient = new ConvexReactClient(cleanUrl, {
      // Add error handling for connection issues
      unsavedChangesWarning: false,
      onServerDisconnectError: (error) => {
        console.warn("Convex server disconnected. Attempting to reconnect...", error);
      },
    });
  }

  return convexClient;
}

/**
 * Set up Firebase authentication with Convex
 * This function should be called after Firebase user logs in
 * 
 * @param firebaseUser - The Firebase user object from Firebase Auth
 */
export async function setupFirebaseAuthWithConvex(firebaseUser: FirebaseUser | null) {
  const convex = getConvexClient();
  
  if (!firebaseUser) {
    // User logged out - clear auth
    convex.clearAuth();
    console.log("Convex auth cleared (user logged out)");
    return;
  }

  try {
    // Get the Firebase ID token
    const token = await firebaseUser.getIdToken();
    
    // Set up Convex auth with the Firebase token
    // This provides the token to all Convex functions
    convex.setAuth(async () => token);
    
    console.log("✅ Firebase auth configured with Convex for user:", firebaseUser.email);
  } catch (error) {
    console.error("❌ Failed to set up Firebase auth with Convex:", error);
  }
}
