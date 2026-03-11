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
  Star,
  ChevronDown
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
              "Simple support links you can share anywhere"
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-4 px-6 rounded-2xl bg-white/5 border border-white/5">
                <CheckCircle2 size={18} className="text-accent" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Example Creator Page - LATER */}
      {/* <section className="py-32 overflow-hidden"> ... </section> */}

      {/* Why DropSomething Section */}
      <section className="py-32 bg-white" id="why-dropsomething">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-primary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">WHY DROPSOMETHING</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Built for the modern creator.
            </h2>
            <p className="text-xl text-gray-500 font-bold leading-relaxed max-w-2xl mx-auto">
              We've stripped away the complexity so you can focus on what you do best: creating value for your audience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Grow your community",
                desc: "Build a direct, meaningful connection with your supporters. No algorithms, just pure appreciation.",
                icon: <Users className="text-primary" size={32} />
              },
              {
                title: "Instant Support",
                desc: "Receive tips, memberships, and goal contributions without the typical platform delays or hurdles.",
                icon: <Zap className="text-secondary" size={32} fill="currentColor" />
              },
              {
                title: "Total Control",
                desc: "Your page, your brand, your audience. Customize your experience to reflect your unique creative identity.",
                icon: <ShieldCheck className="text-accent" size={32} />
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-bold leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-32 bg-gray-50" id="social-proof">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-secondary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">SOCIAL PROOF</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
              Trusted by creators everywhere.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "DropSomething changed how I interact with my fans. It's the most seamless support tool I've ever used.",
                author: "Tunde",
                role: "Content Creator",
                image: "https://i.pravatar.cc/150?u=tunde"
              },
              {
                quote: "The easiest way to receive appreciation for my open source work. My supporters love the simplicity.",
                author: "Ada",
                role: "Software Developer",
                image: "https://i.pravatar.cc/150?u=ada"
              },
              {
                quote: "I reached my photography goal in just two weeks! The community vibe here is unmatched.",
                author: "Riderezzy",
                role: "Photographer",
                image: "https://i.pravatar.cc/150?u=riderezzy"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 flex flex-col justify-between"
              >
                <p className="text-xl text-gray-600 font-bold italic leading-relaxed mb-8">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt={testimonial.author} />
                  <div>
                    <h4 className="font-black text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-32 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-primary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">FAQ</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-500 font-bold leading-relaxed">
              Everything you need to know about using DropSomething.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { 
                q: "What is DropSomething?", 
                a: "DropSomething is a platform that allows creators and communities to receive support directly from their audience through small tips, memberships, or goal contributions." 
              },
              { 
                q: "How do supporters send money?", 
                a: "Supporters can choose an amount such as ₦500, ₦1000, or ₦2000, leave a message, and complete the payment in just a few taps." 
              },
              { 
                q: "Who can use DropSomething?", 
                a: "Anyone who creates value online can use DropSomething — creators, developers, writers, designers, podcasters, and online communities." 
              },
              { 
                q: "Can I set goals for my supporters?", 
                a: "Yes. You can create goals such as buying equipment, funding a project, or launching something new, and your supporters can help you reach that goal." 
              },
              { 
                q: "Are memberships available?", 
                a: "Yes. Creators can offer monthly memberships so their biggest fans can support them consistently." 
              },
              { 
                q: "How do I share my page?", 
                a: "Once you create your page, you get a personal link that you can share on your social media, bio, or anywhere your audience follows you." 
              }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                    <h3 className="text-xl font-black text-gray-900 pr-6">{faq.q}</h3>
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center transition-transform group-open:rotate-180">
                      <ChevronDown size={20} className="text-primary" />
                    </div>
                  </summary>
                  <div className="px-8 pb-8">
                    <p className="text-lg text-gray-500 font-bold leading-relaxed border-t border-gray-100 pt-6">
                      {faq.a}
                    </p>
                  </div>
                </details>
              </motion.div>
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
                <a href="#how-it-works" className="hover:text-black transition-all">How it Works</a>
                <a href="#creators" className="hover:text-black transition-all">Creators</a>
                <a href="#why-dropsomething" className="hover:text-black transition-all">Why Us</a>
                <a href="#social-proof" className="hover:text-black transition-all">Wall of Love</a>
                <a href="#faq" className="hover:text-black transition-all">FAQ</a>
                <Link to="/explore" className="hover:text-black transition-all">Explore</Link>
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
