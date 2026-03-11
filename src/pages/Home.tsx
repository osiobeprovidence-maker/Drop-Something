import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Heart,
  Star,
  Zap,
  Coffee,
  Palette,
  Code,
  Youtube,
  Music,
  Smile
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

import { CoinLogo } from '../components/CoinLogo';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const floatingDrops = [
    { name: "Amaka", amount: "₦2,000", message: "Your videos helped me learn design. Thank you!", x: -380, y: -200, delay: 0, image: "https://i.pravatar.cc/150?u=amaka" },
    { name: "Tunde", amount: "₦1,000", message: "Keep building bro 🔥", x: 400, y: -160, delay: 0.2, image: "https://i.pravatar.cc/150?u=tunde" },
    { name: "Sadiq", amount: "₦500", message: "This tutorial saved me!", x: -420, y: 140, delay: 0.4, image: "https://i.pravatar.cc/150?u=sadiq" },
    { name: "Kemi", amount: "₦5,000", message: "Amazing work on the new project!", x: 440, y: 200, delay: 0.6, image: "https://i.pravatar.cc/150?u=kemi" },
    { name: "Chidi", amount: "₦1,500", message: "Love the consistency!", x: -150, y: 320, delay: 0.8, image: "https://i.pravatar.cc/150?u=chidi" },
    { name: "Ife", amount: "₦3,000", message: "You're an inspiration!", x: 180, y: -300, delay: 1.0, image: "https://i.pravatar.cc/150?u=ife" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden relative selection:bg-primary selection:text-black">
      {/* Background decoration: Soft coins & Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] opacity-20 blur-sm"
        >
          <CoinLogo className="w-16 h-16" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] opacity-15 blur-[1px]"
        >
          <CoinLogo className="w-24 h-24" />
        </motion.div>

        {/* Extra small coins */}
        <motion.div 
          animate={{ x: [0, 10, 0], y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[15%] opacity-10"
        >
          <CoinLogo className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <main className="relative pt-32 pb-32 px-6 flex flex-col items-center justify-center text-center max-w-6xl mx-auto min-h-[calc(100vh-64px)]">
        
        {/* Floating Drops (Background) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {floatingDrops.map((drop, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9, y: drop.y + 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [drop.y, drop.y - 15, drop.y]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                delay: drop.delay,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 top-1/2 p-5 bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-72 text-left flex items-start gap-4"
              style={{ 
                marginLeft: drop.x, 
                marginTop: drop.y,
                zIndex: 10
              }}
            >
              <img src={drop.image} className="w-12 h-12 rounded-2xl bg-gray-100 flex-shrink-0 object-cover shadow-sm" alt="" />
              <div>
                <div className="font-bold text-sm text-gray-900 leading-tight mb-1">{drop.name} <span className="text-gray-400 font-normal">dropped</span> {drop.amount}</div>
                <div className="text-xs text-gray-500 leading-snug line-clamp-2">"{drop.message}"</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 space-y-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100"
          >
            <div className="flex -space-x-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#FFDD00" className="text-[#FFDD00]" />
              ))}
            </div>
            <span className="font-bold text-xs text-gray-500 uppercase tracking-wider">Loved by 2,000,000+ creators</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              className="text-7xl md:text-8xl lg:text-[10rem] font-extrabold leading-[0.85] tracking-tighter text-gray-900"
            >
              Fund your <br />
              <span className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FFB7C5] to-primary italic">creative</span>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="absolute -top-4 -right-8 md:-top-8 md:-right-12"
                >
                  <CoinLogo className="w-8 h-8 md:w-14 md:h-14 rotate-12" />
                </motion.div>
              </span> work
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-3xl font-medium text-gray-500 max-w-2xl mx-auto leading-tight"
          >
            Accept support. Start a membership. Setup a shop. <br className="hidden md:block" />
            It’s easier than you think.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-6 pt-6"
          >
            <Link
              to="/setup-profile"
              className="bg-accent px-14 py-6 rounded-full text-2xl font-bold text-black shadow-[0_10px_40px_-10px_rgba(255,221,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(255,221,0,0.6)] hover:-translate-y-1 active:scale-95 transition-all group flex items-center gap-4"
            >
              Start my page
              <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="font-bold text-gray-400 text-sm tracking-tight">
              It’s free and takes less than a minute!
            </p>
          </motion.div>
        </div>

        {/* Floating Icons decoration (Subtle) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none">
          <Youtube className="absolute top-[20%] left-[15%] w-32 h-32 rotate-[12deg]" />
          <Music className="absolute bottom-[20%] right-[15%] w-32 h-32 rotate-[-15deg]" />
          <Palette className="absolute top-[60%] left-[10%] w-28 h-28 rotate-[-5deg]" />
          <Code className="absolute top-[15%] right-[20%] w-28 h-28 rotate-[8deg]" />
          <Smile className="absolute bottom-[10%] left-[25%] w-24 h-24 rotate-[-12deg]" />
          <Heart className="absolute top-[40%] right-[10%] w-24 h-24 rotate-[20deg]" fill="currentColor" />
        </div>
      </main>


      {/* Footer Branding (Softer) */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <CoinLogo className="w-8 h-8" />
            <span className="font-bold text-gray-900 tracking-tight">© 2026 DropSomething</span>
          </div>
          <div className="flex gap-8 font-semibold text-sm text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
            <a href="#" className="hover:text-black transition-colors">Instagram</a>
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

