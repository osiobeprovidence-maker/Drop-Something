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
  Loader2,
  X,
  LayoutDashboard,
  Settings,
  CreditCard,
  UserPen
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { PayoutSettings } from '../components/PayoutSettings';
import { VoicePlayer } from '../components/VoicePlayer';

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
    <div className="space-y-12 pb-20">
      {/* Withdrawal Modal */}
      {isWithdrawing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full space-y-8 shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Withdraw Funds</h2>
              <button onClick={() => setIsWithdrawing(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={28} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">Request Received!</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">Your withdrawal is being processed and will arrive in your bank account shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-8">
                <div className="space-y-3">
                  <label className="label-mini">Amount to Withdraw (₦)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="premium-input text-2xl font-black"
                  />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-right">Available: {formatCurrency(availableBalance)}</p>
                </div>

                {withdrawError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                    <AlertCircle size={18} />
                    {withdrawError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full py-5 bg-black text-white rounded-full font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {withdrawLoading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Withdrawal'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">Welcome back, {profile?.displayName}</h1>
          <p className="text-xl text-gray-500 font-bold">Here's how your hustle is doing today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/${profile?.username}`}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <ExternalLink size={18} />
            View Page
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Share2 size={18} />
            Share Page
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            {copied ? <CheckCircle2 size={18} className="text-primary" /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-xl space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { 
                id: 'manage', 
                label: profile ? 'Edit Page' : 'Create Page', 
                icon: UserPen, 
                link: profile ? '/edit-profile' : '/setup' 
              },
              { id: 'tips', label: 'Tip History', icon: MessageSquare },
              { id: 'payouts', label: 'Payment Settings', icon: CreditCard },
            ].map((item) => (
              item.link ? (
                <Link
                  key={item.id}
                  to={item.link}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all group"
                >
                  <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                  {item.label}
                  <ArrowUpRight size={14} className="ml-auto opacity-40" />
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all group",
                    activeTab === item.id 
                      ? "bg-black text-white shadow-lg" 
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon size={20} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-primary" : "")} />
                  {item.label}
                </button>
              )
            ))}
          </div>

          {!profile?.isVerified && (
            <div className="bg-accent/5 rounded-[2.5rem] border border-accent/10 p-8 space-y-5">
              <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg">
                <Shield size={24} />
              </div>
              <div className="space-y-2">
                <p className="font-black text-gray-900 leading-tight">Verify Your Account</p>
                <p className="text-sm text-gray-500 font-bold">Complete KYC to withdraw funds.</p>
              </div>
              <Link
                to="/kyc"
                className="block w-full py-3 bg-black text-white text-center rounded-full text-xs font-black hover:scale-105 transition-all shadow-xl"
              >
                Start Verification
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' ? (
        <div className="space-y-12">
          {!profile?.isVerified && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/10 border border-accent/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg rotate-3">
                  <Shield size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Verify your identity</h3>
                  <p className="text-gray-600 font-bold">Complete KYC to unlock withdrawals and get a verified badge.</p>
                </div>
              </div>
              <Link
                to="/kyc"
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-black text-sm hover:scale-105 transition-all shadow-xl whitespace-nowrap"
              >
                Verify Now
              </Link>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card-soft space-y-6">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Wallet size={28} />
              </div>
              <div className="space-y-1">
                <p className="label-mini">Available Balance</p>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(availableBalance)}</p>
              </div>
              <button
                onClick={() => setIsWithdrawing(true)}
                className="w-full py-4 bg-primary text-white rounded-full font-black text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Withdraw Funds
              </button>
            </div>

            <div className="premium-card-soft space-y-6">
              <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                <Users size={28} />
              </div>
              <div className="space-y-1">
                <p className="label-mini">Total Supporters</p>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{successfulTips.length}</p>
              </div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Across all time</p>
            </div>

            <div className="premium-card-soft space-y-6">
              <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                <ArrowUpRight size={28} />
              </div>
              <div className="space-y-1">
                <p className="label-mini">Total Earnings</p>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(totalEarnings)}</p>
              </div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Gross revenue</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Recent Tips */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} fill="currentColor" />
                </div>
                Recent Supporters
              </h2>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl divide-y divide-gray-50 overflow-hidden">
                {successfulTips.slice(0, 5).map((tip) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={tip._id} 
                    className="p-8 flex gap-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black flex-shrink-0 text-xl border border-gray-200">
                      {tip.supporterName[0].toUpperCase()}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black text-gray-900">{tip.supporterName}</p>
                        <p className="text-lg font-black text-primary">{formatCurrency(tip.amount)}</p>
                      </div>
                      {tip.message && (
                        <p className="text-gray-500 font-bold leading-relaxed italic">"{tip.message}"</p>
                      )}
                      {tip.voiceUrl && (
                        <div className="pt-2">
                           <VoicePlayer url={tip.voiceUrl} className="scale-75 origin-left" />
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest pt-2">
                        {new Date(tip.createdAt).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {successfulTips.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <p className="text-gray-400 font-bold text-lg">No tips yet. Share your link to start earning!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                Withdrawal History
              </h2>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl divide-y divide-gray-50 overflow-hidden">
                {(withdrawals ?? []).slice(0, 5).map((w) => (
                  <div key={w._id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-lg font-black text-gray-900">{formatCurrency(w.amount)}</p>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{w.bankName} • {w.accountNumber}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest pt-1">
                        {new Date(w.createdAt).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      w.status === 'completed' ? "bg-green-50 text-green-600 border-green-100" :
                        w.status === 'pending' ? "bg-accent/10 text-accent border-accent/20" :
                          "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {w.status}
                    </div>
                  </div>
                ))}
                {(withdrawals ?? []).length === 0 && (
                  <div className="p-20 text-center space-y-4">
                    <p className="text-gray-400 font-bold text-lg">No withdrawals yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'tips' ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tip History</h2>
            <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs">
              {successfulTips.length} tips received
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Supporter</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Message</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {successfulTips.map((tip) => (
                    <tr key={tip._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-lg border border-primary/20">
                            {tip.supporterName[0].toUpperCase()}
                          </div>
                          <span className="font-black text-gray-900 text-lg">{tip.supporterName}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="font-black text-primary text-lg">{formatCurrency(tip.amount)}</span>
                      </td>
                      <td className="px-10 py-8 max-w-sm">
                        <div className="space-y-4">
                          {tip.message && (
                            <p className="text-gray-500 font-bold leading-relaxed italic text-base">"{tip.message}"</p>
                          )}
                          {tip.voiceUrl && (
                            <VoicePlayer url={tip.voiceUrl} className="scale-90 origin-left" />
                          )}
                          {!tip.message && !tip.voiceUrl && (
                            <span className="text-gray-300 italic font-bold">No feedback left</span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm text-gray-400 font-black uppercase tracking-widest">
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
              <div className="py-32 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                  <MessageSquare size={40} />
                </div>
                <p className="text-gray-400 font-bold text-xl">Your tip jar is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'payouts' ? (
          <div className="premium-card-soft">
            <PayoutSettings />
          </div>
        ) : ( // New 'manage-page' tab
          <div className="premium-card-soft">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Manage Your Page</h2>
            <p className="text-gray-600">
              Here you can customize your public tipping page, update your profile, and manage other settings.
            </p>
            {/* Add more content for managing the page here */}
          </div>
        )}
      </main>
    </div>
  </div>
);
}
