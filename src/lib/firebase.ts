import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for missing config and throw error with helpful message
const requiredKeys = ['apiKey', 'authDomain', 'projectId'] as const;
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(
      `Firebase config is missing ${key}. Please create a .env.local file with your Firebase credentials.`
    );
  }
}

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  throw error;
}

export const auth = getAuth(app);
