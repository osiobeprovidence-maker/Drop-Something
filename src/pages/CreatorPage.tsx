import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { UserProfile, Tip } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Heart, Share2, MessageSquare, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import confetti from 'canvas-confetti';

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
            status: 'success',
          });
          setShowSuccess(true);
          triggerConfetti();
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
  if (!creator) return (
    <div className="text-center py-20 space-y-4">
      <AlertCircle size={48} className="mx-auto text-ink/20" />
      <h1 className="text-2xl font-black text-ink">Creator not found</h1>
      <Link to="/" className="text-primary font-black hover:underline decoration-4 underline-offset-8">Go back home</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8 pb-20">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-6 shadow-[12px_12px_0_0_#111111] border-4 border-ink"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto border-2 border-ink">
                <Heart size={40} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-ink">Thank You!</h2>
                <p className="text-ink/60 font-bold">
                  Your support means the world to <span className="font-black text-ink">{creator.displayName}</span>.
                  You've just made their hustle a little easier!
                </p>
              </div>
              <div className="space-y-3">
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
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:scale-[1.02] transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share the love
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-4 bg-cream text-ink rounded-2xl font-black hover:bg-cream/80 transition-colors border-2 border-ink"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Profile Info */}
      <div className="md:col-span-5 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border-4 border-ink shadow-[8px_8px_0_0_#111111] text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-[2rem] bg-cream overflow-hidden border-4 border-ink shadow-[4px_4px_0_0_#111111] mx-auto">
              {creator.photoURL ? (
                <img src={creator.photoURL} alt={creator.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/20">
                  <Heart size={48} />
                </div>
              )}
            </div>
            {creator.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-1.5 rounded-full border-4 border-ink shadow-sm" title="Verified Creator">
                <ShieldCheck size={20} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-ink">{creator.displayName}</h1>
            <p className="text-primary font-black uppercase tracking-widest text-sm">@{creator.username}</p>
          </div>

          <p className="text-ink/70 font-bold leading-relaxed whitespace-pre-wrap">
            {creator.bio || "Supporting the hustle!"}
          </p>

          <div className="pt-4 border-t-4 border-ink/5 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-ink">{successfulTips.length}+</p>
              <p className="text-xs text-ink/40 uppercase font-black tracking-widest">Supporters</p>
            </div>
          </div>
        </div>

        {/* Recent Supporters */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-ink/40 uppercase tracking-widest px-4">Recent Support</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {successfulTips.slice(0, 10).map((tip) => (
                <motion.div
                  key={tip._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-4 rounded-2xl border-4 border-ink shadow-[4px_4px_0_0_#111111] flex gap-4"
                >
                  <div className="w-10 h-10 bg-primary/10 text-primary border-2 border-ink rounded-xl flex items-center justify-center flex-shrink-0">
                    <Coffee size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-ink">
                      {tip.supporterName} <span className="text-ink/40 font-bold">dropped {formatCurrency(tip.amount)}</span>
                    </p>
                    {tip.message && (
                      <p className="text-sm text-ink/70 font-bold italic">"{tip.message}"</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {successfulTips.length === 0 && (
              <p className="text-center py-8 text-ink/40 text-sm font-black italic">Be the first to support!</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Tip Form */}
      <div className="md:col-span-7">
        <div className="bg-white p-8 rounded-[2.5rem] border-4 border-ink shadow-[12px_12px_0_0_#6B3CF6] sticky top-24 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center border-2 border-ink shadow-[2px_2px_0_0_#111111]">
              <Coffee size={24} />
            </div>
            <h2 className="text-2xl font-black text-ink leading-tight">Drop something for {creator.displayName}</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  onClick={() => { setAmount(val); setCustomAmount(''); }}
                  className={cn(
                    "py-4 rounded-2xl font-black text-lg transition-all border-4",
                    amount === val && !customAmount
                      ? "bg-primary/10 border-primary text-primary shadow-[2px_2px_0_0_#FF4D8D]"
                      : "bg-cream border-ink text-ink/40 hover:border-primary hover:text-primary"
                  )}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 font-black">₦</div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                placeholder="Enter custom amount"
                className="w-full pl-10 pr-4 py-4 bg-cream border-4 border-ink rounded-2xl focus:outline-none focus:border-primary transition-all font-black text-lg"
              />
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name or Twitter @ (optional)"
                className="w-full px-4 py-4 bg-cream border-2 border-ink rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                rows={3}
                className="w-full px-4 py-4 bg-cream border-2 border-ink rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold resize-none"
              />
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-6 h-6 rounded border-4 border-ink text-primary focus:ring-primary"
                />
                <span className="text-sm font-black text-ink/60 group-hover:text-ink transition-colors">Support anonymously</span>
              </label>
            </div>

            <button
              onClick={handlePay}
              disabled={isPaying}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl hover:scale-[1.02] transition-all active:scale-95 shadow-[0_8px_0_0_#111111] flex items-center justify-center gap-3"
            >
              {isPaying ? <Loader2 className="animate-spin" /> : <Heart size={24} fill="currentColor" />}
              Drop {formatCurrency(customAmount ? parseInt(customAmount) : amount)}
            </button>

            <div className="flex items-center justify-center gap-2 text-ink/40 text-xs font-black uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Secured by Paystack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
