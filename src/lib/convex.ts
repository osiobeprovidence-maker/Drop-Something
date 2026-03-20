import { ConvexReactClient } from "convex/react";

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
    });

    // Listen for connection errors
    convexClient.setOnServerDisconnectError(() => {
      console.warn("Convex server disconnected. Attempting to reconnect...");
    });
  }

  return convexClient;
}
