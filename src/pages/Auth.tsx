import { useState, useEffect, type FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Coffee, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasProfile, isLoading } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const deliveryIntent = searchParams.get("intent") === "delivery";
  const prefillsEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(prefillsEmail);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  // If user is already logged in, redirect them away from auth page
  useEffect(() => {
    if (!isLoading && user) {
      const hasPendingDelivery = Boolean(localStorage.getItem("dropsomething.pendingDeliverySignup"));

      if (hasPendingDelivery && hasProfile) {
        navigate("/settings?tab=delivery&source=checkout");
        return;
      }

      if (hasProfile) {
        navigate("/explore");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, hasProfile, isLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        if (!username) {
          throw new Error("Username is required");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: username
        });
        
        // Send email verification
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        
        // Navigation will be handled by the useEffect above once the auth state changes
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Navigation will be handled by the useEffect above once the auth state changes
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred during authentication");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError(err.message || "An error occurred with Google Sign-In");
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (verificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black/5 px-4">
        <div className="w-full max-w-md rounded-[2.5rem] bg-white p-12 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle size={40} />
          </div>
          <h2 className="mt-8 text-3xl font-black text-black">Check your email</h2>
          <p className="mt-4 text-black/60">
            We've sent a verification link to <span className="font-bold text-black">{email}</span>.
            Please verify your email to access all features.
          </p>
          <div className="mt-8 space-y-4">
            <button 
              onClick={() => navigate("/onboarding")}
              className="w-full h-14 rounded-full bg-black text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue to Setup
            </button>
            <button 
              onClick={async () => {
                if (auth.currentUser) {
                  await sendEmailVerification(auth.currentUser);
                  alert("Verification email resent!");
                }
              }}
              className="text-sm font-bold text-black/40 hover:text-black underline underline-offset-4 transition-colors"
            >
              Didn't get the email? Resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black/5 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-black/5 sm:p-12"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-black">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <Coffee size={20} />
            </div>
            DropSomething
          </Link>
          <h2 className="mt-8 text-3xl font-extrabold text-black">
            {deliveryIntent && mode === "signup"
              ? "Create your account"
              : mode === "login"
              ? "Welcome back"
              : "Join the hustle"}
          </h2>
          <p className="mt-2 text-sm text-black/40">
            {deliveryIntent && mode === "signup"
              ? "Your payment went through. Create your account to add a delivery address for your order."
              : mode === "login"
              ? "Sign in to manage your page and support"
              : "Create your page and start receiving support today"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthLoading}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black transition-all hover:bg-black/5 active:scale-[0.98] disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-black/40">or</span>
            </div>
          </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">Username</label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    className="h-14 w-full rounded-2xl border border-black/10 bg-black/5 pl-12 pr-4 text-sm font-medium focus:border-black/30 focus:outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">Email address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-14 w-full rounded-2xl border border-black/10 bg-black/5 pl-12 pr-4 text-sm font-medium focus:border-black/30 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">Password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 w-full rounded-2xl border border-black/10 bg-black/5 pl-12 pr-4 text-sm font-medium focus:border-black/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="flex h-14 w-full items-center justify-center rounded-full bg-black text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isAuthLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <div className="flex items-center gap-2">
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight size={18} />
              </div>
            )}
          </button>
        </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-black/40">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              to={mode === "login" ? "/signup" : "/login"}
              className="font-bold text-black hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
