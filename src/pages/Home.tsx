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

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const floatingDrops = [
    { name: "Amaka", amount: "₦2,000", message: "Your videos helped me learn design. Thank you!", x: -350, y: -180, delay: 0 },
    { name: "Tunde", amount: "₦1,000", message: "Keep building bro 🔥", x: 380, y: -150, delay: 0.2 },
    { name: "Sadiq", amount: "₦500", message: "This tutorial saved me!", x: -400, y: 150, delay: 0.4 },
    { name: "Kemi", amount: "₦5,000", message: "Amazing work on the new project!", x: 420, y: 180, delay: 0.6 },
    { name: "Chidi", amount: "₦1,500", message: "Love the consistency!", x: -100, y: 300, delay: 0.8 },
    { name: "Ife", amount: "₦3,000", message: "You're an inspiration!", x: 150, y: -280, delay: 1.0 },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden relative selection:bg-primary selection:text-black">
      {/* Hero Section */}
      <main className="relative pt-20 pb-20 px-6 flex flex-col items-center justify-center text-center max-w-6xl mx-auto min-h-[calc(100vh-80px)]">
        
        {/* Floating Drops (Background) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {floatingDrops.map((drop, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [drop.y, drop.y - 20, drop.y]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: drop.delay,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 top-1/2 p-4 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] w-64 text-left"
              style={{ 
                marginLeft: drop.x, 
                marginTop: drop.y,
                zIndex: 10
              }}
            >
              <div className="font-black text-sm mb-1">{drop.name} dropped {drop.amount}</div>
              <div className="text-xs text-gray-600 font-bold italic leading-tight">"{drop.message}"</div>
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="flex -space-x-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} fill="#FFD700" className="text-black stroke-[3px]" />
              ))}
            </div>
            <span className="font-black text-sm uppercase tracking-widest ml-2">Loved by 2,000,000+ creators</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight"
          >
            Fund your <br />
            <span className="text-primary italic">creative</span> work
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mx-auto"
          >
            Accept support. Start a membership. Setup a shop. <br className="hidden md:block" />
            It’s easier than you think.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <Link
              to="/setup-profile"
              className="bg-primary px-12 py-6 border-4 border-black text-2xl font-black shadow-[10px_10px_0px_0px_#000] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[14px_14px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all group flex items-center gap-4"
            >
              Start my page
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform stroke-[4px]" />
            </Link>
            <p className="font-black text-gray-500 uppercase text-xs tracking-widest">It’s free and takes less than a minute!</p>
          </motion.div>
        </div>

        {/* Floating Icons decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-10 select-none">
          <Youtube className="absolute top-[20%] left-[15%] w-24 h-24 rotate-[12deg]" />
          <Music className="absolute bottom-[20%] right-[15%] w-24 h-24 rotate-[-15deg]" />
          <Palette className="absolute top-[60%] left-[10%] w-20 h-20 rotate-[-5deg]" />
          <Code className="absolute top-[15%] right-[20%] w-20 h-20 rotate-[8deg]" />
          <Smile className="absolute bottom-[10%] left-[25%] w-16 h-16 rotate-[-12deg]" />
          <Heart className="absolute top-[40%] right-[10%] w-16 h-16 rotate-[20deg]" fill="currentColor" />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-10 border-t-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary border-4 border-black rounded-full flex items-center justify-center rotate-[-15deg]">
              <span className="font-black italic">D</span>
            </div>
            <span className="font-black">© 2026 DropSomething</span>
          </div>
          <div className="flex gap-8 font-black text-sm uppercase">
            <a href="#" className="hover:text-primary">Twitter</a>
            <a href="#" className="hover:text-primary">Instagram</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
