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
      <section className="relative pt-32 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-gray-900 leading-[0.9]">
              Support the hustle.
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-primary leading-[0.9]">
              Drop Something.
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <p className="text-xl md:text-3xl font-bold text-gray-500 max-w-4xl mx-auto leading-tight">
              A simple way to support creators and communities you love.
            </p>
            <p className="text-xl md:text-3xl font-bold text-gray-400 max-w-4xl mx-auto leading-tight">
              Send small tips, leave a message and help creators keep creating.
            </p>
          </motion.div>

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


      {/* 5. Support Creators Showcase */}
      <section className="py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-black tracking-widest text-xs uppercase">SUPPORT</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                Give your audience an easy way to support you.
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-lg">
                With DropSomething, your supporters can send small tips and leave messages of appreciation.
              </p>
              <p className="text-xl text-gray-400 font-bold leading-relaxed max-w-lg">
                In just a few taps, they can drop something and help you keep creating.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Mock Support Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 p-8 max-w-sm mx-auto relative z-20"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Heart className="text-primary" size={20} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Support Riderezzy</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[500, 1000, 2000].map(val => (
                    <button key={val} className="w-full py-4 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-accent hover:bg-white transition-all font-black text-gray-400 hover:text-black hover:shadow-md">
                      Drop ₦{val}
                    </button>
                  ))}
                </div>

                <div className="relative">
                   <textarea 
                    placeholder="Say something nice..." 
                    className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-accent outline-none min-h-[120px] resize-none placeholder:text-gray-300"
                   />
                </div>

                <button className="w-full py-5 bg-black text-white rounded-full font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Drop Something
                </button>
              </div>
            </motion.div>

            {/* Floating Supporter Cards */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -left-4 md:-left-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-50 z-30 max-w-[220px]"
            >
              <div className="flex flex-col gap-2">
                <div className="font-black text-sm text-gray-900">Ada <span className="text-gray-400 font-bold">dropped</span> ₦1000</div>
                <p className="text-xs text-gray-500 font-bold italic leading-relaxed">"Your tutorials helped me so much."</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs">✨</span>
                  <span className="text-xs">🙌</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -right-4 md:-right-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-50 z-30 max-w-[220px]"
            >
              <div className="flex flex-col gap-2">
                <div className="font-black text-sm text-gray-900">Riderezzy <span className="text-gray-400 font-bold">dropped</span> ₦2000</div>
                <p className="text-xs text-gray-500 font-bold italic leading-relaxed">"Big fan of your work."</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs">🚀</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 -right-10 md:-right-24 bg-white p-5 rounded-2xl shadow-xl border border-gray-50 z-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-black text-[10px]">T</div>
                <div>
                  <div className="font-black text-[10px] text-gray-900 leading-none">Tunde</div>
                  <div className="text-[10px] text-gray-400 font-bold">Keep creating 🔥</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5.5 Membership + Goal Section */}
      <section className="py-32 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-secondary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">CREATOR SUPPORT</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                  Turn your biggest fans into supporters.
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-lg">
                  Give your audience more ways to support your work. Start memberships for recurring support or set a goal your community can help you achieve.
                </p>
                <p className="text-xl text-gray-400 font-bold leading-relaxed max-w-lg">
                  Supporters can contribute monthly or help you reach something meaningful like new equipment, projects, or creative goals.
                </p>
              </div>
            </div>

            {/* Right: Visual Side-by-Side systems */}
            <div className="space-y-12">
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                {/* Membership Column */}
                <div className="space-y-6">
                  {[
                    { title: "Supporter Tier", price: "₦1,000", benefits: ["Support my work monthly", "Early access to new content", "Exclusive supporter updates"] },
                    { title: "Inner Circle", price: "₦3,000", benefits: ["Monthly supporter badge", "Behind-the-scenes updates", "Exclusive posts and messages"] },
                    { title: "Super Supporter", price: "₦5,000", benefits: ["Priority supporter recognition", "Special shoutouts", "Access to exclusive content"] }
                  ].map((tier, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 space-y-4 hover:shadow-xl transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-gray-900 leading-none mb-1">{tier.title}</h4>
                          <p className="text-primary font-bold text-sm tracking-tight">{tier.price} <span className="text-gray-400 font-normal">/ mo</span></p>
                        </div>
                        <button className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-[10px] font-black group-hover:bg-primary transition-all active:scale-95">Join</button>
                      </div>
                      <ul className="space-y-2">
                        {tier.benefits.map((b, j) => (
                          <li key={j} className="text-[9px] font-bold text-gray-500 flex items-center gap-2">
                            <div className="w-1 h-1 bg-accent rounded-full" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                {/* Creator Goal Column */}
                <div className="relative pt-12 sm:pt-16">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 relative z-20 space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                        <Star className="text-secondary" size={24} fill="currentColor" />
                      </div>
                      <h4 className="text-xl font-black text-gray-900 leading-tight">Buy a new camera for better videos</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-gray-900">₦120,000 <span className="text-gray-400 font-bold">raised</span></span>
                        <span className="text-gray-400">₦200,000 <span className="text-gray-400 font-bold">goal</span></span>
                      </div>
                      <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '60%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-accent rounded-full shadow-[0_0_12px_rgba(255,221,0,0.5)]"
                        />
                      </div>
                    </div>

                    <button className="w-full py-5 bg-black text-white rounded-full font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                      Drop Something
                    </button>
                  </motion.div>

                  {/* Floating Supporter Messages around goal */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 -right-4 bg-white p-4 rounded-3xl shadow-2xl border border-gray-50 z-30 max-w-[180px] rotate-6"
                  >
                    <div className="font-black text-[10px] text-gray-900 leading-none mb-1 flex items-center gap-1">
                      Ada <span className="text-primary">dropped</span> ₦2k
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold leading-tight">"Can't wait to see your new videos!"</p>
                  </motion.div>

                  <motion.div 
                    animate={{ x: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 -left-12 bg-white p-5 rounded-3xl shadow-2xl border border-gray-50 z-30 max-w-[160px] -rotate-12"
                  >
                    <div className="font-black text-[10px] text-gray-900 leading-none mb-1 flex items-center gap-1">
                      Tunde <span className="text-secondary">dropped</span> ₦1k
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold leading-tight">"Keep creating 🔥"</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.6 How DropSomething Works */}
      <section className="py-32 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-primary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">HOW IT WORKS</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Start receiving support in minutes.
            </h2>
            <p className="text-xl text-gray-500 font-bold leading-relaxed">
              DropSomething makes it easy for creators and communities to receive support from their audience. Create your page, share your link, and let supporters drop something.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {[
              { 
                step: "01", 
                title: "Create Your Page", 
                desc: "Set up your personal DropSomething page with your name, bio, and profile picture.",
                sub: "Your page becomes your personal support hub."
              },
              { 
                step: "02", 
                title: "Share Your Link", 
                desc: "Add your DropSomething link to your social media bio, posts, videos, or messages.",
                sub: "Anywhere your audience follows you."
              },
              { 
                step: "03", 
                title: "Receive Support", 
                desc: "Your fans can drop small tips, leave messages, join memberships, or help you reach your goals.",
                sub: "Support arrives instantly."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6 group"
              >
                <div className="text-6xl font-black text-gray-100 group-hover:text-accent transition-colors leading-none">{item.step}</div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-wider">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-8 pt-10 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Supporters see this</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[500, 1000, 2000].map(val => (
                <button key={val} className="px-8 py-4 bg-white border-2 border-black rounded-2xl font-black text-gray-400 hover:bg-accent hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 active:translate-y-0 active:shadow-none">
                  Drop ₦{val}
                </button>
              ))}
            </div>
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

      {/* 7. Who It’s For */}
      <section className="py-32 bg-gray-900 text-white rounded-[4rem] mx-4 md:mx-10 my-10 overflow-hidden relative" id="creators">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <span className="text-secondary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">CREATORS</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Built for creators, communities, and builders.</h2>
            <p className="text-xl text-gray-400 font-bold leading-relaxed">
              DropSomething is designed for people who create value online and want a simple way for their audience to support them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="grid gap-8">
              <motion.div 
                whileHover={{ x: 10 }}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
              >
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
                  <Heart size={24} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Content Creators</h3>
                <p className="text-gray-400 font-bold leading-relaxed">Video creators, streamers, and influencers can receive support directly from their audience.</p>
              </motion.div>

              <motion.div 
                whileHover={{ x: 10 }}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
              >
                <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-2xl flex items-center justify-center">
                  <Code size={24} />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Developers & Builders</h3>
                <p className="text-gray-400 font-bold leading-relaxed">Developers, open-source maintainers, and tech educators can receive appreciation for their work.</p>
              </motion.div>
            </div>

            <div className="grid gap-8 md:pt-12">
              <motion.div 
                whileHover={{ x: 10 }}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
              >
                <div className="w-12 h-12 bg-accent/20 text-accent rounded-2xl flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Writers & Designers</h3>
                <p className="text-gray-400 font-bold leading-relaxed">Writers, designers, and educators can receive support from readers and followers.</p>
              </motion.div>

              <motion.div 
                whileHover={{ x: 10 }}
                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
              >
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
                  <Users size={24} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Communities & Projects</h3>
                <p className="text-gray-400 font-bold leading-relaxed">Podcasts, clubs, and online communities can collect support for projects, events, or goals.</p>
              </motion.div>
            </div>
          </div>

          <div className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Your supporters belong to you",
              "Instant payments to your account",
              "No complicated setup",
              "Simple support links everywhere"
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-4 px-6 rounded-2xl bg-white/5 border border-white/5">
                <CheckCircle2 size={18} className="text-accent" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-300">{f}</span>
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
                <span className="text-2xl font-black tracking-tighter text-gray-900">DropSomething</span>
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
