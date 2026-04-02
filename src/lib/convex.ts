import { ConvexReactClient } from "convex/react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebase";

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
      unsavedChangesWarning: false,
      onServerDisconnectError: (error) => {
        console.warn("Convex server disconnected. Attempting to reconnect...", error);
      },
    });
  }

  return convexClient;
}

/**
 * Set up Firebase authentication with Convex.
 * This function should be called after Firebase user logs in.
 */
export async function setupFirebaseAuthWithConvex(firebaseUser: FirebaseUser | null) {
  const convex = getConvexClient();

  if (!firebaseUser) {
    convex.clearAuth();
    console.log("Convex auth cleared (user logged out)");
    return;
  }

  try {
    // Prime auth once, then always provide Convex with the latest Firebase token.
    await firebaseUser.getIdToken();

    convex.setAuth(async () => {
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.uid === firebaseUser.uid) {
        return await currentUser.getIdToken();
      }

      return await firebaseUser.getIdToken();
    });

    console.log("Firebase auth configured with Convex for user:", firebaseUser.email);
  } catch (error) {
    console.error("Failed to set up Firebase auth with Convex:", error);
  }
}
