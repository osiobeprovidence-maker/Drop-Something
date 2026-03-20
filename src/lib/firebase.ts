import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCC06HaSAWDuqhF3dsXa8D70cDQyMNkN6w",
  authDomain: "dropsomething-d00ca.firebaseapp.com",
  projectId: "dropsomething-d00ca",
  storageBucket: "dropsomething-d00ca.firebasestorage.app",
  messagingSenderId: "237029496349",
  appId: "1:237029496349:web:50a8f4857e8581471398f4",
  measurementId: "G-77ZHWMQTE5"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Analytics only in browser environment
export const analytics: Analytics | null =
  typeof window !== "undefined" ? getAnalytics(app) : null;
