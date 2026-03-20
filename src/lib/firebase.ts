import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-77ZHWMQTE5"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Analytics only in browser environment
export const analytics: Analytics | null =
  typeof window !== "undefined" ? getAnalytics(app) : null;
