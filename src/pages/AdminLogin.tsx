import { useState } from "react";
import { useAdmin } from "@/src/context/AdminContext";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogIn, Mail, Lock, Loader } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isLoading, loginError } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return;
    }

    await adminLogin(trimmedEmail, trimmedPassword);

    // Navigation happens in AdminRoute component
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Admin Portal</h1>
          </div>
          <p className="text-sm font-medium text-slate-400">
            Secure access for administrators
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Alert */}
          {loginError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Login Failed</p>
                <p className="text-sm text-red-200/70">{loginError}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-white">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 pl-11 text-white placeholder-slate-500 transition-colors hover:border-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-white">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 pl-11 pr-11 text-white placeholder-slate-500 transition-colors hover:border-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="remember" className="text-sm font-medium text-slate-300">
              Keep me logged in for 24 hours
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/50 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Sign In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="rounded-lg border border-slate-600/50 bg-slate-700/30 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <span className="text-blue-400">🔒</span> Security Features
          </h3>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>✓ Password hashed with bcryptjs on server</li>
            <li>✓ Credentials stored in environment variables</li>
            <li>✓ Session expires after 24 hours</li>
            <li>✓ HTTPS only in production</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} DropSomething Admin Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
}
