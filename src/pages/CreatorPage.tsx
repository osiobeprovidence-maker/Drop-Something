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
  Mic
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
    <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 pb-20 pt-8">
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
                  You've just made their hustle a little easier!
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const link = window.location.href;
                    if (navigator.share) {
                      navigator.share({
                        title: `I just supported ${creator.displayName} on Drop Something!`,
                        text: `Check out ${creator.displayName}'s page and drop something too!`,
                        url: link,
                      });
                    } else {
                      navigator.clipboard.writeText(link);
                    }
                  }}
                  className="w-full py-5 bg-black text-white rounded-full font-black text-lg hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Share2 size={24} />
                  Share the love
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-5 bg-gray-50 text-gray-600 rounded-full font-black text-lg hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Profile Info */}
      <div className="md:col-span-5 space-y-12">
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden group">
          {/* Cover Placeholder / Background */}
          <div className="h-40 bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 opacity-[0.03] grayscale animate-pulse" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
          </div>

          <div className="p-10 pt-0 -mt-20 relative text-center space-y-8">
            <div className="relative inline-block">
              <div className="w-40 h-40 rounded-[3rem] bg-white p-2 shadow-2xl mx-auto overflow-hidden">
                {creator.photoURL ? (
                  <img src={creator.photoURL} alt={creator.displayName} className="w-full h-full object-cover rounded-[2.5rem]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/20 bg-primary/5">
                    <Heart size={64} fill="currentColor" />
                  </div>
                )}
              </div>
              {creator.isVerified && (
                <div className="absolute bottom-2 right-2 bg-secondary text-white p-2.5 rounded-2xl shadow-xl border-4 border-white" title="Verified Creator">
                  <ShieldCheck size={24} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">{creator.displayName}</h1>
              <div className="flex items-center justify-center gap-3">
                <span className="text-primary font-black uppercase tracking-widest text-xs">@{creator.username}</span>
                <div className="w-1.5 h-1.5 bg-gray-100 rounded-full" />
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Creator</span>
              </div>
            </div>

            <p className="text-xl text-gray-500 font-bold leading-relaxed whitespace-pre-wrap italic px-4">
              "{creator.bio || "Supporting the hustle!"}"
            </p>

            {/* Goal progress */}
            {creator.goal && (
              <div className="mt-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{creator.goal.title}</div>
                    <div className="text-2xl font-black text-gray-900">₦{creator.goal.current.toLocaleString()} <span className="text-gray-400 text-sm font-bold">of ₦{creator.goal.target.toLocaleString()}</span></div>
                  </div>
                  <div className="w-full bg-white rounded-full h-5 overflow-hidden p-1 shadow-inner border border-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.round((creator.goal.current / creator.goal.target) * 100))}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-accent rounded-full shadow-[0_0_15px_rgba(255,221,0,0.5)]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-gray-50 flex items-center justify-center gap-12">
              <div className="text-center group">
                <p className="text-3xl font-black text-gray-900 group-hover:text-primary transition-colors">{successfulTips.length}</p>
                <p className="label-mini !mb-0">Supporters</p>
              </div>
              <div className="h-10 w-px bg-gray-100" />
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900">YES</p>
                <p className="label-mini !mb-0">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Supporters */}
        <div className="space-y-6">
          <h3 className="label-mini px-6">Recent Support</h3>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {successfulTips.slice(0, 10).map((tip) => (
                <motion.div
                  key={tip._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl border border-gray-50 shadow-lg flex gap-5 hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-gray-400 font-black text-xl border border-gray-100">
                    {tip._id ? tip._id[0].toUpperCase() : (tip.supporterName ? tip.supporterName[0].toUpperCase() : 'S')}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-gray-900 font-black">
                      {tip.supporterName} <span className="text-primary ml-1">{formatCurrency(tip.amount)}</span>
                    </p>
                    {tip.message && (
                      <p className="text-sm text-gray-500 font-bold leading-relaxed italic">"{tip.message}"</p>
                    )}
                    {tip.voiceUrl && (
                      <div className="pt-2">
                        <VoicePlayer url={tip.voiceUrl} className="scale-75 origin-left" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {successfulTips.length === 0 && (
              <div className="text-center py-12 premium-card-soft bg-gray-50/50 border-dashed border-2 border-gray-200">
                <p className="text-gray-400 font-bold italic">Be the first to show some love! 💖</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Tip Form */}
      <div className="md:col-span-7">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl sticky top-28 space-y-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <Heart size={32} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Support the hustle</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Recipient: {creator.displayName}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => { setAmount(val); setCustomAmount(''); }}
                  className={cn(
                    "py-5 rounded-3xl font-black text-xl transition-all border-2",
                    amount === val && !customAmount
                      ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.05]"
                      : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200 hover:bg-white"
                  )}
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">₦</div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                placeholder="Enter custom amount"
                className="premium-input !pl-12 text-2xl font-black"
              />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="label-mini ml-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Someone special"
                  className="premium-input"
                />
              </div>

              <div className="space-y-2">
                <label className="label-mini ml-1">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice to support their work..."
                  rows={4}
                  className="premium-input resize-none"
                />
              </div>
              
              <div className="pt-2">
                {/* <label className="label-mini ml-1 mb-3">Add a Voice Message</label> */}
                <VoiceRecorder 
                  onRecordingComplete={(blob) => setAudioBlob(blob)} 
                  isUploading={isPaying}
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-all duration-300" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6 shadow-sm" />
                  </div>
                  <span className="text-sm font-black text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-widest">Support anonymously</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={processPaymentWithVoice}
                disabled={isPaying}
                className="w-full py-6 bg-black text-white rounded-full font-black text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isPaying ? <Loader2 className="animate-spin" size={32} /> : <Heart size={32} fill="currentColor" />}
                Drop {formatCurrency(customAmount ? parseInt(customAmount) : amount)}
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 text-gray-300 text-xs font-black uppercase tracking-[0.2em] pt-4">
              <ShieldCheck size={16} />
              <span>Secured by Paystack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
