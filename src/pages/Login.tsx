import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Heart,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Login() {
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, we might want to redirect, but usually the PrivateRoute handles this.
  // We'll redirect if they land here while authenticated.
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSocialSignIn = async (method: 'google' | 'apple') => {
    setIsLoading(true);
    setError('');
    try {
      if (method === 'google') await signInWithGoogle();
      else await signInWithApple();
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to sign in with ${method}`);
      toast.error(`Sign in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmail(email, password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="premium-card-soft space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
              <Heart size={40} fill="currentColor" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                {isSignUp ? 'Join the community' : 'Welcome back'}
              </h1>
              <p className="text-xl text-gray-500 font-bold italic">
                {isSignUp ? 'Start your journey today.' : 'Your fans are waiting for you.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Social Buttons */}
            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading}
              className="w-full py-5 bg-white border border-gray-100 rounded-3xl font-black text-lg flex items-center justify-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialSignIn('apple')}
              disabled={isLoading}
              className="w-full py-5 bg-black text-white rounded-3xl font-black text-lg flex items-center justify-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.548 0-1.711-.516-2.822-.516-1.987 0-3.273 1.321-3.273 3.491 0 3.33 2.531 6.942 4.403 6.942.502 0 1.085-.299 1.691-.299.59 0 1.055.299 1.69.299 1.884 0 4.137-3.411 4.137-5.071 0-1.864-1.574-2.852-2.928-2.852-1.353 0-2.353.943-2.903.943-.548 0-1.472-.943-2.395-.943zm-.654-1.424c1.192 0 2.212-1.011 2.212-2.261 0-.153-.016-.302-.047-.442-1.077.042-2.072.718-2.61 1.408-.501.637-.872 1.545-.872 2.454 0 .167.02.327.058.468.125.011.246.017.371.017h.888z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.3em] bg-white px-4 text-gray-300">
              or
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="label-mini ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="premium-input !pl-16"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-mini ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="premium-input !pl-16"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-primary text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gray-400 font-bold hover:text-primary transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-primary font-black">Sign In</span></>
              ) : (
                <>Don't have an account? <span className="text-primary font-black">Join now</span></>
              )}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-xs font-black uppercase tracking-widest text-gray-300">
          Secured with industry-standard encryption
        </div>
      </motion.div>
    </div>
  );
}
