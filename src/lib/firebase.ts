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

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.error(
      '❌ Firebase Configuration Error:',
      `Missing environment variables: ${missingKeys.join(', ')}`,
      'Available config:', firebaseConfig
    );
    throw new Error(
      `Firebase initialization failed. Missing environment variables: ${missingKeys.join(', ')}. ` +
      `Please ensure .env or .env.local has VITE_FIREBASE_* variables set.`
    );
  }
};

// Validate before initializing
validateFirebaseConfig();

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Analytics only in browser environment
export const analytics: Analytics | null =
  typeof window !== "undefined" ? getAnalytics(app) : null;

console.log('✅ Firebase initialized successfully');
