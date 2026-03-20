import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { Heart, Users, Target, ShoppingBag, ExternalLink, Check, ChevronRight, Share2, Copy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useFollow } from "@/src/context/FollowContext";
import { useAuth } from "@/src/context/AuthContext";

export default function CreatorPage() {
  const { username } = useParams();
  const { convexUserId } = useAuth();
  const { follow, unfollow, isFollowing } = useFollow();

  // Fetch specific creator from Convex
  const convexCreator = useQuery(api.creators.getCreatorByUsername, {
    username: username || ""
  });

  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use Convex data
  const displayCreator = convexCreator;

  const isLoading = convexCreator === undefined;
  const isOwnPage = !username || convexCreator?.userId === (convexUserId as string);
  const addConvexTip = useMutation(api.creators.addTip);

  const resolvedAvatar = useMemo(() => {
    if (!displayCreator) return "";
    return displayCreator.avatar;
  }, [displayCreator]);

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
    const amount = tipAmount || (customAmount ? parseInt(customAmount) : 0);
    if (amount <= 0 || !displayCreator) return;

    setIsSubmitting(true);

    try {
      // Use the real mutation with Convex
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
    } catch (error) {
      console.error("Tip error:", error);
      alert("Failed to drop tip. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharePage = () => {
    if (navigator.share) {
      navigator.share({
        title: `Support ${displayCreator.name} on DropSomething`,
        url: window.location.href,
      });
    } else {
      copyLink();
    }
  };

  const finalAmount = tipAmount || (customAmount ? parseInt(customAmount) : 0);

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
        <Link to="/explore" className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white">
          Browse Creators
        </Link>
      </div>
    );
  }

  const showHome = true;
  const showMembership = (displayCreator.pageStyle === "hybrid" || displayCreator.pageStyle === "support") && displayCreator.memberships.length > 0;
  const showGoals = (displayCreator.pageStyle === "hybrid" || displayCreator.pageStyle === "goal") && displayCreator.goals.length > 0;
  const showShop = (displayCreator.pageStyle === "hybrid" || displayCreator.pageStyle === "shop") && displayCreator.products.length > 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 pt-20">
      {/* Navigation for Guests */}
      {!isOwnPage && (
        <div className="fixed top-20 left-4 z-40 sm:left-8">
          <Link
            to="/explore"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-sm backdrop-blur-md border border-black/5 transition-transform hover:scale-110 active:scale-95 sm:h-12 sm:w-12"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-40 w-full bg-zinc-200 sm:h-64 overflow-hidden">
        <img 
          src={displayCreator.coverImage} 
          alt="" 
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Profile Section */}
        <div className="relative -mt-12 mb-12 flex flex-col items-center text-center">
          <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32">
            <div className="h-full w-full overflow-hidden rounded-[2.5rem] border-4 border-white bg-zinc-100 shadow-xl shadow-black/5">
              <img src={resolvedAvatar} alt={displayCreator?.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-black text-black sm:text-3xl">@{displayCreator?.username}</h1>
            <p className="mt-2 text-base font-medium text-black/60 max-w-lg">{displayCreator?.bio}</p>
            
            {/* Follow Button - Only show if not own page and user is logged in */}
            {!isOwnPage && convexUserId && displayCreator && (
              <button
                onClick={handleFollow}
                className={cn(
                  "mt-4 flex h-12 items-center justify-center rounded-full px-8 text-sm font-bold transition-all hover:scale-105 active:scale-95",
                  isFollowing(displayCreator._id as Id<"creators">)
                    ? "bg-black/5 text-black hover:bg-black/10"
                    : "bg-black text-white hover:bg-black/90"
                )}
              >
                {isFollowing(displayCreator._id as Id<"creators">) ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-16">
          {/* Main Support Card (PRIMARY FOCUS) */}
          {showHome && (
            <section id="home" className="scroll-mt-24">
              <div className="rounded-[2.5rem] bg-white p-6 shadow-sm border border-black/5 sm:p-10">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white mb-4">
                    <Heart size={24} fill="currentColor" />
                  </div>
                  <h2 className="text-2xl font-black text-black">Drop Something</h2>
                  <p className="text-sm text-black/40 mt-1">Support my work with a small tip</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setTipAmount(amount);
                          setCustomAmount("");
                        }}
                        className={cn(
                          "flex h-14 items-center justify-center rounded-2xl border-2 font-bold transition-all",
                          tipAmount === amount
                            ? "border-black bg-black text-white"
                            : "border-black/5 bg-zinc-50 text-black hover:border-black/20"
                        )}
                      >
                        ₦{amount}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/40">₦</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setTipAmount(null);
                      }}
                      className="h-14 w-full rounded-2xl border-2 border-black/5 bg-zinc-50 pl-10 pr-4 font-bold text-black focus:border-black/20 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={supporterName}
                      onChange={(e) => setSupporterName(e.target.value)}
                      className="h-14 w-full rounded-2xl border-2 border-black/5 bg-zinc-50 px-4 text-sm font-medium text-black focus:border-black/20 focus:outline-none transition-colors"
                    />
                    <textarea
                      placeholder="Say something nice..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-2xl border-2 border-black/5 bg-zinc-50 p-4 text-sm font-medium text-black focus:border-black/20 focus:outline-none transition-colors"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleDropSomething}
                    disabled={finalAmount <= 0 || isSubmitting}
                    className="flex h-16 w-full items-center justify-center rounded-full bg-black text-lg font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-black/10"
                  >
                    {isSubmitting ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : showSuccess ? (
                      <div className="flex items-center gap-2">
                        <Check size={24} />
                        Dropped!
                      </div>
                    ) : (
                      `Drop ₦${finalAmount || 0}`
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Membership Section */}
          {showMembership && (
            <section id="membership" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-center gap-2 text-black/40">
                <Users size={18} />
                <h2 className="font-bold uppercase tracking-widest text-[10px]">Memberships</h2>
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
          )}

          {/* Goals Section */}
          {showGoals && (
            <section id="goals" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-center gap-2 text-black/40">
                <Target size={18} />
                <h2 className="font-bold uppercase tracking-widest text-[10px]">Active Goals</h2>
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
          )}

          {/* Shop Section */}
          {showShop && (
            <section id="shop" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-center gap-2 text-black/40">
                <ShoppingBag size={18} />
                <h2 className="font-bold uppercase tracking-widest text-[10px]">Shop</h2>
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
                      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
                        Buy Now
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Links Section */}
          {displayCreator.links.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-black/40">
                <ExternalLink size={18} />
                <h2 className="font-bold uppercase tracking-widest text-[10px]">Links</h2>
              </div>
              <div className="flex flex-col gap-3">
                {displayCreator.links.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-2xl bg-white border border-black/5 p-5 transition-all hover:scale-[1.02] hover:shadow-md group"
                  >
                    <span className="font-bold text-black">{link.title}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
