import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Coffee, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const { user, hasProfile, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  // If user is already logged in, redirect them away from auth page
  useEffect(() => {
    if (!isLoading && user) {
      if (hasProfile) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, hasProfile, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
            {mode === "login" ? "Welcome back" : "Join the hustle"}
          </h2>
          <p className="mt-2 text-sm text-black/40">
            {mode === "login" 
              ? "Sign in to manage your page and support" 
              : "Create your page and start receiving support today"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

function AlertCircle({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
