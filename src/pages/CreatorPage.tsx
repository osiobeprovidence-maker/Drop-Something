import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { UserProfile, Tip } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  Heart, 
  Share2, 
  MessageSquare, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Mic,
  Home as HomeIcon,
  Users as MembersIcon,
  ShoppingBag,
  FileText,
  Play,
  PlayCircle,
  ExternalLink,
  Target,
  Zap,
  Star,
  Award,
  Video,
  ArrowRight,
  Sparkles,
  ShoppingBag as ShopIcon,
  LayoutGrid,
  Twitter,
  Instagram,
  Globe
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import confetti from 'canvas-confetti';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { VoicePlayer } from '../components/VoicePlayer';

declare const PaystackPop: any;

export function CreatorPage() {
  const { username } = useParams();

  const creator = useQuery(
    api.users.getUserByUsername,
    username ? { username: username.toLowerCase() } : 'skip'
  );

  const tips = useQuery(
    api.tips.getTipsByCreator,
    creator ? { creatorId: creator.uid } : 'skip'
  );

  const createTip = useMutation(api.tips.createTip);

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [paystackAvailable, setPaystackAvailable] = useState<boolean>(() => {
    try {
      return typeof (window as any).PaystackPop !== 'undefined';
    } catch (e) {
      return false;
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'members' | 'shop' | 'bio'>('home');

  const loading = creator === undefined;
  const successfulTips = (tips ?? []).filter(t => t.status === 'success');

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handlePay = async () => {
    if (!creator) return;
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount < 100) {
      alert('Minimum tip is ₦100');
      return;
    }

    setIsPaying(true);
    // Ensure Paystack script is loaded
    if (typeof (window as any).PaystackPop === 'undefined') {
      const key = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!key) {
        alert('Paystack is not configured for this environment.');
        setIsPaying(false);
        return;
      }
      try {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://js.paystack.co/v1/inline.js';
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Paystack script'));
          document.head.appendChild(s);
        });
        setPaystackAvailable(true);
      } catch (err) {
        console.error('Paystack load error', err);
        alert('Unable to load payment provider. Please try again later.');
        setIsPaying(false);
        return;
      }
    }

    const handler = (window as any).PaystackPop.setup({
      key: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
      email: 'supporter@dropsomething.ng',
      amount: finalAmount * 100,
      currency: 'NGN',
      callback: async (response: any) => {
        try {
          await createTip({
            creatorId: creator.uid,
            supporterName: isAnonymous ? 'Anonymous' : (name || 'Someone'),
            amount: finalAmount,
            message,
            isAnonymous,
            paymentReference: response.reference,
            voiceUrl: response.voiceUrl,
            status: 'success',
          });
          setShowSuccess(true);
          triggerConfetti();
          setAudioBlob(null);
          setName('');
          setMessage('');
          setCustomAmount('');
        } catch (err) {
          console.error(err);
        } finally {
          setIsPaying(false);
        }
      },
      onClose: () => {
        setIsPaying(false);
      }
    });

    handler.openIframe();
  };

  const processPaymentWithVoice = async () => {
    if (!creator) return;
    setIsPaying(true);

    let voiceUrl = undefined;
    if (audioBlob) {
      try {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type },
          body: audioBlob,
        });
        const { storageId } = await result.json();
        voiceUrl = storageId;
      } catch (err) {
        console.error("Voice upload failed:", err);
      }
    }

    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    const handler = (window as any).PaystackPop.setup({
      key: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
      email: 'supporter@dropsomething.ng',
      amount: finalAmount * 100,
      currency: 'NGN',
      callback: async (response: any) => {
        try {
          await createTip({
            creatorId: creator.uid,
            supporterName: isAnonymous ? 'Anonymous' : (name || 'Someone'),
            amount: finalAmount,
            message,
            isAnonymous,
            paymentReference: response.reference,
            voiceUrl: voiceUrl,
            status: 'success',
          });
          setShowSuccess(true);
          triggerConfetti();
          setAudioBlob(null);
          setName('');
          setMessage('');
          setCustomAmount('');
        } catch (err) {
          console.error(err);
        } finally {
          setIsPaying(false);
        }
      },
      onClose: () => {
        setIsPaying(false);
      }
    });

    handler.openIframe();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-primary" /></div>;
  if (!creator) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center space-y-8 shadow-2xl border border-gray-100"
            >
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Heart size={48} fill="currentColor" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Thank You!</h2>
                <p className="text-gray-500 font-bold leading-relaxed">
                  Your support means the world to <span className="text-gray-900">{creator.displayName}</span>.
                </p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="w-full py-5 bg-black text-white rounded-full font-black text-lg">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {creator.coverURL ? (
          <img src={creator.coverURL} alt="Cover" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. PROFILE HEADER */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-8 pb-10">
          <div className="relative group">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-[3.5rem] bg-white p-2 shadow-2xl overflow-hidden border-4 border-white">
              {creator.photoURL ? (
                <img src={creator.photoURL} alt={creator.displayName} className="w-full h-full object-cover rounded-[3rem]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/20 bg-gray-50 uppercase text-6xl font-black">
                  {creator.displayName[0]}
                </div>
              )}
            </div>
            {creator.isVerified && (
              <div className="absolute bottom-4 right-4 bg-secondary text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                <ShieldCheck size={28} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-lg leading-none">
                {creator.displayName}
              </h1>
              <p className="text-xl md:text-2xl font-bold text-white/90 tracking-tight drop-shadow-md">
                @{creator.username}
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <button onClick={() => {
                navigator.share?.({ title: creator.displayName, url: window.location.href });
              }} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-lg">
                <Share2 size={24} />
              </button>
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-white flex gap-8 shadow-lg">
                <div className="text-center border-r border-white/10 pr-8">
                  <p className="text-2xl font-black">{successfulTips.length}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Supporters</p>
                </div>
                <div className="text-center border-r border-white/10 pr-8">
                  <p className="text-2xl font-black">{(creator.membershipTiers?.length || 0) * 12 + 5}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black">{creator.products?.length || 0}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION (Sticky) */}
      <div className="sticky top-24 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-100 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-12 h-20">
            {[
              { id: 'home', label: 'Home', icon: HomeIcon },
              { id: 'members', label: 'Members', icon: MembersIcon },
              { id: 'shop', label: 'Shop', icon: ShopIcon },
              { id: 'bio', label: 'Bio', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative h-full flex items-center gap-3 font-black text-sm uppercase tracking-widest transition-all px-2",
                  activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Side: Content Tabs */}
          <div className="lg:col-span-12 space-y-16">
            
            {activeTab === 'home' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-24">
                
                {/* Home: Support & Intro */}
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-12">
                     {/* Support Card (Moved into Home Main Area as requested) */}
                    <div className="premium-card-soft space-y-10 relative overflow-hidden bg-white">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner">
                          <Heart size={32} fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Drop something for {creator.displayName}</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                          {[500, 1000, 5000].map((val) => (
                            <button key={val} onClick={() => { setAmount(val); setCustomAmount(''); }} className={cn("py-6 rounded-3xl font-black text-xl transition-all border-2", amount === val && !customAmount ? "bg-primary text-white border-primary shadow-xl scale-[1.05]" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-100 hover:bg-white hover:text-gray-600")}>
                              ₦{val.toLocaleString()}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                          placeholder="Enter custom amount (₦)"
                          className="premium-input text-2xl font-black"
                        />
                        <div className="space-y-4">
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="premium-input" />
                          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave a message..." rows={3} className="premium-input resize-none" />
                        </div>
                        <VoiceRecorder onRecordingComplete={(blob) => setAudioBlob(blob)} isUploading={isPaying} />
                        <button onClick={processPaymentWithVoice} disabled={isPaying} className="w-full py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4">
                          {isPaying ? <Loader2 className="animate-spin" size={24} /> : <Heart size={24} fill="currentColor" />}
                          Support with {formatCurrency(customAmount ? parseInt(customAmount) : amount)}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Media Previews */}
                    <div className="premium-card-soft bg-gray-900 text-white space-y-6">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <Video size={20} className="text-primary" />
                        Video Message
                      </h3>
                      <div className="aspect-video bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center group cursor-pointer relative overflow-hidden">
                        {creator.mediaIntros?.videoUrl ? (
                          <video 
                            src={creator.mediaIntros.videoUrl} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            poster={creator.coverURL || creator.photoURL}
                            controls
                          />
                        ) : (
                          <PlayCircle size={64} className="text-white opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110 z-10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-40 group-hover:opacity-60 transition-opacity" />
                        <span className="absolute bottom-6 left-6 text-xs font-black uppercase tracking-widest opacity-60">Preview Message</span>
                      </div>
                    </div>

                    <div className="premium-card-soft bg-white border border-gray-100 space-y-6">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <Mic size={20} className="text-secondary" />
                        Voice Intro
                      </h3>
                      {creator.mediaIntros?.voiceUrl ? (
                        <div className="p-4 bg-gray-50 rounded-[2rem]">
                          <VoicePlayer url={creator.mediaIntros.voiceUrl} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                          <button className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                            <Play fill="currentColor" size={24} />
                          </button>
                          <div className="flex-1 space-y-2">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-secondary w-1/3" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personal Voice Message • 0:45</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Home: Goal & Membership Preview */}
                <div className="grid lg:grid-cols-2 gap-12">
                   {/* Goal Card */}
                  <div className="premium-card-soft bg-white border border-gray-100 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                       <Target className="text-accent opacity-10" size={120} />
                    </div>
                    <div className="space-y-1 relative z-10">
                      <span className="label-mini text-accent">Active Campaign</span>
                      <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{creator.goal?.title || "Project Funding"}</h3>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-end">
                        <p className="text-5xl font-black text-gray-900 tracking-tighter">₦{(creator.goal?.current || 0).toLocaleString()} <span className="text-gray-400 text-lg font-bold">/ ₦{(creator.goal?.target || 50000).toLocaleString()}</span></p>
                        <p className="text-sm font-black text-accent uppercase tracking-widest">
                          {Math.min(100, Math.round(((creator.goal?.current || 0) / (creator.goal?.target || 50000)) * 100))}% Funded
                        </p>
                      </div>
                      <div className="w-full bg-gray-50 rounded-full h-4 overflow-hidden p-1 shadow-inner border border-gray-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.round(((creator.goal?.current || 0) / (creator.goal?.target || 50000)) * 100))}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-accent rounded-full shadow-[0_0_15px_rgba(255,221,0,0.5)]" />
                      </div>
                    </div>
                  </div>

                  {/* Membership Preview */}
                  <div className="premium-card-soft bg-secondary text-white space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <div className="space-y-2 relative z-10">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                        <MembersIcon size={28} />
                      </div>
                      <h3 className="text-3xl font-black tracking-tighter">Join the Fam</h3>
                      <p className="text-white/70 font-bold leading-tight">Unlock exclusive content, direct access, and support the hustle monthly.</p>
                    </div>
                    <div className="flex items-center justify-between items-center pt-4 relative z-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Starts at</p>
                        <p className="text-3xl font-black tracking-tighter">₦2,500<span className="text-sm opacity-60 font-bold">/mo</span></p>
                      </div>
                      <button onClick={() => setActiveTab('members')} className="px-8 py-4 bg-white text-secondary rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                        View Tiers
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Supporters List  */}
                <div className="space-y-12">
                   <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Community Love</h3>
                    <div className="flex -space-x-4">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                          <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center font-black text-[10px] shadow-lg">
                        +{successfulTips.length}
                      </div>
                    </div>
                   </div>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {successfulTips.slice(0, 6).map((tip, i) => (
                        <motion.div 
                          key={tip._id} 
                          initial={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          transition={{ delay: i * 0.1 }}
                          className="premium-card-soft bg-white border border-gray-50 flex gap-5 hover:-translate-y-2"
                        >
                          <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 border border-primary/10">
                            {tip.supporterName[0].toUpperCase()}
                          </div>
                          <div className="space-y-2 overflow-hidden">
                            <p className="font-black text-gray-900 truncate">
                              {tip.supporterName}
                            </p>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">₦{tip.amount.toLocaleString()} Drop</span>
                            {tip.message && (
                              <p className="text-xs text-gray-400 font-bold italic leading-relaxed line-clamp-2 mt-2">"{tip.message}"</p>
                            )}
                          </div>
                        </motion.div>
                     ))}
                   </div>
                </div>

                {/* Shop Preview Card */}
                <div className="premium-card-soft bg-gray-50 border border-gray-200 flex flex-col md:flex-row items-center gap-12 overflow-hidden group">
                  <div className="flex-1 space-y-8">
                    <div className="space-y-2">
                       <span className="label-mini text-gray-400">Official Merch</span>
                       <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">DropSomething <br/>Exclusive Collection</h3>
                       <p className="text-xl text-gray-500 font-bold max-w-sm italic">Limited edition drops designed by {creator.displayName}. Available only for supporters.</p>
                    </div>
                    <button onClick={() => setActiveTab('shop')} className="px-12 py-5 bg-gray-900 text-white rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 w-fit">
                       Visit Shop
                       <ArrowRight size={24} />
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-6 scale-95 group-hover:scale-100 transition-transform duration-700">
                    <div className="aspect-[4/5] bg-white rounded-3xl shadow-xl overflow-hidden rotate-1 mt-10">
                      <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-[4/5] bg-white rounded-3xl shadow-xl overflow-hidden -rotate-2">
                      <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Support Button Footer */}
                <div className="text-center py-20 bg-primary/5 rounded-[4rem] border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary/20 blur-[100px] w-96 h-96 rounded-full" />
                  <div className="relative z-10 space-y-10">
                    <h3 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic">Drop something <br/><span className="text-primary">extraordinary.</span></h3>
                    <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="px-16 py-8 bg-black text-white rounded-full font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center gap-6 mx-auto">
                       <Sparkles size={40} className="text-primary" />
                       Support {creator.displayName}
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-24">
                {/* Tiers Grid */}
                <div className="grid md:grid-cols-3 gap-10">
                  {(creator.membershipTiers && creator.membershipTiers.length > 0 ? creator.membershipTiers : [
                    { title: "Supporter", price: 2500, benefits: ["Exclusive Voice Updates", "Support Message Priority", "Verified Fan Badge"] },
                    { title: "Inner Circle", price: 10000, benefits: ["Behind-the-scenes Feed", "Monthly Video AMA", "Direct Chat Access", "Limited Merch Discount"] },
                    { title: "Executive", price: 50000, benefits: ["Project Sponsorship Tag", "1:1 Consultation Call", "Early Product Access", "Profile Link Shoutout"] },
                  ]).map((tier, i) => (
                    <div key={i} className="premium-card-soft space-y-10 relative overflow-hidden flex flex-col hover:-translate-y-4">
                      {i === 1 && <div className="absolute top-6 right-6 px-3 py-1 bg-white text-primary text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Top Value</div>}
                      <div className="space-y-4">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl", i % 3 === 0 ? "bg-secondary" : i % 3 === 1 ? "bg-primary" : "bg-gray-900")}>
                           <MembersIcon size={28} />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{tier.title}</h3>
                        <p className="text-4xl font-black text-gray-900 tracking-tight">₦{tier.price.toLocaleString()}<span className="text-sm font-bold opacity-30">/mo</span></p>
                      </div>
                      <div className="space-y-4 flex-1">
                        <p className="label-mini text-gray-300">What's Included</p>
                        <ul className="space-y-3">
                          {tier.benefits.map((b, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm font-bold text-gray-500">
                              <CheckCircle2 size={16} className="text-secondary shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button className={cn("w-full py-5 rounded-full font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95", i % 3 === 1 ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100")}>
                        Join Tier
                      </button>
                    </div>
                  ))}
                </div>

                {/* Members Feed Preview */}
                <div className="space-y-12">
                   <h3 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                     <Sparkles size={32} className="text-primary" />
                     Members-Only Hustle
                   </h3>
                   <div className="grid md:grid-cols-2 gap-12">
                     <div className="premium-card-soft bg-gray-50 border border-gray-100 space-y-6 relative overflow-hidden group grayscale hover:grayscale-0 transition-all cursor-pointer">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-10 text-center opacity-100 group-hover:opacity-90 transition-opacity">
                           <ShieldCheck size={48} className="mb-4 text-primary" />
                           <h4 className="text-2xl font-black tracking-tighter">Locked Update</h4>
                           <p className="font-bold opacity-60">This voice update is for Members only. Join the hustle to listen.</p>
                        </div>
                         <div className="w-full h-40 bg-gray-200 rounded-[2rem] overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                          <Mic size={18} />
                          <span className="text-xs font-black uppercase tracking-widest leading-none">Voice Memo from Creator • 3 days ago</span>
                        </div>
                     </div>
                     <div className="premium-card-soft bg-gray-50 border border-gray-100 space-y-6 relative overflow-hidden group grayscale hover:grayscale-0 transition-all cursor-pointer">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 p-10 text-center opacity-100 group-hover:opacity-90 transition-opacity">
                           <ShieldCheck size={48} className="mb-4 text-secondary" />
                           <h4 className="text-2xl font-black tracking-tighter">Locked Video</h4>
                           <p className="font-bold opacity-60">Exclusive behind-the-scenes video. Only for Inner Circle & above.</p>
                        </div>
                        <div className="w-full h-40 bg-gray-200 rounded-[2rem] overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                          <Video size={18} />
                          <span className="text-xs font-black uppercase tracking-widest leading-none">Work Routine BTS • 5 days ago</span>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="text-center">
                  <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="px-16 py-6 bg-black text-white rounded-full font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto">
                    <Heart size={24} fill="currentColor" />
                    Drop a support tip instead
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-24">
                {/* Featured Product */}
                {creator.products?.[0] ? (
                  <div className="premium-card-soft bg-gray-900 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48" />
                    <div className="flex-1 aspect-square md:aspect-video rounded-[3rem] overflow-hidden relative shadow-2xl">
                      <img src={creator.products[0].imageUrl} alt={creator.products[0].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 px-4 py-2 bg-primary text-white text-xs font-black rounded-xl uppercase tracking-widest leading-none shadow-lg">Featured Drop</div>
                    </div>
                    <div className="flex-1 space-y-10 relative z-10 text-white">
                      <div className="space-y-4">
                        <h3 className="text-5xl font-black tracking-tighter leading-none">{creator.products[0].title}</h3>
                        <p className="text-2xl font-black text-primary">₦{creator.products[0].price.toLocaleString()}</p>
                        <p className="text-lg text-gray-400 font-bold max-w-sm italic">{creator.products[0].description}</p>
                      </div>
                      <div className="space-y-6">
                        <button className="w-full md:w-auto px-12 py-5 bg-white text-black rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4">
                          <ShoppingBag size={24} />
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="premium-card-soft bg-white border border-gray-100 p-20 text-center space-y-6">
                    <ShopIcon size={64} className="mx-auto text-gray-200" />
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">No products yet</h3>
                    <p className="text-xl text-gray-400 font-bold italic">Check back soon for exclusive merchandise.</p>
                  </div>
                )}

                {/* Products Grid */}
                {creator.products && creator.products.length > 1 && (
                  <div className="space-y-12">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                      <LayoutGrid size={32} className="text-secondary" />
                      The Collection
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                      {creator.products.slice(1).map((item, i) => (
                        <div key={i} className="group cursor-pointer space-y-4">
                          <div className="aspect-[3/4] rounded-[2.5rem] bg-gray-50 overflow-hidden relative border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all group-hover:-translate-y-2">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="px-2">
                            <h4 className="font-black text-gray-900 group-hover:text-primary transition-colors">{item.title}</h4>
                            <p className="text-gray-400 font-bold">₦{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="px-16 py-6 bg-black text-white rounded-full font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto">
                    <Sparkles size={24} className="text-primary" />
                    Drop a support tip instead
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'bio' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-24">
                
                {/* Social Links */}
                                <div className="space-y-12">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-[1.5rem] flex items-center justify-center">
                        <Globe size={32} />
                      </div>
                      <h3 className="text-5xl font-black text-gray-900 tracking-tighter">Connect</h3>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {creator.socialLinks?.twitter && (
                        <a href={`https://twitter.com/${creator.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="premium-card-soft bg-white border border-gray-100 flex items-center justify-between hover:scale-105 transition-transform group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                               <Twitter size={20} fill="currentColor" />
                             </div>
                             <span className="font-black text-gray-900">Twitter</span>
                          </div>
                          <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </a>
                      )}
                      {creator.socialLinks?.instagram && (
                        <a href={`https://instagram.com/${creator.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="premium-card-soft bg-white border border-gray-100 flex items-center justify-between hover:scale-105 transition-transform group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-xl flex items-center justify-center">
                               <Instagram size={20} />
                             </div>
                             <span className="font-black text-gray-900">Instagram</span>
                          </div>
                          <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </a>
                      )}
                      {creator.socialLinks?.website && (
                        <a href={creator.socialLinks.website} target="_blank" rel="noreferrer" className="premium-card-soft bg-white border border-gray-100 flex items-center justify-between hover:scale-105 transition-transform group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center">
                               <Globe size={20} />
                             </div>
                             <span className="font-black text-gray-900">Website</span>
                          </div>
                          <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </a>
                      )}
                   </div>
                </div>
                {/* Creator Story */}
                <div className="space-y-10">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center">
                        <FileText size={32} />
                      </div>
                      <h3 className="text-5xl font-black text-gray-900 tracking-tighter">My Story</h3>
                   </div>
                   <div className="premium-card-soft bg-white border border-gray-100 p-12 space-y-8">
                      <p className="text-2xl text-gray-600 font-bold leading-relaxed whitespace-pre-wrap italic">
                        "{creator.bio || "Welcome to my creative space! I've been building and creating for as long as I can remember. Every drop helps me keep the lights on and focus more of my time on delivering quality content and projects for this amazing community. Thank you for being part of the journey."}"
                      </p>
                      <div className="pt-8 border-t border-gray-100 space-y-8">
                         <h4 className="label-mini text-gray-300">Why support me?</h4>
                         <div className="grid md:grid-cols-2 gap-8">
                            {[
                              { icon: Zap, title: "Pure Independence", desc: "No sponsors deciding what I should or shouldn't create." },
                              { icon: Heart, title: "Better Quality", desc: "Tips go directly into better equipment and research." },
                              { icon: Star, title: "Support Community", desc: "Everything I build is shared back with you all." },
                              { icon: Award, title: "Direct Connection", desc: "No middleman, just me and my most loyal community." },
                            ].map((b, i) => (
                              <div key={i} className="flex gap-5">
                                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-900 border border-gray-100">
                                   <b.icon size={24} />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="font-black text-gray-900">{b.title}</p>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed">{b.desc}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Voice & Video Bio Intro */}
                <div className="grid md:grid-cols-2 gap-12">
                   <div className="premium-card-soft space-y-8">
                      <h4 className="label-mini">Voice Intro</h4>
                      <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                        <button className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shrink-0">
                          <Play fill="currentColor" size={24} />
                        </button>
                        <div className="flex-1 space-y-2 overflow-hidden">
                          <div className="h-2 w-full bg-white rounded-full flex gap-1 px-1 items-center">
                             {[...Array(20)].map((_, i) => <div key={i} className="h-4 w-1 bg-secondary/20 rounded-full" style={{ height: `${Math.random() * 100}%` }} />)}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Intro Message • 0:34</p>
                        </div>
                      </div>
                   </div>
                   <div className="premium-card-soft space-y-8 overflow-hidden group">
                      <h4 className="label-mini">Video Welcome</h4>
                      <div className="aspect-video bg-gray-900 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center">
                         <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                         <PlayCircle size={64} className="text-white relative z-10 opacity-60 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                   </div>
                </div>

                {/* Social Links */}
                <div className="space-y-10">
                   <h3 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-center">Connect with me</h3>
                   <div className="flex flex-wrap justify-center gap-6">
                      {[
                        { icon: Twitter, label: "Twitter", link: creator.socialLinks?.twitter },
                        { icon: Instagram, label: "Instagram", link: creator.socialLinks?.instagram },
                        { icon: Globe, label: "Website", link: creator.socialLinks?.website },
                      ].filter(s => s.link).map((social, i) => (
                        <a key={i} href={social.link} target="_blank" className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all">
                           <social.icon size={20} />
                           {social.label}
                           <ExternalLink size={14} className="opacity-30" />
                        </a>
                      ))}
                   </div>
                </div>

                <div className="text-center pt-10">
                  <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="px-16 py-8 bg-primary text-white rounded-full font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(255,139,167,0.4)] flex items-center justify-center gap-6 mx-auto">
                    <Heart size={40} fill="currentColor" />
                    Support my hustle
                  </button>
                </div>

              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
