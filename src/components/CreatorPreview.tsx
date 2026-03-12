import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Share2, 
  ShieldCheck, 
  Home as HomeIcon, 
  Users as MembersIcon, 
  ShoppingBag as ShopIcon, 
  FileText, 
  CheckCircle2,
  Video,
  Mic,
  Play,
  PlayCircle,
  Target,
  Sparkles,
  ArrowRight,
  Twitter,
  Instagram,
  Globe,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { VoicePlayer } from './VoicePlayer';

interface CreatorPreviewProps {
  profileData: {
    displayName: string;
    tagline: string;
    photoURL: string;
    coverURL: string;
    username: string;
  };
  tiers: { title: string; price: number; benefits: string[] }[];
  products: { title: string; price: number; description: string; imageUrl: string }[];
  bioData: {
    bio: string;
    twitter: string;
    instagram: string;
    website: string;
  };
}

export function CreatorPreview({ profileData, tiers, products, bioData }: CreatorPreviewProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'members' | 'shop' | 'bio'>('home');

  const displayName = profileData.displayName || 'Your Name';
  const username = profileData.username || displayName.toLowerCase().replace(/\s+/g, '') || 'username';

  return (
    <div className="w-full h-full bg-white overflow-y-auto rounded-3xl shadow-2xl border border-gray-100 flex flex-col">
      {/* 1. COVER & PROFILE SECTION */}
      <div className="relative h-48 shrink-0">
        {profileData.coverURL ? (
          <img src={profileData.coverURL} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute -bottom-12 left-6 flex flex-col md:flex-row items-end gap-6 px-2">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white p-1 shadow-2xl overflow-hidden border-2 border-white relative z-10 shrink-0">
                {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt={displayName} className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/20 bg-gray-50 uppercase text-3xl font-black">
                        {displayName[0]}
                    </div>
                )}
            </div>
            <div className="text-white relative z-10 pb-2">
                <h1 className="text-3xl font-black tracking-tighter drop-shadow-xl leading-none">
                    {displayName}
                </h1>
                <p className="text-sm font-bold opacity-90 tracking-tight drop-shadow-md">
                    @{username}
                </p>
            </div>
        </div>
      </div>

      {/* 2. TAB NAV */}
      <div className="mt-16 px-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-6 h-12 overflow-x-auto no-scrollbar">
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
                "relative h-full flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all px-1 whitespace-nowrap",
                activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="previewActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Support Card */}
              <div className="premium-card-soft space-y-6 relative overflow-hidden bg-white border border-gray-50 !p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Heart size={20} fill="currentColor" />
                  </div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tighter leading-none">Drop something for {displayName}</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map((val) => (
                      <div key={val} className="py-3 rounded-xl font-black text-sm bg-gray-50 border border-transparent text-gray-400 text-center">
                        ₦{val.toLocaleString()}
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-gray-50 rounded-xl p-3 text-xs text-gray-300 font-bold border border-gray-100">
                    Custom amount...
                  </div>
                  <button className="w-full py-4 bg-black text-white rounded-full font-black text-sm flex items-center justify-center gap-3 shadow-lg">
                    <Heart size={16} fill="currentColor" />
                    Support
                  </button>
                </div>
              </div>

              {/* Tagline Badge */}
              {profileData.tagline && (
                <div className="px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs font-black text-primary italic text-center leading-relaxed">
                        "{profileData.tagline}"
                    </p>
                </div>
              )}

              {/* Goal Preview */}
              <div className="premium-card-soft bg-white border border-gray-100 !p-6 space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Active Goal</h3>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">35%</span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-primary w-1/3 rounded-full" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 text-center italic">"Early Funding for my next project"</p>
              </div>

              {/* Membership Preview */}
              <div className="premium-card-soft bg-secondary text-white !p-6 space-y-4 relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                    <MembersIcon size={20} className="mb-2" />
                    <h3 className="text-lg font-black tracking-tighter">Join the Fam</h3>
                    <p className="text-[10px] text-white/70 font-bold leading-tight">Unlock exclusive content and direct access.</p>
                </div>
                <button className="w-full py-3 bg-white text-secondary rounded-full font-black text-xs shadow-lg">
                    View Tiers
                </button>
              </div>

              {/* Supporters */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900 tracking-tight">Recent Supporters</h3>
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-md">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center font-black text-[8px] shadow-md">
                    +12
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {tiers.length > 0 ? (
                tiers.map((tier, i) => (
                  <div key={i} className="premium-card-soft !p-6 space-y-4 border border-gray-100 flex flex-col">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-gray-900 tracking-tighter leading-none">{tier.title}</h3>
                      <p className="text-xl font-black text-gray-900 tracking-tight">₦{tier.price.toLocaleString()}<span className="text-[10px] font-bold opacity-30">/mo</span></p>
                    </div>
                    <ul className="space-y-2 flex-1">
                      {tier.benefits.map((b, j) => (
                        <li key={j} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                          <CheckCircle2 size={12} className="text-secondary shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-full font-black text-xs hover:bg-gray-100 transition-all border border-gray-100">
                      Join Tier
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-4 px-6">
                    <MembersIcon size={40} className="mx-auto text-gray-100" />
                    <p className="text-xs font-bold text-gray-300 italic">No membership tiers added to preview yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'shop' && (
              <motion.div 
                key="shop"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-4"
              >
                {products.length > 0 ? (
                    products.map((item, i) => (
                        <div key={i} className="space-y-2 group">
                            <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 shadow-sm relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <ShopIcon size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="px-1">
                                <h4 className="font-black text-[10px] text-gray-900 truncate">{item.title}</h4>
                                <p className="text-[10px] text-primary font-black">₦{item.price.toLocaleString()}</p>
                            </div>
                            <button className="w-full py-2 bg-black text-white rounded-full font-black text-[8px] uppercase tracking-widest">Buy</button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-12 space-y-4 px-6">
                        <ShopIcon size={40} className="mx-auto text-gray-100" />
                        <p className="text-xs font-bold text-gray-300 italic">No products added to preview yet.</p>
                    </div>
                )}
              </motion.div>
          )}

          {activeTab === 'bio' && (
              <motion.div 
                key="bio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                            <FileText size={16} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tighter">My Story</h3>
                    </div>
                    <p className="text-[11px] text-gray-600 font-bold leading-relaxed whitespace-pre-wrap italic">
                        {bioData.bio || "Your story will appear here once you type it in the setup form."}
                    </p>
                </div>

                {/* Socials Preview */}
                <div className="flex flex-wrap gap-2">
                    {bioData.twitter && (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 text-[10px] font-black">
                            <Twitter size={12} /> Twitter
                        </div>
                    )}
                    {bioData.instagram && (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 text-[10px] font-black">
                            <Instagram size={12} /> Instagram
                        </div>
                    )}
                    {bioData.website && (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 text-[10px] font-black">
                            <Globe size={12} /> Website
                        </div>
                    )}
                </div>

                <div className="premium-card-soft bg-gray-50 border border-gray-100 !p-4 flex items-center gap-4">
                    <Mic size={16} className="text-secondary" />
                    <div className="flex-1 h-1 bg-gray-200 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-secondary w-1/4 rounded-full" />
                    </div>
                    <span className="text-[8px] font-black text-gray-400">0:45</span>
                </div>

                <button className="w-full py-4 bg-primary/10 text-primary rounded-full font-black text-sm flex items-center justify-center gap-3">
                    <Heart size={16} fill="currentColor" />
                    Support Creator
                </button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Branding */}
      <div className="py-4 px-6 border-t border-gray-100 bg-gray-50/50 shrink-0 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 flex items-center justify-center gap-2">
             Previewing on <span className="text-primary italic">DropSomething</span>
          </p>
      </div>
    </div>
  );
}
