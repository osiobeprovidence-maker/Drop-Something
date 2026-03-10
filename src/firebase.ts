import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase (Auth only — storage is handled by Convex)
const app = initializeApp(firebaseConfig);
// Initialize analytics where available (no-op on server)
try {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const analytics = getAnalytics(app);
} catch (e) {
	// ignore (analytics not available in some environments)
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
