import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Tip, Withdrawal } from '../types';
import { motion } from 'motion/react';
import {
  Wallet,
  Users,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Shield,
  Share2,
  Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { PayoutSettings } from '../components/PayoutSettings';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tips' | 'payouts'>('overview');

  // Withdrawal State
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Convex queries
  const tips = useQuery(
    api.tips.getTipsByCreator,
    user ? { creatorId: user.uid } : 'skip'
  );
  const withdrawals = useQuery(
    api.withdrawals.getWithdrawalsByCreator,
    user ? { creatorId: user.uid } : 'skip'
  );
  const bankDetails = useQuery(
    api.bankDetails.getBankDetails,
    user ? { userId: user.uid } : 'skip'
  );

  const createWithdrawal = useMutation(api.withdrawals.createWithdrawal);

  const loading = tips === undefined || withdrawals === undefined;

  const successfulTips = (tips ?? []).filter((t) => t.status === 'success');
  const totalEarnings = successfulTips.reduce((acc, tip) => acc + tip.amount, 0);
  const availableBalance =
    totalEarnings -
    (withdrawals ?? [])
      .filter((w) => w.status === 'completed')
      .reduce((acc, w) => acc + w.amount, 0);

  const copyLink = () => {
    const link = `${window.location.origin}/${profile?.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/${profile?.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Support my hustle on Drop Something',
          text: `Check out my page on Drop Something and support my work!`,
          url: link,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      copyLink();
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 1000) {
      setWithdrawError('Minimum withdrawal is ₦1,000');
      return;
    }

    if (amount > availableBalance) {
      setWithdrawError('Insufficient balance');
      return;
    }

    if (!bankDetails) {
      setWithdrawError('Please set up your payout settings first');
      return;
    }

    setWithdrawLoading(true);
    setWithdrawError('');

    try {
      await createWithdrawal({
        creatorId: user.uid,
        amount,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
      });

      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => {
        setWithdrawSuccess(false);
        setIsWithdrawing(false);
      }, 3000);
    } catch (err) {
      console.error('Withdrawal error:', err);
      setWithdrawError('Failed to process withdrawal. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-black text-primary animate-pulse">Loading...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Withdrawal Modal */}
      {isWithdrawing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full space-y-6 shadow-[12px_12px_0_0_#111111] border-4 border-ink"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-ink">Withdraw Funds</h2>
              <button onClick={() => setIsWithdrawing(false)} className="text-ink/40 hover:text-ink">
                <AlertCircle size={24} className="rotate-45" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto border-2 border-ink">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-ink">Request Received!</h3>
                  <p className="text-ink/60 text-sm font-black">Your withdrawal is being processed and will arrive in your bank account within 24-48 hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-ink/40 uppercase tracking-widest">Amount to Withdraw (₦)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-4 bg-cream/50 border-2 border-ink rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black text-lg"
                  />
                  <p className="text-xs text-ink/40 font-black uppercase tracking-widest">Available: {formatCurrency(availableBalance)}</p>
                </div>

                {withdrawError && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-black">
                    <AlertCircle size={18} />
                    {withdrawError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1"
                >
                  {withdrawLoading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Withdrawal'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-ink">Welcome back, {profile?.displayName}</h1>
          <p className="text-ink/60 font-black">Here's how your hustle is doing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/${profile?.username}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-ink rounded-xl text-sm font-black hover:bg-cream transition-colors shadow-[2px_2px_0_0_#111111]"
          >
            <ExternalLink size={16} />
            View Page
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-xl text-sm font-black hover:bg-ink/90 transition-colors shadow-[2px_2px_0_0_#FF4D8D]"
          >
            <Share2 size={16} />
            Share Page
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-ink rounded-xl text-sm font-black hover:bg-cream transition-colors shadow-[2px_2px_0_0_#111111]"
          >
            {copied ? <CheckCircle2 size={16} className="text-primary" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-ink/5 p-1 rounded-2xl w-fit border-2 border-ink">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
            activeTab === 'overview'
              ? "bg-white text-ink shadow-[2px_2px_0_0_#111111] border-2 border-ink"
              : "text-ink/60 hover:text-ink"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
            activeTab === 'tips'
              ? "bg-white text-ink shadow-[2px_2px_0_0_#111111] border-2 border-ink"
              : "text-ink/60 hover:text-ink"
          )}
        >
          Tip History
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
            activeTab === 'payouts'
              ? "bg-white text-ink shadow-[2px_2px_0_0_#111111] border-2 border-ink"
              : "text-ink/60 hover:text-ink"
          )}
        >
          Payout Settings
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {!profile?.isVerified && (
            <div className="bg-accent/10 border-4 border-ink p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[8px_8px_0_0_#111111]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-ink shadow-[2px_2px_0_0_#111111]">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-black text-ink">Verify your identity</h3>
                  <p className="text-sm text-ink/70 font-black">Complete KYC to unlock withdrawals and get a verified badge.</p>
                </div>
              </div>
              <Link
                to="/kyc"
                className="px-6 py-3 bg-ink text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-[4px_4px_0_0_#FF7A00] whitespace-nowrap"
              >
                Verify Now
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#111111] space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border-2 border-ink">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-ink/40 uppercase tracking-widest">Available Balance</p>
                <p className="text-3xl font-black text-ink">{formatCurrency(availableBalance)}</p>
              </div>
              <button
                onClick={() => setIsWithdrawing(true)}
                className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm hover:scale-[1.02] transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1"
              >
                Withdraw Funds
              </button>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#6B3CF6] space-y-4">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center border-2 border-ink">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-ink/40 uppercase tracking-widest">Total Supporters</p>
                <p className="text-3xl font-black text-ink">{successfulTips.length}</p>
              </div>
              <p className="text-sm text-ink/60 font-black uppercase tracking-widest">Across all time</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#FF7A00] space-y-4">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center border-2 border-ink">
                <ArrowUpRight size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-ink/40 uppercase tracking-widest">Total Earnings</p>
                <p className="text-3xl font-black text-ink">{formatCurrency(totalEarnings)}</p>
              </div>
              <p className="text-sm text-ink/60 font-black uppercase tracking-widest">Gross revenue</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Tips */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-ink flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Recent Supporters
              </h2>
              <div className="bg-white rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#111111] divide-y-4 divide-ink overflow-hidden">
                {successfulTips.slice(0, 5).map((tip) => (
                  <div key={tip._id} className="p-6 flex gap-4">
                    <div className="w-10 h-10 bg-cream border-2 border-ink rounded-xl flex items-center justify-center text-ink font-black flex-shrink-0">
                      {tip.supporterName[0].toUpperCase()}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-ink">{tip.supporterName}</p>
                        <p className="font-black text-primary">{formatCurrency(tip.amount)}</p>
                      </div>
                      {tip.message && (
                        <p className="text-sm text-ink/70 font-black italic">"{tip.message}"</p>
                      )}
                      <p className="text-[10px] text-ink/40 uppercase font-black tracking-widest">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {successfulTips.length === 0 && (
                  <div className="p-12 text-center text-ink/40">
                    <p className="font-black">No tips yet. Share your link to start earning!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="space-y-4">
              <h2 className="text-xl font-black text-ink flex items-center gap-2">
                <Clock size={20} className="text-secondary" />
                Withdrawal History
              </h2>
              <div className="bg-white rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#111111] divide-y-4 divide-ink overflow-hidden">
                {(withdrawals ?? []).slice(0, 5).map((w) => (
                  <div key={w._id} className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-black text-ink">{formatCurrency(w.amount)}</p>
                      <p className="text-xs text-ink/60 font-black uppercase tracking-widest">{w.bankName} • {w.accountNumber}</p>
                      <p className="text-[10px] text-ink/40 uppercase font-black tracking-widest">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-ink",
                      w.status === 'completed' ? "bg-primary/10 text-primary" :
                        w.status === 'pending' ? "bg-accent/10 text-accent" :
                          "bg-red-100 text-red-700"
                    )}>
                      {w.status}
                    </div>
                  </div>
                ))}
                {(withdrawals ?? []).length === 0 && (
                  <div className="p-12 text-center text-ink/40">
                    <p className="font-black">No withdrawals yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'tips' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-ink">Tip History</h2>
            <p className="text-ink/60 font-black uppercase tracking-widest text-sm">{successfulTips.length} successful tips received</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream border-b-4 border-ink">
                    <th className="px-8 py-5 text-xs font-black text-ink/40 uppercase tracking-widest">Supporter</th>
                    <th className="px-8 py-5 text-xs font-black text-ink/40 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-xs font-black text-ink/40 uppercase tracking-widest">Message</th>
                    <th className="px-8 py-5 text-xs font-black text-ink/40 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-ink">
                  {successfulTips.map((tip) => (
                    <tr key={tip._id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary border-2 border-ink rounded-xl flex items-center justify-center font-black">
                            {tip.supporterName[0].toUpperCase()}
                          </div>
                          <span className="font-black text-ink">{tip.supporterName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-primary">{formatCurrency(tip.amount)}</span>
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        {tip.message ? (
                          <p className="text-sm text-ink/70 font-black italic">"{tip.message}"</p>
                        ) : (
                          <span className="text-ink/20 text-sm italic font-black">No message</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-ink/60 font-black uppercase tracking-widest">
                          {new Date(tip.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {successfulTips.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-cream border-4 border-ink rounded-full flex items-center justify-center mx-auto text-ink/20">
                  <MessageSquare size={32} />
                </div>
                <p className="text-ink/40 font-black">No tips received yet. Keep sharing your link!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <PayoutSettings />
      )}
    </div>
  );
}
