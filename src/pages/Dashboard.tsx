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
  UserPen,
  Layers,
  ShoppingBag,
  BookOpen,
  Plus,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Video,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { PayoutSettings } from '../components/PayoutSettings';
import { VoicePlayer } from '../components/VoicePlayer';
import { MediaUpload } from '../components/MediaUpload';

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
  
  // Section Edit State
  const [sectionToEdit, setSectionToEdit] = useState<'profile' | 'membership' | 'shop' | 'bio' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const updateUser = useMutation(api.users.updateUser);

  // Sync data when opening modal
  useEffect(() => {
    if (sectionToEdit && profile) {
      if (sectionToEdit === 'profile') {
        setEditData({
          displayName: profile.displayName || '',
          tagline: profile.tagline || '',
          photoURL: profile.photoURL || '',
          coverURL: profile.coverURL || '',
        });
      } else if (sectionToEdit === 'membership') {
        setEditData({
          membershipTiers: profile.membershipTiers || [],
        });
      } else if (sectionToEdit === 'shop') {
        setEditData({
          products: profile.products || [],
        });
      } else if (sectionToEdit === 'bio') {
        setEditData({
          bio: profile.bio || '',
          socialLinks: profile.socialLinks || { twitter: '', instagram: '', website: '' },
        });
      }
    }
  }, [sectionToEdit, profile]);

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

  const handleSectionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUser({
        uid: user.uid,
        ...editData,
      });
      setSectionToEdit(null);
      toast.success('Section updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update section.');
    } finally {
      setIsSaving(false);
    }
  };
  const completionItems = [
    { label: 'Profile Photo', done: !!profile?.photoURL, weight: 15, key: 'photo' },
    { label: 'Cover Photo', done: !!profile?.coverURL, weight: 10, key: 'cover' },
    { label: 'Tagline & Name', done: !!profile?.displayName && !!profile?.tagline, weight: 25, key: 'name' },
    { label: 'Creator Bio', done: !!profile?.bio, weight: 20, key: 'bio' },
    { label: 'Membership Tiers', done: (profile?.membershipTiers?.length ?? 0) > 0, weight: 15, key: 'tiers' },
    { label: 'Products', done: (profile?.products?.length ?? 0) > 0, weight: 15, key: 'products' },
  ];
  const completionPercentage = completionItems.reduce((acc, item) => acc + (item.done ? item.weight : 0), 0);
  const missingItems = completionItems.filter(item => !item.done);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-black text-primary animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -ml-32 -mb-32 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 relative z-10">
        
        {sectionToEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-gray-100 max-h-[90vh] overflow-y-auto"
             >
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Edit {sectionToEdit.charAt(0).toUpperCase() + sectionToEdit.slice(1)}</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Update your hub settings</p>
                  </div>
                  <button onClick={() => setSectionToEdit(null)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSectionSave} className="space-y-10">
                  {sectionToEdit === 'profile' && (
                    <div className="space-y-8">
                       <div className="space-y-4">
                         <label className="label-mini ml-1">Cover Photo</label>
                         <MediaUpload 
                           aspect="cover" 
                           type="image" 
                           defaultUrl={editData.coverURL}
                           onUploadComplete={(url) => setEditData({ ...editData, coverURL: url })}
                         />
                       </div>
                       <div className="flex justify-center -mt-16 relative z-10">
                         <MediaUpload 
                           aspect="square" 
                           type="image" 
                           defaultUrl={editData.photoURL}
                           className="w-32 h-32 border-8 border-white shadow-2xl"
                           onUploadComplete={(url) => setEditData({ ...editData, photoURL: url })}
                         />
                       </div>
                       <div className="space-y-6">
                         <div className="space-y-2">
                           <label className="label-mini ml-1">Display Name</label>
                           <input 
                             value={editData.displayName} 
                             onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                             className="premium-input font-black"
                             required
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="label-mini ml-1">Tagline</label>
                           <input 
                             value={editData.tagline} 
                             onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                             className="premium-input"
                             placeholder="Digital Artist & Dreamer"
                           />
                         </div>
                       </div>
                    </div>
                  )}

                  {sectionToEdit === 'membership' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Manage Tiers</p>
                         <button 
                          type="button"
                          onClick={() => setEditData({ ...editData, membershipTiers: [...(editData.membershipTiers || []), { title: 'New Tier', price: 1000, benefits: [] }] })}
                          className="text-primary font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                         >
                           + Add Tier
                         </button>
                      </div>
                      <div className="space-y-4">
                        {(editData.membershipTiers || []).map((tier: any, idx: number) => (
                          <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                            <button 
                              type="button"
                              onClick={() => {
                                const newTiers = [...editData.membershipTiers];
                                newTiers.splice(idx, 1);
                                setEditData({ ...editData, membershipTiers: newTiers });
                              }}
                              className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                value={tier.title}
                                onChange={(e) => {
                                  const newTiers = [...editData.membershipTiers];
                                  newTiers[idx].title = e.target.value;
                                  setEditData({ ...editData, membershipTiers: newTiers });
                                }}
                                className="premium-input bg-white text-sm"
                                placeholder="Title"
                              />
                              <input 
                                type="number"
                                value={tier.price}
                                onChange={(e) => {
                                  const newTiers = [...editData.membershipTiers];
                                  newTiers[idx].price = Number(e.target.value);
                                  setEditData({ ...editData, membershipTiers: newTiers });
                                }}
                                className="premium-input bg-white text-sm"
                                placeholder="Price"
                              />
                            </div>
                            <input 
                              value={tier.benefits.join(', ')}
                              onChange={(e) => {
                                const newTiers = [...editData.membershipTiers];
                                newTiers[idx].benefits = e.target.value.split(',').map((b: string) => b.trim());
                                setEditData({ ...editData, membershipTiers: newTiers });
                              }}
                              className="premium-input bg-white text-sm"
                              placeholder="Benefits (comma separated)"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sectionToEdit === 'shop' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product List</p>
                         <button 
                          type="button"
                          onClick={() => setEditData({ ...editData, products: [...(editData.products || []), { title: 'New Product', price: 1000, description: '', imageUrl: '' }] })}
                          className="text-primary font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                         >
                           + Add Product
                         </button>
                      </div>
                      <div className="space-y-6">
                        {(editData.products || []).map((product: any, idx: number) => (
                          <div key={idx} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6 relative group">
                            <button 
                              type="button"
                              onClick={() => {
                                const newProducts = [...editData.products];
                                newProducts.splice(idx, 1);
                                setEditData({ ...editData, products: newProducts });
                              }}
                              className="absolute top-6 right-6 text-gray-300 hover:text-red-500"
                            >
                              <X size={18} />
                            </button>
                            <div className="flex flex-col md:flex-row gap-8">
                               <MediaUpload 
                                aspect="square"
                                type="image"
                                defaultUrl={product.imageUrl}
                                className="w-32"
                                onUploadComplete={(url) => {
                                  const newProducts = [...editData.products];
                                  newProducts[idx].imageUrl = url;
                                  setEditData({ ...editData, products: newProducts });
                                }}
                               />
                               <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <input 
                                      value={product.title}
                                      onChange={(e) => {
                                        const newProducts = [...editData.products];
                                        newProducts[idx].title = e.target.value;
                                        setEditData({ ...editData, products: newProducts });
                                      }}
                                      className="premium-input bg-white text-sm"
                                      placeholder="Title"
                                    />
                                    <input 
                                      type="number"
                                      value={product.price}
                                      onChange={(e) => {
                                        const newProducts = [...editData.products];
                                        newProducts[idx].price = Number(e.target.value);
                                        setEditData({ ...editData, products: newProducts });
                                      }}
                                      className="premium-input bg-white text-sm"
                                      placeholder="Price"
                                    />
                                  </div>
                                  <textarea 
                                    value={product.description}
                                    onChange={(e) => {
                                      const newProducts = [...editData.products];
                                      newProducts[idx].description = e.target.value;
                                      setEditData({ ...editData, products: newProducts });
                                    }}
                                    className="premium-input bg-white text-xs min-h-[80px]"
                                    placeholder="Description"
                                  />
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sectionToEdit === 'bio' && (
                    <div className="space-y-8">
                       <div className="space-y-2">
                         <label className="label-mini ml-1">Your Story</label>
                         <textarea 
                           value={editData.bio} 
                           onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                           className="premium-input min-h-[160px]"
                           placeholder="Tell your fans who you are..."
                         />
                       </div>
                       <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Social Hub</p>                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                               <Twitter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.twitter} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, twitter: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="Twitter Handle"
                               />
                            </div>
                            <div className="relative">
                               <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.instagram} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, instagram: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="Instagram Handle"
                               />
                            </div>
                            <div className="relative">
                               <Youtube size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.youtube} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, youtube: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="YouTube Link"
                               />
                            </div>
                            <div className="relative">
                               <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.tiktok} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, tiktok: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="TikTok Handle"
                               />
                            </div>
                            <div className="relative">
                               <Facebook size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.facebook} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, facebook: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="Facebook Profile"
                               />
                            </div>
                            <div className="relative">
                               <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.discord} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, discord: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="Discord Invite"
                               />
                            </div>
                            <div className="relative md:col-span-2">
                               <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                               <input 
                                 value={editData.socialLinks?.website} 
                                 onChange={(e) => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, website: e.target.value } })}
                                 className="premium-input pl-12 text-sm"
                                 placeholder="Website URL"
                               />
                            </div>
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-6 bg-black text-white rounded-full font-black text-xl hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : <>Save {sectionToEdit} Updates</>}
                    </button>
                    
                    <Link to="/edit-profile" className="block text-center mt-6 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                      Open advanced editor
                    </Link>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
        {/* Withdrawal Modal */}
        {isWithdrawing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full space-y-8 shadow-2xl border border-gray-100"
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
                      className="premium-input text-2xl font-black bg-gray-50/50"
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
                    className="w-full py-6 bg-black text-white rounded-full font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {withdrawLoading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Withdrawal'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-3">
            <span className="label-mini text-primary bg-primary/5 px-4 py-2 rounded-full w-fit">Creator Dashboard</span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">
              Welcome back, <br /><span className="text-primary italic">{profile?.displayName}</span>
            </h1>
            <p className="text-xl text-gray-500 font-bold max-w-lg">Monitor your growth and manage your creative hustle.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={`/${profile?.username}`}
              className="flex items-center gap-2 px-8 py-5 bg-white border-2 border-gray-100 rounded-full text-sm font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <ExternalLink size={18} />
              View Page
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-8 py-5 bg-gray-900 text-white rounded-full text-sm font-black hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-95"
            >
              <Share2 size={18} />
              Share Hub
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-8 py-5 bg-white border-2 border-gray-100 rounded-full text-sm font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              {copied ? <CheckCircle2 size={18} className="text-primary" /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 space-y-10">
            {/* Page Completion Indicator */}
            <div className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Page Progress</p>
                  <p className="text-xl font-black text-primary">{completionPercentage}%</p>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${completionPercentage}%` }}
                     className="h-full bg-primary"
                   />
                </div>
              </div>
              
              {missingItems.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Next Steps</p>
                  <div className="space-y-2">
                    {missingItems.slice(0, 3).map(item => (
                      <button 
                        key={item.key}
                        onClick={() => {
                          if (item.key === 'photo' || item.key === 'cover' || item.key === 'name') setSectionToEdit('profile');
                          else if (item.key === 'bio') setSectionToEdit('bio');
                          else if (item.key === 'tiers') setSectionToEdit('membership');
                          else if (item.key === 'products') setSectionToEdit('shop');
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Plus size={12} /> Add {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all group",
                  activeTab === 'overview' 
                    ? "bg-black text-white shadow-2xl scale-[1.02]" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <LayoutDashboard size={20} className={cn("transition-transform group-hover:scale-110", activeTab === 'overview' ? "text-primary" : "")} />
                Overview
              </button>

              <div className="pt-6 pb-2 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 ml-6">Quick Edit</p>
                 {[
                   { id: 'profile', label: 'Profile', icon: UserPen },
                   { id: 'membership', label: 'Members', icon: Layers },
                   { id: 'shop', label: 'Shop', icon: ShoppingBag },
                   { id: 'bio', label: 'Bio', icon: BookOpen },
                 ].map((section) => (
                   <button
                     key={section.id}
                     onClick={() => setSectionToEdit(section.id as any)}
                     className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.2rem] text-xs font-black text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all group"
                   >
                     <section.icon size={18} className="group-hover:scale-110 transition-transform text-gray-300 group-hover:text-primary" />
                     {section.label}
                     <ArrowUpRight size={12} className="ml-auto opacity-20" />
                   </button>
                 ))}
              </div>

              {[
                { id: 'tips', label: 'Tip History', icon: MessageSquare },
                { id: 'payouts', label: 'Settings', icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all group",
                    activeTab === item.id 
                      ? "bg-black text-white shadow-2xl scale-[1.02]" 
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon size={20} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-primary" : "")} />
                  {item.label}
                </button>
              ))}
            </div>

            {!profile?.isVerified && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 text-white rounded-[3rem] p-10 space-y-6 relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                  <Shield size={28} className="text-accent" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black leading-tight tracking-tight uppercase">Verify Account</p>
                  <p className="text-sm text-gray-400 font-bold leading-relaxed">Unlock bank withdrawals and get your verified badge.</p>
                </div>
                <Link
                  to="/kyc"
                  className="block w-full py-5 bg-accent text-black text-center rounded-full text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,221,0,0.3)]"
                >
                  Start Verification
                </Link>
              </motion.div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' ? (
              <div className="space-y-16">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="premium-card-soft p-10 space-y-8 bg-white/80 backdrop-blur-xl group hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center group-hover:rotate-6 transition-transform">
                      <Wallet size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="label-mini text-gray-400 uppercase tracking-widest text-[10px]">Available Balance</p>
                      <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(availableBalance)}</p>
                    </div>
                    <button
                      onClick={() => setIsWithdrawing(true)}
                      className="w-full py-5 bg-black text-white rounded-full font-black text-sm hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 active:scale-95"
                    >
                      Withdraw Funds
                    </button>
                  </div>

                  <div className="premium-card-soft p-10 space-y-8 bg-white/80 backdrop-blur-xl group hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-[1.5rem] flex items-center justify-center group-hover:-rotate-6 transition-transform">
                      <Users size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="label-mini text-gray-400 uppercase tracking-widest text-[10px]">Total Supporters</p>
                      <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{successfulTips.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-full" />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifetime</span>
                    </div>
                  </div>

                  <div className="premium-card-soft p-10 space-y-8 bg-white/80 backdrop-blur-xl group hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-accent/10 text-accent rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUpRight size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="label-mini text-gray-400 uppercase tracking-widest text-[10px]">Total Earnings</p>
                      <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(totalEarnings)}</p>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 size={12} className="text-primary" />
                       Gross Revenue
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                  {/* Recent Tips */}
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <MessageSquare size={28} className="text-primary" />
                        Recent Drops
                      </h2>
                      <button onClick={() => setActiveTab('tips')} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">See All</button>
                    </div>
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl divide-y divide-gray-50 overflow-hidden">
                      {successfulTips.slice(0, 5).map((tip, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={tip._id} 
                          className="p-10 flex gap-8 hover:bg-gray-50/50 transition-colors group"
                        >
                          <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-300 font-black flex-shrink-0 text-2xl border-2 border-white shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {tip.supporterName[0].toUpperCase()}
                          </div>
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xl font-black text-gray-900">{tip.supporterName}</p>
                              <p className="text-xl font-black text-primary">{formatCurrency(tip.amount)}</p>
                            </div>
                            {tip.message && (
                              <p className="text-gray-500 font-bold leading-relaxed italic border-l-4 border-gray-100 pl-4 py-1">"{tip.message}"</p>
                            )}
                            {tip.voiceUrl && (
                              <div className="pt-2">
                                 <VoicePlayer url={tip.voiceUrl} className="scale-90 origin-left" />
                              </div>
                            )}
                            <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest pt-2 flex items-center gap-2">
                              <Clock size={10} />
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
                        <div className="p-24 text-center space-y-6">
                          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
                             <MessageSquare size={40} />
                          </div>
                          <p className="text-gray-400 font-bold text-xl italic">Waiting for your first drop...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Withdrawal History */}
                  <div className="space-y-10">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                      <Clock size={28} className="text-secondary" />
                      Cash Out History
                    </h2>
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl divide-y divide-gray-50 overflow-hidden">
                      {(withdrawals ?? []).slice(0, 5).map((w, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={w._id} 
                          className="p-10 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
                        >
                          <div className="space-y-2">
                            <p className="text-xl font-black text-gray-900 group-hover:text-secondary transition-colors">{formatCurrency(w.amount)}</p>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{w.bankName} • {w.accountNumber}</p>
                            <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest pt-1 flex items-center gap-2">
                              <CheckCircle2 size={10} />
                              {new Date(w.createdAt).toLocaleDateString('en-NG', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
                            w.status === 'completed' ? "bg-green-50 text-green-600 border-green-100" :
                              w.status === 'pending' ? "bg-accent/10 text-accent border-accent/20" :
                                "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {w.status}
                          </div>
                        </motion.div>
                      ))}
                      {(withdrawals ?? []).length === 0 && (
                        <div className="p-24 text-center space-y-6">
                           <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
                             <Wallet size={40} />
                          </div>
                          <p className="text-gray-400 font-bold text-xl italic">No withdrawals yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'tips' ? (
              <div className="space-y-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Tip History</h2>
                    <p className="text-lg text-gray-500 font-bold italic">Every drop matters.</p>
                  </div>
                  <div className="px-8 py-3 bg-gray-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl">
                    {successfulTips.length} Total Tips
                  </div>
                </div>

                <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-12 py-10 text-xs font-black text-gray-400 uppercase tracking-widest">Supporter</th>
                          <th className="px-12 py-10 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                          <th className="px-12 py-10 text-xs font-black text-gray-400 uppercase tracking-widest">Message</th>
                          <th className="px-12 py-10 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {successfulTips.map((tip) => (
                          <tr key={tip._id} className="hover:bg-gray-50/30 transition-colors group">
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.2rem] flex items-center justify-center font-black text-xl border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                  {tip.supporterName[0].toUpperCase()}
                                </div>
                                <span className="font-black text-gray-900 text-xl tracking-tight">{tip.supporterName}</span>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <span className="font-black text-primary text-2xl tracking-tighter">{formatCurrency(tip.amount)}</span>
                            </td>
                            <td className="px-12 py-10 max-w-sm">
                              <div className="space-y-4">
                                {tip.message && (
                                  <p className="text-gray-500 font-bold leading-relaxed italic text-lg pr-4">"{tip.message}"</p>
                                )}
                                {tip.voiceUrl && (
                                  <VoicePlayer url={tip.voiceUrl} className="scale-90 origin-left" />
                                )}
                                {!tip.message && !tip.voiceUrl && (
                                  <span className="text-gray-200 font-black uppercase tracking-widest text-[10px]">Ghost Dropper</span>
                                )}
                              </div>
                            </td>
                            <td className="px-12 py-10">
                              <span className="text-xs text-gray-400 font-black uppercase tracking-widest">
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
                    <div className="py-40 text-center space-y-8">
                       <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                          <MessageSquare size={48} />
                       </div>
                       <p className="text-gray-400 font-bold text-2xl italic tracking-tight">Your tip jar is currently empty.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="premium-card-soft p-12 bg-white/80 backdrop-blur-xl">
                <PayoutSettings />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
