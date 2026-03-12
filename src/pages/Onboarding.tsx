import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../AuthContext';
import { MediaUpload } from '../components/MediaUpload';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  User, 
  Image as ImageIcon, 
  Layers, 
  ShoppingBag, 
  BookOpen, 
  CheckCircle2,
  Loader2,
  Lock,
  Plus,
  Trash2,
  Globe,
  Twitter,
  Instagram
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CreatorPreview } from '../components/CreatorPreview';

type Step = 'email' | 'profile' | 'membership' | 'shop' | 'bio' | 'publish' | 'success';

export function Onboarding() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, user, profile } = useAuth();
  const createUser = useMutation(api.users.createUser);
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Skip email step if user is already logged in but has no profile
  React.useEffect(() => {
    if (user && currentStep === 'email') {
      if (profile) {
        navigate('/dashboard');
      } else {
        if (user.email) setEmail(user.email);
        setCurrentStep('profile');
      }
    }
  }, [user, profile, currentStep, navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: '',
    tagline: '',
    photoURL: '',
    coverURL: '',
    username: '' // We'll generate/validate this in Step 1
  });
  const [tiers, setTiers] = useState<{ title: string; price: number; benefits: string[] }[]>([]);
  const [products, setProducts] = useState<{ title: string; price: number; description: string; imageUrl: string }[]>([]);
  const [bioData, setBioData] = useState({
    bio: '',
    twitter: '',
    instagram: '',
    website: ''
  });
  const [password, setPassword] = useState('');

  // Convex Email Existence Check
  const checkEmailQuery = useQuery(api.users.checkEmail, { email });

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Give time for query to resolve if needed
    if (checkEmailQuery?.exists) {
      toast.info('Email already exists. Redirecting to login...');
      navigate('/login', { state: { email } });
    } else {
      setCurrentStep('profile');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // After Google Sign-In, the useEffect above will trigger and move to 'profile'
    } catch (err) {
      toast.error('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      let uid = user?.uid;
      
      // 1. Create Firebase Auth account if not already logged in
      if (!uid) {
        const authResult = await signUpWithEmail(email, password);
        uid = (authResult as any).user.uid;
      }
      
      // 2. Create Convex User record
      // We need to generate a unique username if they didn't provide one or use display name
      const baseUsername = profileData.username || profileData.displayName.toLowerCase().replace(/\s+/g, '');
      
      await createUser({
        uid: uid,
        email: email.toLowerCase(),
        username: baseUsername,
        displayName: profileData.displayName,
        tagline: profileData.tagline,
        bio: bioData.bio,
        photoURL: profileData.photoURL || '',
        coverURL: profileData.coverURL || '',
        membershipTiers: tiers,
        products: products,
        socialLinks: {
          twitter: bioData.twitter,
          instagram: bioData.instagram,
          website: bioData.website
        }
      });
      
      setCurrentStep('success');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to publish page');
    } finally {
      setLoading(false);
    }
  };

  const steps: Step[] = ['email', 'profile', 'membership', 'shop', 'bio', 'publish'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-black font-sans py-20 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none" />

      <div className="relative z-10">
        <div className={cn(
          "grid lg:grid-cols-12 gap-12 items-start",
          (currentStep === 'email' || currentStep === 'success') && "max-w-2xl mx-auto"
        )}>
          {/* LEFT SIDE: FORM */}
          <div className={cn(
            "lg:col-span-7 space-y-8",
            (currentStep === 'email' || currentStep === 'success') && "lg:col-span-12",
            currentStep !== 'email' && currentStep !== 'success' && mobileTab === 'preview' && "hidden lg:block"
          )}>
            {/* Progress Indicator */}
            {currentStep !== 'email' && currentStep !== 'success' && (
              <div className="mb-12 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1 rounded-full">Step {currentStepIndex} of 5</span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mt-2">{currentStep.charAt(0).toUpperCase() + currentStep.slice(1)} Setup</h2>
                  </div>
                  <span className="text-sm font-black text-gray-400">{Math.round((currentStepIndex / 5) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStepIndex / 5) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
          {currentStep === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">
                  Let's start your <br /><span className="text-primary italic">creator journey.</span>
                </h1>
                <p className="text-xl text-gray-500 font-bold">Enter your email to get started.</p>
              </div>

              <form onSubmit={handleEmailContinue} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={24} />
                  <input 
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-full py-6 pl-16 pr-8 text-xl font-bold focus:border-primary outline-none transition-all shadow-sm focus:shadow-xl"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={24} /></>}
                </button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-gray-300"><span className="bg-white px-6">OR</span></div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-6 bg-white border-2 border-gray-100 rounded-full font-black text-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-4 active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                Continue with Google
              </button>
            </motion.div>
          )}

          {currentStep === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                    <label className="label-mini ml-1">Cover Photo</label>
                    <MediaUpload 
                      aspect="cover"
                      type="image"
                      defaultUrl={profileData.coverURL}
                      onUploadComplete={(url) => setProfileData(prev => ({ ...prev, coverURL: url }))}
                    />
                  </div>
                  <div className="flex justify-center -mt-16 relative z-20">
                    <div className="space-y-2">
                      <MediaUpload 
                        aspect="square"
                        type="image"
                        defaultUrl={profileData.photoURL}
                        onUploadComplete={(url) => setProfileData(prev => ({ ...prev, photoURL: url }))}
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="label-mini ml-1">Display Name</label>
                    <input 
                      required
                      placeholder="e.g. Riderezzy"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="premium-input text-2xl font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-mini ml-1">Tagline</label>
                    <input 
                      required
                      placeholder="e.g. Digital Artist & Content Creator"
                      value={profileData.tagline}
                      onChange={(e) => setProfileData(prev => ({ ...prev, tagline: e.target.value }))}
                      className="premium-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button 
                  onClick={() => setCurrentStep('email')}
                  className="flex-1 py-6 bg-gray-50 text-gray-500 rounded-full font-black text-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <ArrowLeft size={24} /> Back
                </button>
                <button 
                  onClick={() => setCurrentStep('membership')}
                  disabled={!profileData.displayName || !profileData.tagline}
                  className="flex-[2] py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Continue <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'membership' && (
            <motion.div
              key="membership"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Membership Tiers</h3>
                  <button 
                    onClick={() => setTiers([...tiers, { title: 'Early Supporter', price: 1000, benefits: ['Exclusive Updates'] }])}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                  >
                    <Plus size={14} /> Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {tiers.map((tier, idx) => (
                    <div key={idx} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6 relative group">
                      <button 
                        onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
                        className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          value={tier.title} 
                          onChange={(e) => {
                            const newTiers = [...tiers];
                            newTiers[idx].title = e.target.value;
                            setTiers(newTiers);
                          }}
                          placeholder="Tier Name"
                          className="premium-input bg-white"
                        />
                        <input 
                          type="number"
                          value={tier.price} 
                          onChange={(e) => {
                            const newTiers = [...tiers];
                            newTiers[idx].price = Number(e.target.value);
                            setTiers(newTiers);
                          }}
                          placeholder="₦ / mo"
                          className="premium-input bg-white"
                        />
                      </div>
                      <input 
                        value={tier.benefits.join(', ')} 
                        onChange={(e) => {
                          const newTiers = [...tiers];
                          newTiers[idx].benefits = e.target.value.split(',').map(b => b.trim());
                          setTiers(newTiers);
                        }}
                        placeholder="Benefits (comma separated)"
                        className="premium-input bg-white text-sm"
                      />
                    </div>
                  ))}
                  {tiers.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2.5rem] space-y-4">
                      <Layers size={48} className="mx-auto text-gray-200" />
                      <p className="text-gray-400 font-bold">No tiers added yet. This is optional.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button 
                  onClick={() => setCurrentStep('profile')}
                  className="flex-1 py-6 bg-gray-50 text-gray-500 rounded-full font-black text-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <ArrowLeft size={24} /> Back
                </button>
                <button 
                  onClick={() => setCurrentStep('shop')}
                  className="flex-[2] py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {tiers.length > 0 ? 'Continue' : 'Skip & Continue'} <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Featured Products</h3>
                  <button 
                    onClick={() => setProducts([...products, { title: 'New Product', price: 5000, description: '', imageUrl: '' }])}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {products.map((product, idx) => (
                    <div key={idx} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6 relative group">
                      <button 
                        onClick={() => setProducts(products.filter((_, i) => i !== idx))}
                        className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors z-10"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="flex flex-col md:flex-row gap-8">
                        <MediaUpload 
                          aspect="square"
                          type="image"
                          onUploadComplete={(url) => {
                            const newProds = [...products];
                            newProds[idx].imageUrl = url;
                            setProducts(newProds);
                          }}
                          className="w-40"
                        />
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              value={product.title} 
                              onChange={(e) => {
                                const newProds = [...products];
                                newProds[idx].title = e.target.value;
                                setProducts(newProds);
                              }}
                              placeholder="Product Name"
                              className="premium-input bg-white"
                            />
                            <input 
                              type="number"
                              value={product.price} 
                              onChange={(e) => {
                                const newProds = [...products];
                                newProds[idx].price = Number(e.target.value);
                                setProducts(newProds);
                              }}
                              placeholder="Price ₦"
                              className="premium-input bg-white"
                            />
                          </div>
                          <textarea 
                            value={product.description}
                            onChange={(e) => {
                              const newProds = [...products];
                              newProds[idx].description = e.target.value;
                              setProducts(newProds);
                            }}
                            placeholder="Brief description..."
                            className="premium-input bg-white text-sm min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2.5rem] space-y-4">
                      <ShoppingBag size={48} className="mx-auto text-gray-200" />
                      <p className="text-gray-400 font-bold">No products added yet. This is optional.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button 
                  onClick={() => setCurrentStep('membership')}
                  className="flex-1 py-6 bg-gray-50 text-gray-500 rounded-full font-black text-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <ArrowLeft size={24} /> Back
                </button>
                <button 
                  onClick={() => setCurrentStep('bio')}
                  className="flex-[2] py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {products.length > 0 ? 'Continue' : 'Skip & Continue'} <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'bio' && (
            <motion.div
              key="bio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="label-mini ml-1">Your Story</label>
                  <textarea 
                    placeholder="Tell your audience about yourself and your creative process..."
                    value={bioData.bio}
                    onChange={(e) => setBioData(prev => ({ ...prev, bio: e.target.value }))}
                    className="premium-input min-h-[200px] text-lg leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="label-mini ml-1">Social Links (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Twitter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        value={bioData.twitter}
                        onChange={(e) => setBioData(prev => ({ ...prev, twitter: e.target.value }))}
                        placeholder="Twitter Handle" 
                        className="premium-input pl-14 text-sm" 
                      />
                    </div>
                    <div className="relative">
                      <Instagram size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        value={bioData.instagram}
                        onChange={(e) => setBioData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="Instagram Handle" 
                        className="premium-input pl-14 text-sm" 
                      />
                    </div>
                    <div className="relative md:col-span-2">
                      <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input 
                        value={bioData.website}
                        onChange={(e) => setBioData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="Website URL" 
                        className="premium-input pl-14 text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button 
                  onClick={() => setCurrentStep('shop')}
                  className="flex-1 py-6 bg-gray-50 text-gray-500 rounded-full font-black text-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <ArrowLeft size={24} /> Back
                </button>
                <button 
                  onClick={() => setCurrentStep('publish')}
                  className="flex-[2] py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {bioData.bio ? 'Continue' : 'Skip & Continue'} <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'publish' && (
            <motion.div
              key="publish"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                  <Lock size={40} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Secure your account</h2>
                <p className="text-xl text-gray-500 font-bold">Create a password to publish your page.</p>
              </div>

              <form onSubmit={handlePublish} className="space-y-6">
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={24} />
                  <input 
                    type="password"
                    required
                    placeholder="Enter a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-gray-100 rounded-full py-6 pl-16 pr-8 text-xl font-bold focus:border-primary outline-none transition-all shadow-sm focus:shadow-xl"
                  />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                    <CheckCircle2 size={16} className="text-primary" />
                    Publish Summary
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-400">Email</span>
                      <span className="text-gray-900">{email}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-400">Display Name</span>
                      <span className="text-gray-900">{profileData.displayName}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-400">Memberships</span>
                      <span className="text-gray-900">{tiers.length} Tiers</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-400">Products</span>
                      <span className="text-gray-900">{products.length} Products</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setCurrentStep('bio')}
                    className="flex-1 py-6 bg-gray-50 text-gray-500 rounded-full font-black text-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || password.length < 6}
                    className="flex-[3] py-6 bg-primary text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--primary),0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Publish My Page <CheckCircle2 size={24} /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-primary text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
                  <CheckCircle2 size={60} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">Your creator page <br /><span className="text-primary italic">is live.</span></h2>
                  <p className="text-xl text-gray-500 font-bold max-w-sm mx-auto">Congratulations! You're officially a part of the DropSomething community.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-gray-50 rounded-[3rem] border border-gray-100 space-y-6">
                   <div className="space-y-2">
                      <label className="label-mini text-gray-400">Your Personal Link</label>
                      <div className="bg-white border-2 border-gray-100 rounded-full py-4 px-6 font-black text-lg text-gray-900 flex items-center justify-between">
                        <span>dropsomething.com/{profileData.username || profileData.displayName.toLowerCase().replace(/\s+/g, '')}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`dropsomething.com/${profileData.username || profileData.displayName.toLowerCase().replace(/\s+/g, '')}`);
                            toast.success('Link copied!');
                          }}
                          className="text-primary text-[10px] uppercase tracking-widest hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                   </div>
                   <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                   >
                     Go to Dashboard
                   </button>
                </div>
                
                <p className="text-sm font-bold text-gray-400">Need to make changes? You can edit your page anytime from the dashboard.</p>
              </div>
            </motion.div>
          )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE: PREVIEW */}
          {currentStep !== 'email' && currentStep !== 'success' && (
            <div className={cn(
              "lg:col-span-5 lg:sticky lg:top-12 h-[85vh] min-h-[600px]",
              mobileTab === 'edit' && "hidden lg:block"
            )}>
              <div className="h-full relative overflow-hidden">
                {/* Mobile Preview Badge */}
                <div className="lg:hidden absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                  Live Preview
                </div>
                <CreatorPreview 
                  profileData={profileData}
                  tiers={tiers}
                  products={products}
                  bioData={bioData}
                />
              </div>
            </div>
          )}
        </div>

        {/* MOBILE TABS */}
        {currentStep !== 'email' && currentStep !== 'success' && (
          <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-2xl">
            <button 
              onClick={() => setMobileTab('edit')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                mobileTab === 'edit' ? "bg-primary text-white" : "text-gray-400"
              )}
            >
              Edit
            </button>
            <button 
              onClick={() => setMobileTab('preview')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                mobileTab === 'preview' ? "bg-primary text-white" : "text-gray-400"
              )}
            >
              Preview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
