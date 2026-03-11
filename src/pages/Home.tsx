import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { CoinLogo } from '../components/CoinLogo';
import { 
  ArrowRight, 
  Users, 
  Share2, 
  Wallet, 
  Zap, 
  Heart, 
  ShieldCheck, 
  Link as LinkIcon,
  MessageSquare,
  Code,
  Music,
  CheckCircle2,
  Star
} from 'lucide-react';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-black font-sans">
      
      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Coins Scatter (Gumroad style) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ y: [0, -20, 0], rotate: [-25, -20, -25] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] left-[5%]">
            <CoinLogo className="w-32 h-32 md:w-48 md:h-48" rotation="-25deg" />
          </motion.div>
          <motion.div animate={{ y: [0, 25, 0], rotate: [-45, -40, -45] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[10%] right-[5%]">
            <CoinLogo className="w-40 h-40 md:w-56 md:h-56" rotation="-45deg" />
          </motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-[20%] right-[10%] opacity-20 blur-[2px]">
            <CoinLogo className="w-24 h-24" rotation="15deg" />
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-gray-900 leading-[0.85]"
          >
            Support the <br />
            hustle. <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#FFB7C5]">Drop</span> <br />
            Something.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto leading-tight"
          >
            A simple way to support creators and communities you love. <br />
            Send small tips, leave a message, and help creators keep creating.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/setup-profile" className="w-full sm:w-auto bg-accent px-10 py-5 rounded-full text-xl font-bold text-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              Create Your Page
              <ArrowRight size={24} />
            </Link>
            <Link to="/explore" className="w-full sm:w-auto bg-white border-2 border-gray-100 px-10 py-5 rounded-full text-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center">
              Explore Creators
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">People are already dropping something</h2>
            <div className="flex items-center justify-center gap-1 text-accent">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="currentColor" />)}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Ada", amount: "₦1,000", msg: "Your tutorials helped me so much.", color: "bg-primary/10" },
              { name: "Tunde", amount: "₦500", msg: "Keep creating bro 🔥", color: "bg-secondary/10" },
              { name: "Riderezzy", amount: "₦2,000", msg: "Big fan of your work.", color: "bg-accent/10" }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative group overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-xl">{card.name[0]}</div>
                    <div>
                      <div className="font-bold text-gray-900">{card.name} <span className="font-normal text-gray-400 text-sm">dropped</span></div>
                      <div className="text-xl font-black text-gray-900">{card.amount}</div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 font-medium italic">"{card.msg}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-32" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-extrabold text-center mb-20 tracking-tight">How DropSomething Works</h2>
          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gray-100 -z-10" />
            
            {[
              { icon: <Zap className="text-accent" />, title: "Create Your Page", desc: "Create your personal support page in seconds." },
              { icon: <Share2 className="text-primary" />, title: "Share Your Link", desc: "Add your DropSomething link to your bio, posts, or messages." },
              { icon: <Wallet className="text-secondary" />, title: "Receive Support", desc: "Fans can drop small tips and leave messages of encouragement." }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border border-gray-50 flex items-center justify-center mx-auto text-4xl transform transition-transform hover:scale-110">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 font-medium text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Creators Love It */}
      <section className="py-32 bg-gray-900 text-white rounded-[4rem] mx-4 md:mx-10 my-10 overflow-hidden relative" id="creators">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Built for creators</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Zap />, title: "Simple Setup", desc: "Create your support page in minutes." },
              { icon: <Heart />, title: "Direct Support", desc: "Receive support directly from your audience." },
              { icon: <ShieldCheck />, title: "Secure Payments", desc: "Fast and reliable payment processing." },
              { icon: <LinkIcon />, title: "Share Anywhere", desc: "Your support link works everywhere online." }
            ].map((card, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Example Creator Page */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-primary font-bold text-xs uppercase tracking-wider">Example Page</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">Your page looks <span className="italic text-primary font-serif">beautiful</span></h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              We've designed a clean, mobile-first experience that makes it incredibly easy for fans to support you without any friction. 
            </p>
            <div className="space-y-4">
              {["Custom URLs", "Beautiful layouts", "Supporter feed", "Real-time notifications"].map((f, i) => (
                <div key={i} className="flex items-center gap-3 font-bold text-gray-800">
                  <CheckCircle2 size={24} className="text-secondary" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Mockup */}
            <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-gray-900 p-8 max-w-sm mx-auto overflow-hidden relative">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-gray-100 mx-auto border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=riderezzy" className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Riderezzy</h3>
                    <p className="text-primary font-bold">Tech Creator</p>
                  </div>
                  <p className="text-sm text-gray-500 font-bold">Support my work ❤️</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[500, 1000, 2000].map(val => (
                    <div key={val} className="py-4 rounded-2xl bg-gray-50 border-2 border-transparent text-center font-bold text-gray-400">
                      ₦{val}
                    </div>
                  ))}
                  <div className="py-4 rounded-2xl bg-gray-50 border-2 border-transparent text-center font-bold text-gray-400 text-xs flex items-center justify-center">
                    Custom
                  </div>
                </div>
                <div className="pt-6 border-t font-bold">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Recent supporters</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl text-[10px]">Ada dropped ₦1000</div>
                    <div className="p-3 bg-gray-50 rounded-xl text-[10px]">Tunde dropped ₦500</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full" />
            </div>
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 rotate-12 hidden md:block"
            >
              <p className="text-xs font-bold text-gray-800">₦25,000 received! 🚀</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Community Support */}
      <section className="py-32 bg-secondary/5 rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-20">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">Support communities too</h2>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              DropSomething isn't only for individuals. Communities, student groups, podcasts, and online collectives can also receive support from their audience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MessageSquare />, title: "Podcast teams" },
              { icon: <Users />, title: "Campus clubs" },
              { icon: <Code />, title: "Open-source" },
              { icon: <Music />, title: "Collectives" }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white rounded-[2rem] shadow-lg border border-gray-100 transition-all hover:scale-105 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Why This Works */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-gray-900 mb-16 text-center tracking-tight">Why This Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Social Proof", desc: "People love supporting creators others appreciate." },
              { title: "Emotional Reward", desc: "Supporters feel good helping creators grow." },
              { title: "Community Feeling", desc: "Support builds a stronger connection between creators and their audience." }
            ].map((trigger, i) => (
              <div key={i} className="space-y-4 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-xl">
                <div className="text-5xl font-black text-gray-200 mb-2">0{i+1}</div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{trigger.title}</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">{trigger.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Featured Creators */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">Featured Creators</h2>
            <Link to="/explore" className="text-primary font-bold flex items-center gap-2 hover:underline decoration-2 text-lg">
              View all creators <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Tunde", location: "Lagos, NG", amount: "₦45,000", image: "https://i.pravatar.cc/150?u=tunde" },
              { name: "Ada", location: "Enugu, NG", amount: "₦30,000", image: "https://i.pravatar.cc/150?u=ada" },
              { name: "Riderezzy", location: "Abuja, NG", amount: "₦20,000", image: "https://i.pravatar.cc/150?u=riderezzy2" }
            ].map((creator, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl transition-all hover:-translate-y-2 flex items-center gap-6">
                <img src={creator.image} className="w-20 h-20 rounded-2xl object-cover shadow-lg" alt="" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                  <p className="text-sm font-bold text-gray-400 mb-2 underline decoration-accent decoration-2 underline-offset-4">{creator.location}</p>
                  <p className="text-lg font-black text-secondary">{creator.amount} supported</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA Section */}
      <section className="py-40 bg-accent relative overflow-hidden text-black text-center px-6 mx-4 md:mx-10 my-10 rounded-[4rem]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -right-20 opacity-10">
          <CoinLogo className="w-64 h-64" />
        </motion.div>
        
        <div className="relative z-10 space-y-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">Start receiving support from your audience.</h2>
          <p className="text-xl md:text-3xl font-bold text-black/60 max-w-2xl mx-auto">
            Create your DropSomething page today and let your supporters drop something.
          </p>
          <div className="pt-4 text-center flex justify-center">
            <Link to="/setup-profile" className="inline-flex items-center gap-3 bg-black text-white px-16 py-7 rounded-full text-2xl font-extrabold hover:scale-105 transition-all shadow-2xl">
              Create Your Page
              <ArrowRight size={32} />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="py-24 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <Link to="/" className="flex items-center gap-2 group">
                <CoinLogo className="w-10 h-10" />
                <span className="text-2xl font-bold tracking-tight text-gray-900">DropSomething</span>
              </Link>
              <p className="text-gray-500 font-medium max-w-sm">
                Supporting the hustle. A simple way for fans and communities to show love to the creators they appreciate.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Product</h4>
              <nav className="flex flex-col gap-3 text-gray-500 font-semibold">
                <Link to="/about" className="hover:text-black transition-colors">About</Link>
                <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
                <a href="#creators" className="hover:text-black transition-colors">Creators</a>
                <Link to="/explore" className="hover:text-black transition-colors">Explore</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Connect</h4>
              <nav className="flex flex-col gap-3 text-gray-500 font-semibold">
                <a href="#" className="hover:text-black transition-colors">Twitter</a>
                <a href="#" className="hover:text-black transition-colors">Instagram</a>
                <a href="#" className="hover:text-black transition-colors">Telegram</a>
                <Link to="/support" className="hover:text-black transition-colors">Support</Link>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-semibold text-gray-400">
            <p>© 2026 DropSomething. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-black transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
