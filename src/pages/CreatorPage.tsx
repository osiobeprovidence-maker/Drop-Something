import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { 
  Heart, Users, Target, ShoppingBag, ExternalLink, Check, ChevronRight, ArrowLeft, 
  FileText, Lock, Music, Twitter, Facebook, Instagram, Linkedin, Youtube, Globe, 
  Mail, Link as LinkIcon, Twitch, Disc, Send, BookOpen, Gamepad2, Radio, Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useFollow } from "@/src/context/FollowContext";
import { useAuth } from "@/src/context/AuthContext";
import { useAdmin } from "@/src/context/AdminContext";
import { PaystackPayment } from "@/src/lib/PaystackPayment";

export default function CreatorPage() {
  // === ALL HOOKS AT TOP - DO NOT ADD CONDITIONS BEFORE HOOKS ===
  const { username } = useParams();
  const { convexUserId } = useAuth();
  const { follow, unfollow, isFollowing } = useFollow();
  const convexCreator = useQuery(api.creators.getCreatorByUsername, {
    username: username || ""
  });
  const addConvexTip = useMutation(api.creators.addTip);

  // Get slates for this creator
  const slates = useQuery(api.slates.getPublicSlatesByCreator, {
    creatorId: convexCreator?._id as Id<"creators"> | undefined
  });

  // Get wishlist for this creator
  const wishlists = useQuery(api.wishlist.getWishlistsByCreator, {
    creatorId: convexCreator?._id as Id<"creators"> | undefined
  });

  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Derived values from hooks (still part of hook section)
  const displayCreator = convexCreator;
  const isLoading = convexCreator === undefined;
  const isOwnPage = !username || convexCreator?.userId === (convexUserId as string);

  const resolvedAvatar = useMemo(() => {
    if (!displayCreator?.avatar) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "default"}`;
    if (displayCreator?.avatar?.includes("api/storage")) return displayCreator.avatar;
    return displayCreator?.avatar;
  }, [displayCreator, username]);

  const recentSupporters = useMemo(() => {
    if (!displayCreator || !Array.isArray(displayCreator.tips)) return [];
    return displayCreator.tips.slice(0, 5);
  }, [displayCreator]);

  // Get social links from creator's links
  const socialLinks = useMemo(() => {
    if (!displayCreator || !Array.isArray(displayCreator.links)) return [];
    
    return displayCreator.links.map((link) => {
      const url = link.url.toLowerCase();
      let platform: string = 'website';
      let Icon = Globe;
      let color = 'text-black/60';
      let hoverColor = 'hover:bg-black hover:text-white';
      
      // Platform detection
      if (url.includes('instagram.com')) {
        platform = 'instagram';
        Icon = Instagram;
        color = 'text-pink-600';
        hoverColor = 'hover:bg-pink-50 hover:text-pink-600';
      } else if (url.includes('twitter.com') || url.includes('x.com')) {
        platform = 'twitter';
        Icon = Twitter;
        color = 'text-blue-500';
        hoverColor = 'hover:bg-blue-50 hover:text-blue-500';
      } else if (url.includes('facebook.com') || url.includes('fb.com')) {
        platform = 'facebook';
        Icon = Facebook;
        color = 'text-blue-600';
        hoverColor = 'hover:bg-blue-50 hover:text-blue-600';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube';
        Icon = Youtube;
        color = 'text-red-600';
        hoverColor = 'hover:bg-red-50 hover:text-red-600';
      } else if (url.includes('linkedin.com')) {
        platform = 'linkedin';
        Icon = Linkedin;
        color = 'text-blue-700';
        hoverColor = 'hover:bg-blue-50 hover:text-blue-700';
      } else if (url.includes('tiktok.com')) {
        platform = 'tiktok';
        Icon = Disc; // Using Disc as TikTok alternative
        color = 'text-black';
        hoverColor = 'hover:bg-black hover:text-white';
      } else if (url.includes('twitch.tv')) {
        platform = 'twitch';
        Icon = Twitch;
        color = 'text-purple-600';
        hoverColor = 'hover:bg-purple-50 hover:text-purple-600';
      } else if (url.includes('substack.com')) {
        platform = 'substack';
        Icon = BookOpen;
        color = 'text-orange-600';
        hoverColor = 'hover:bg-orange-50 hover:text-orange-600';
      } else if (url.includes('kick.com')) {
        platform = 'kick';
        Icon = Gamepad2;
        color = 'text-green-600';
        hoverColor = 'hover:bg-green-50 hover:text-green-600';
      } else if (url.includes('telegram.org') || url.includes('t.me')) {
        platform = 'telegram';
        Icon = Send;
        color = 'text-blue-400';
        hoverColor = 'hover:bg-blue-50 hover:text-blue-400';
      } else if (url.includes('discord.com')) {
        platform = 'discord';
        Icon = Radio; // Using Radio as Discord alternative
        color = 'text-indigo-600';
        hoverColor = 'hover:bg-indigo-50 hover:text-indigo-600';
      } else if (url.includes('snapchat.com')) {
        platform = 'snapchat';
        Icon = Smartphone;
        color = 'text-yellow-500';
        hoverColor = 'hover:bg-yellow-50 hover:text-yellow-500';
      } else if (url.includes('pinterest.com')) {
        platform = 'pinterest';
        Icon = Disc;
        color = 'text-red-500';
        hoverColor = 'hover:bg-red-50 hover:text-red-500';
      } else if (url.includes('github.com')) {
        platform = 'github';
        Icon = LinkIcon;
        color = 'text-gray-700';
        hoverColor = 'hover:bg-gray-100 hover:text-gray-700';
      } else if (url.includes('mailto:')) {
        platform = 'email';
        Icon = Mail;
        color = 'text-red-500';
        hoverColor = 'hover:bg-red-50 hover:text-red-500';
      }
      
      return { ...link, platform, Icon, color, hoverColor };
    });
  }, [displayCreator]);

  // Get non-social links (regular links)
  const regularLinks = useMemo(() => {
    if (!displayCreator || !Array.isArray(displayCreator.links)) return [];
    
    const socialPlatforms = [
      'instagram.com', 'x.com', 'twitter.com', 'facebook.com', 'fb.com',
      'youtube.com', 'youtu.be', 'linkedin.com', 'tiktok.com', 'twitch.tv',
      'substack.com', 'kick.com', 'telegram.org', 't.me', 'discord.com',
      'snapchat.com', 'pinterest.com', 'github.com'
    ];
    
    return displayCreator.links.filter((link) => {
      const url = link.url.toLowerCase();
      // Check if it's a social platform link
      const isSocial = socialPlatforms.some(platform => url.includes(platform));
      // Check if it's an email link
      const isEmail = url.includes('mailto:');
      // Return only non-social, non-email links
      return !isSocial && !isEmail;
    });
  }, [displayCreator]);
  // === END OF HOOKS SECTION ===

  const handleFollow = async () => {
    if (!convexCreator) return;
    const creatorId = convexCreator._id as Id<"creators">;
    if (isFollowing(creatorId)) {
      await unfollow(creatorId);
    } else {
      await follow(creatorId);
    }
  };

  const handleDropSomething = async () => {
    if (!displayCreator || !convexUserId) return;
    
    const amount = tipAmount || parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please select or enter a valid amount.");
      return;
    }

    // Use Paystack for payment
    const user = await (api.users.currentUser as any)();
    const userEmail = user?.email || "";

    if (!userEmail) {
      alert("Please log in to make a payment.");
      return;
    }

    // The PaystackPayment component will handle the actual payment
    // This function is now just a fallback for direct tips
    try {
      await addConvexTip({
        creatorId: displayCreator._id,
        supporterName: supporterName || "Anonymous Supporter",
        amount: amount,
        message: message,
        type: "tip"
      });

      setShowSuccess(true);
      setTipAmount(null);
      setCustomAmount("");
      setSupporterName("");
      setMessage("");
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Tip error:", err);
      alert("Failed to send tip. Please try again.");
    }
  };

  const handlePurchase = async (product: any) => {
    // Placeholder for payment flow integration
    // TODO: Integrate with Paystack for payment processing
    setSelectedProduct(product);
    setIsPurchasing(true);
    
    // For now, show a placeholder message
    alert(`Purchase flow for "${product.title}" - Paystack integration coming soon`);
    
    setIsPurchasing(false);
    setSelectedProduct(null);
  };

  const finalAmount = tipAmount || (customAmount ? parseInt(customAmount) : 0);

  const { isAdmin } = useAdmin();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  // Show not found if creator doesn't exist
  if (!displayCreator) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
        <h1 className="text-2xl font-black text-black">Creator not found</h1>
        <p className="mt-2 text-black/60">This creator page doesn't exist.</p>
        <a
          href="/explore"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
        >
          Browse Creators
        </a>
      </div>
    );
  }

  const showHome = true;
  const showAbout = true;
  const showSlate = slates && slates.length > 0;
  const showWishlist = wishlists && wishlists.length > 0;
  const showMembership = (displayCreator?.pageStyle === "hybrid" || displayCreator?.pageStyle === "support") && displayCreator.memberships.length > 0;
  const showGoals = (displayCreator?.pageStyle === "hybrid" || displayCreator?.pageStyle === "goal") && displayCreator.goals.length > 0;
  const showShop = (displayCreator?.pageStyle === "hybrid" || displayCreator?.pageStyle === "shop") && displayCreator.products.length > 0;

  const tabs = [
    { id: "home", label: "Home", icon: Heart, show: true },
    { id: "slate", label: "Slate", icon: FileText, show: showSlate },
    { id: "wishlist", label: "Wishlist", icon: Target, show: showWishlist },
    { id: "membership", label: "Memberships", icon: Users, show: showMembership },
    { id: "shop", label: "Shop", icon: ShoppingBag, show: showShop },
    { id: "goals", label: "Goals", icon: Target, show: showGoals },
  ].filter(tab => tab.show);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Cover Image */}
      <div className="relative h-40 w-full bg-zinc-200 sm:h-64 overflow-hidden">
        <img
          src={displayCreator.coverImage}
          alt=""
          className="h-full w-full"
          style={{
            objectFit: 'cover',
            transform: displayCreator.coverPosition 
              ? `translate(${displayCreator.coverPosition.x}px, ${displayCreator.coverPosition.y}px) scale(${displayCreator.coverPosition.zoom})`
              : undefined,
            transformOrigin: 'center',
          }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        <div className="relative -mt-12 mb-8 flex flex-col items-center">
          <div className="relative mx-auto h-20 w-20 sm:h-28 sm:w-28">
            <div className="h-full w-full overflow-hidden rounded-2xl border-2 border-white bg-gray-100">
              <img src={resolvedAvatar} alt={displayCreator?.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          
          {/* Profile Info Container - Centered */}
          <div className="mt-3 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-black sm:text-2xl">@{displayCreator?.username}</h1>
              {displayCreator?.username === "dropsomething" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                  <Check size={14} /> Official
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-black/60 max-w-lg">{displayCreator?.bio}</p>

            {/* Social Links - Platform Icons */}
            {socialLinks.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
                {socialLinks.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white transition-all hover:scale-105",
                      link.hoverColor
                    )}
                    title={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  >
                    <link.Icon size={18} className={link.platform !== 'website' ? link.color : ''} />
                  </a>
                ))}
              </div>
            )}

            {/* Admin quick action: Post as DropSomething */}
            {isAdmin && displayCreator?.username === "dropsomething" && (
              <div className="mt-4">
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-900"
                >
                  Post as DropSomething
                </a>
              </div>
            )}

            {/* Follow Button - Only show if not own page and user is logged in */}
            {!isOwnPage && convexUserId && displayCreator && (
              <button
                onClick={handleFollow}
                className={cn(
                  "mt-4 flex h-10 items-center justify-center rounded-xl px-6 text-xs font-bold transition-all hover:scale-105 active:scale-95",
                  isFollowing(displayCreator._id as Id<"creators">)
                    ? "border-2 border-gray-200 bg-white text-black hover:bg-gray-50"
                    : "bg-black text-white hover:bg-gray-800"
                )}
              >
                {isFollowing(displayCreator._id as Id<"creators">) ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center border-b border-black/5">
          <div className="flex gap-8 overflow-x-auto pb-px no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 pb-4 text-sm font-bold transition-colors whitespace-nowrap",
                  activeTab === tab.id ? "text-black" : "text-black/40 hover:text-black/60"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Support Card (PRIMARY FOCUS) */}
                <section className="w-full">
                  <div className="rounded-2xl bg-white p-6 sm:p-10 border border-gray-200">
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white mb-4">
                        <Heart size={24} fill="currentColor" />
                      </div>
                      <h2 className="text-2xl font-black text-black">Drop Something</h2>
                      <p className="text-sm text-gray-500 mt-1">Support my work</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        {/* Amount Helper Text */}
                        <p className="text-xs text-gray-400 mb-2">
                          H = ₦100 · K = ₦1,000
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[500, 1000, 2000].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => {
                                setTipAmount(amount);
                                setCustomAmount("");
                              }}
                              className={cn(
                                "flex h-12 items-center justify-center rounded-xl border-2 font-bold transition-all text-sm",
                                tipAmount === amount
                                  ? "border-black bg-black text-white"
                                  : "border-gray-200 bg-white text-black hover:border-gray-300"
                              )}
                            >
                              {amount >= 1000 ? `${amount / 1000}K` : `${amount / 100}H`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                        <input
                          type="number"
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setTipAmount(null);
                          }}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 font-bold text-black text-sm focus:border-black focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your name (optional)"
                          value={supporterName}
                          onChange={(e) => setSupporterName(e.target.value)}
                          className="h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-xs font-medium text-black focus:border-gray-300 focus:outline-none transition-colors"
                        />
                        <textarea
                          placeholder="Say something nice..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-xs font-medium text-black focus:border-gray-300 focus:outline-none transition-colors"
                          rows={2}
                        />
                      </div>

                      <button
                        onClick={handleDropSomething}
                        disabled={finalAmount <= 0 || isSubmitting}
                        className="flex h-14 w-full items-center justify-center rounded-xl bg-black text-sm font-black text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isSubmitting ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : showSuccess ? (
                          <div className="flex items-center gap-2">
                            <Check size={20} />
                            Dropped!
                          </div>
                        ) : (
                          `Drop ₦${finalAmount || 0}`
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {/* About Section (Follows support card) */}
                <section>
                  <div className="rounded-2xl bg-white p-6 sm:p-8 border border-gray-200">
                    <h2 className="text-xl font-black text-black mb-4">About Us</h2>
                    <div className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {(displayCreator as any).about || displayCreator?.bio || "This creator hasn't added a detailed bio yet."}
                    </div>
                  </div>
                </section>

                {/* Links Section - Regular Links Only */}
                {regularLinks.length > 0 && (
                  <section>
                    <div className="flex items-center justify-start gap-2 mb-4">
                      <ExternalLink size={18} />
                      <h2 className="font-bold text-black">Links</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                      {regularLinks.map((link) => (
                        <a
                          key={link._id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-2xl bg-white border border-black/5 p-4 transition-all hover:scale-[1.02] hover:shadow-md"
                        >
                          <span className="font-bold text-black text-sm">{link.title}</span>
                          <ExternalLink size={16} className="text-black/40" />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recent Supporters Section (Follows About) */}
                {recentSupporters.length > 0 && (
                  <section>
                    <div className="rounded-2xl bg-white p-6 sm:p-8 border border-gray-200">
                      <div className="flex items-center gap-2 mb-6">
                        <Heart size={20} className="text-red-500" />
                        <h2 className="text-xl font-black text-black">Recent supporters</h2>
                      </div>
                      <div className="space-y-3">
                        {recentSupporters.map((supporter, idx) => (
                          <div key={idx} className="flex flex-col py-3 border-b border-gray-100 last:border-b-0">
                            <p className="text-sm font-bold text-black">
                              {supporter.supporterName} dropped ₦{supporter.amount}
                            </p>
                            {supporter.message && (
                              <p className="text-xs text-gray-500 mt-1">"{supporter.message}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {activeTab === "slate" && (
              <motion.div
                key="slate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <section>
                  <div className="space-y-4">
                    {slates && slates.map((slate) => {
                      // Check if content is locked for this viewer
                      const isLocked = slate.visibility !== "public";
                      const lockMessage = slate.visibility === "followers"
                        ? "Follow to unlock this content"
                        : slate.visibility === "supporters"
                        ? "Support to unlock this content"
                        : "Become a member to unlock this content";

                      return (
                        <div
                          key={slate._id}
                          className="rounded-2xl bg-white p-6 border border-gray-200"
                        >
                          {/* Slate header with type and visibility badges */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className={cn(
                              "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                              slate.type === "text" ? "bg-blue-50 text-blue-600" :
                              slate.type === "image" ? "bg-purple-50 text-purple-600" :
                              slate.type === "video" ? "bg-pink-50 text-pink-600" :
                              "bg-emerald-50 text-emerald-600"
                            )}>
                              {slate.type}
                            </span>
                            {slate.visibility !== "public" && (
                              <span className={cn(
                                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                                slate.visibility === "followers" ? "bg-purple-50 text-purple-600" :
                                slate.visibility === "supporters" ? "bg-pink-50 text-pink-600" :
                                "bg-amber-50 text-amber-600"
                              )}>
                                <Lock size={10} />
                                {slate.visibility}
                              </span>
                            )}
                          </div>

                          {/* Slate content based on type - show locked state if needed */}
                          {isLocked ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-black/40 mb-4">
                                <Lock size={32} />
                              </div>
                              <p className="text-sm font-bold text-black">{lockMessage}</p>
                              <p className="text-xs text-black/40 mt-1">Support or join to unlock this content</p>
                            </div>
                          ) : (
                            <>
                              {slate.type === "text" && slate.content && (
                                <p className="text-sm font-medium text-black/80 whitespace-pre-wrap leading-relaxed">
                                  {slate.content}
                                </p>
                              )}

                              {slate.type === "image" && slate.mediaUrl && (
                                <img
                                  src={slate.mediaUrl}
                                  alt="Slate image"
                                  className="w-full rounded-2xl object-cover max-h-96"
                                />
                              )}

                              {slate.type === "video" && slate.playbackId && (
                                <div className="relative rounded-2xl overflow-hidden bg-black">
                                  <video
                                    controls
                                    className="w-full max-h-96 object-cover"
                                  >
                                    <source src={`https://stream.mux.com/${slate.playbackId}.m3u8`} type="application/x-mpegURL" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}

                              {slate.type === "audio" && slate.playbackId && (
                                <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
                                  <audio controls className="w-full">
                                    <source src={slate.mediaUrl || `https://stream.mux.com/${slate.playbackId}.m3u8`} />
                                    Your browser does not support the audio tag.
                                  </audio>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "membership" && (
              <motion.div
                key="membership"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <section>
                  <div className="flex items-center justify-start gap-2 mb-4">
                    <Users size={18} />
                    <h2 className="font-bold text-black">Membership Plans</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {displayCreator.memberships.map((tier) => (
                      <div key={tier._id} className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm border border-black/5">
                        <div className="mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-black/30">{tier.title}</h3>
                          <p className="mt-1 text-2xl font-black text-black">₦{tier.price.toLocaleString()}<span className="text-xs font-medium text-black/40">/mo</span></p>
                        </div>
                        <p className="flex-1 text-sm text-black/60 leading-relaxed mb-6">{tier.description}</p>
                        <button className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "shop" && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <section>
                  <div className="flex items-center justify-start gap-2 mb-4">
                    <ShoppingBag size={18} />
                    <h2 className="font-bold text-black">Shop</h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {displayCreator.products.map((product) => (
                      <div key={product._id} className="group flex flex-col rounded-[2rem] bg-white overflow-hidden shadow-sm border border-black/5">
                        <div className="aspect-square w-full bg-zinc-100 overflow-hidden">
                          <img
                            src={product.image || `https://picsum.photos/seed/${product._id}/600/600`}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              product.type === "digital" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                            )}>
                              {product.type}
                            </span>
                            <span className="font-bold text-black">₦{product.price.toLocaleString()}</span>
                          </div>
                          <h4 className="text-lg font-bold text-black mb-2">{product.title}</h4>
                          <p className="text-sm text-black/60 line-clamp-2 flex-1 mb-6">{product.description}</p>
                          <button
                            onClick={() => handlePurchase(product)}
                            disabled={isPurchasing}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            {isPurchasing ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Buy Now
                                <ChevronRight size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <section>
                  <div className="flex items-center justify-start gap-2 mb-4">
                    <Target size={18} />
                    <h2 className="font-bold text-black">Wishlist</h2>
                  </div>
                  <div className="space-y-4">
                    {wishlists && wishlists.map((item) => {
                      const progress = Math.min(100, (item.currentAmount / item.targetAmount) * 100);
                      const isCompleted = item.status === "completed";

                      return (
                        <div
                          key={item._id}
                          className={cn(
                            "rounded-2xl bg-white p-8 border",
                            isCompleted
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-gray-200"
                          )}
                        >
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-black">{item.title}</h3>
                              {isCompleted && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                  Completed
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-black/60">{item.description}</p>
                            )}
                          </div>

                          <div className="mt-6">
                            <div className="flex items-end justify-between text-xs mb-2">
                              <span className={cn("font-bold", isCompleted ? "text-emerald-700" : "text-black")}>
                                ₦{item.currentAmount.toLocaleString()}
                              </span>
                              <span className="text-black/40">₦{item.targetAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                  "h-full",
                                  isCompleted ? "bg-emerald-500" : "bg-black"
                                )}
                              />
                            </div>
                            <p className="mt-3 text-center text-xs font-bold text-black/40">
                              {Math.round(progress)}% reached
                            </p>

                            {/* Contribute Button */}
                            {!isCompleted && (
                              <button
                                onClick={() => {
                                  // Scroll to support section
                                  const supportSection = document.getElementById('support-section');
                                  if (supportSection) {
                                    supportSection.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className="mt-6 w-full h-12 rounded-full bg-black text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                              >
                                Contribute to this goal
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "goals" && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <section>
                  <div className="flex items-center justify-start gap-2 mb-4">
                    <Target size={18} />
                    <h2 className="font-bold text-black">Active Goals</h2>
                  </div>
                  <div className="space-y-4">
                    {displayCreator.goals.map((goal) => (
                      <div key={goal._id} className="rounded-[2rem] bg-white p-8 shadow-sm border border-black/5">
                        <h3 className="text-lg font-bold text-black text-center">{goal.title}</h3>
                        <div className="mt-6">
                          <div className="flex items-end justify-between text-xs mb-2">
                            <span className="font-bold text-black">₦{goal.currentAmount.toLocaleString()}</span>
                            <span className="text-black/40">₦{goal.targetAmount.toLocaleString()}</span>
                          </div>
                          <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-black"
                            />
                          </div>
                          <p className="mt-3 text-center text-xs font-bold text-black/40">
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% reached
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
