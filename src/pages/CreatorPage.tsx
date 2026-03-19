import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { Heart, Users, Target, ShoppingBag, ExternalLink, Check, ChevronRight, Share2, Copy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useData } from "@/src/context/DataContext";
import { MOCK_CREATORS } from "@/src/lib/mockData";

export default function CreatorPage() {
  const { username } = useParams();
  const { creator, addTip } = useData();
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find the creator to display
  const displayCreator = useMemo(() => {
    // If it's the current user's page (either matching username or no username)
    if (!username || username === creator.username) {
      return creator;
    }
    
    // Otherwise look in mock data
    const mock = MOCK_CREATORS.find(c => c.username === username);
    return mock || creator; // fallback to current user if not found
  }, [username, creator]);

  const isOwnPage = !username || username === creator.username;

  const handleDropSomething = () => {
    const amount = tipAmount || (customAmount ? parseInt(customAmount) : 0);
    if (amount <= 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // If it's our own page, we can actually add the tip to our context
      if (isOwnPage) {
        addTip({
          supporterName: supporterName || "Anonymous Supporter",
          amount: amount,
          message: message,
          type: "tip"
        });
      }
      
      setIsSubmitting(false);
      setShowSuccess(true);
      setTipAmount(null);
      setCustomAmount("");
      setSupporterName("");
      setMessage("");
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
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
          <div className="relative inline-block">
            <div className="h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg sm:h-32 sm:w-32">
              <img src={displayCreator.avatar} alt={displayCreator.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-black text-black sm:text-3xl">@{displayCreator.username}</h1>
            <p className="mt-2 text-base font-medium text-black/60 max-w-lg">{displayCreator.bio}</p>
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
                  <div key={tier.id} className="flex flex-col rounded-[2rem] bg-white p-6 shadow-sm border border-black/5">
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
                  <div key={goal.id} className="rounded-[2rem] bg-white p-8 shadow-sm border border-black/5">
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
                  <div key={product.id} className="group flex flex-col rounded-[2rem] bg-white overflow-hidden shadow-sm border border-black/5">
                    <div className="aspect-square w-full bg-zinc-100 overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${product.id}/600/600`} 
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
                    key={link.id}
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
