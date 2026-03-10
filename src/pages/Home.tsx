import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  ArrowRight, 
  Search, 
  CreditCard, 
  ShieldCheck, 
  Users, 
  Youtube, 
  Music, 
  Palette, 
  Code, 
  PenTool, 
  Gamepad2, 
  GraduationCap, 
  Smile,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

export function Home() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to the dashboard when they visit the landing page
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const creatorTypes = [
    { name: "Content Creators", icon: Youtube },
    { name: "YouTubers", icon: Youtube },
    { name: "TikTok Creators", icon: Music },
    { name: "Designers", icon: Palette },
    { name: "Developers", icon: Code },
    { name: "Writers", icon: PenTool },
    { name: "Gamers", icon: Gamepad2 },
    { name: "Artists", icon: Palette },
    { name: "Educators", icon: GraduationCap },
    { name: "Online Personalities", icon: Smile },
  ];

  return (
    <div className="space-y-20 md:space-y-32 pb-20 overflow-x-hidden bg-white">
      {/* Final CTA Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-primary py-16 md:py-20 px-6 md:px-12 rounded-[3rem] md:rounded-[5rem] text-center space-y-8 md:space-y-12 text-white relative overflow-visible border-8 border-ink shadow-[20px_20px_0_0_#111111]">
          <h2 className="font-display font-extrabold leading-[1.05] text-center">
            <span className="block text-[36px] md:text-[56px] lg:text-[72px]">Support the Hustle.</span>
            <span className="block text-[36px] md:text-[56px] lg:text-[72px] mt-2">Drop something.</span>
          </h2>
          <p className="text-[16px] md:text-[20px] text-white/90 font-black max-w-3xl mx-auto">
            If someone's content has helped you, entertained you, or inspired you, show appreciation. Every drop matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-3 bg-white text-ink rounded-2xl font-semibold text-base md:text-lg hover:scale-105 transition-all shadow-[0_8px_0_0_#111111] active:shadow-none active:translate-y-1"
            >
              Start Supporting
            </Link>
            <button
              onClick={signInWithGoogle}
              className="w-full sm:w-auto px-6 py-3 bg-ink text-white rounded-2xl font-semibold text-base md:text-lg hover:scale-105 transition-all shadow-[0_8px_0_0_#FF7A00] active:shadow-none active:translate-y-1"
            >
              Create Your Page
            </button>
          </div>
        </div>
      </section>
            If a creator makes you laugh, teaches you something new, or inspires you, you can drop something to show appreciation.
            Every drop helps creators keep creating.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-primary text-white rounded-2xl font-black text-lg md:text-2xl hover:scale-105 transition-all shadow-[0_8px_0_0_#111111] active:shadow-none active:translate-y-1 flex items-center justify-center gap-3"
            >
              Drop Something
              <ArrowRight size={24} className="md:w-7 md:h-7" />
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-white text-ink border-4 border-ink rounded-2xl font-black text-lg md:text-2xl hover:bg-cream transition-all shadow-[0_8px_0_0_#111111] active:shadow-none active:translate-y-1"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-secondary text-white rounded-2xl font-black text-lg md:text-2xl hover:scale-105 transition-all shadow-[0_8px_0_0_#111111] active:shadow-none active:translate-y-1"
              >
                Become a Creator
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 space-y-12 md:space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-7xl font-display font-black text-ink">How It Works</h2>
          <p className="text-lg md:text-xl text-ink/50 font-black">Supporting creators is simple.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              step: "01",
              icon: Search,
              title: "Discover Creators",
              description: "Find creators sharing content, ideas, and inspiration online.",
              color: "bg-ink text-white"
            },
            {
              step: "02",
              icon: Heart,
              title: "Drop Something",
              description: "Send a small tip in seconds. Choose an amount or enter your own.",
              color: "bg-primary text-white"
            },
            {
              step: "03",
              icon: Sparkles,
              title: "Support the Hustle",
              description: "Your support helps creators continue doing what they love.",
              color: "bg-white text-ink border-4 border-ink"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 md:p-12 bg-white rounded-[2.5rem] md:rounded-[3rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] space-y-6"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-ink text-white rounded-xl flex items-center justify-center font-display font-black text-xl">
                {item.step}
              </div>
              <div className={cn("w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2 border-ink shadow-[2px_2px_0_0_#111111]", item.color)}>
                <item.icon size={28} fill="currentColor" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-ink">{item.title}</h3>
              <p className="text-ink/60 font-black text-base md:text-lg leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For Creators Section */}
      <section className="bg-ink p-8 md:p-24 rounded-[3rem] md:rounded-[4rem] text-white overflow-hidden relative mx-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-8xl font-display font-black leading-tight">Built for Creators.</h2>
            <p className="text-lg md:text-2xl text-white/80 font-black leading-relaxed">
              Create your own page where supporters can send tips anytime. Share your link anywhere online and start receiving support.
            </p>
            
            <div className="space-y-4">
              <p className="text-xl font-black text-secondary uppercase tracking-widest">Your page includes:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Profile picture",
                  "Creator bio",
                  "Social links",
                  "Tip button",
                  "Suggested amounts",
                  "Supporter messages"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90 font-black text-base md:text-lg">
                    <CheckCircle2 size={20} className="text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20">
                <p className="text-sm text-white/60 font-black uppercase tracking-widest mb-2">Example creator page:</p>
                <p className="text-xl md:text-2xl font-black flex items-center gap-3">
                  <ExternalLink size={20} />
                  dropsomething.ng/username
                </p>
              </div>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-primary text-white rounded-2xl font-black text-lg md:text-2xl hover:scale-105 transition-all shadow-[0_8px_0_0_#FFF7F2] active:shadow-none active:translate-y-1"
            >
              Create Your Page
            </button>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 blur-3xl rounded-full" />
            <motion.div
              initial={{ rotate: 5, y: 50 }}
              whileInView={{ rotate: 0, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-4 md:border-8 border-ink shadow-2xl space-y-6 md:space-y-8 text-ink"
            >
              <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-secondary rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 border-ink shadow-xl" />
                <div className="space-y-1 md:space-y-2">
                  <h4 className="text-2xl md:text-4xl font-black">Riderezzy</h4>
                  <p className="text-ink/50 font-black text-base md:text-xl">Builder & creator</p>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[500, 1000, 5000].map(v => (
                    <div key={v} className="py-3 md:py-4 bg-cream border-2 md:border-4 border-ink/10 rounded-xl md:rounded-2xl text-center font-black text-ink/20 text-sm md:text-lg">
                      ₦{v}
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 md:py-5 bg-ink text-white rounded-2xl md:rounded-3xl font-black text-lg md:text-2xl shadow-[0_6px_0_0_#FF7A00]">
                  Drop Something 💸
                </button>
              </div>
              <div className="p-4 md:p-6 bg-cream rounded-2xl md:rounded-3xl border-2 md:border-4 border-ink/10 italic text-sm md:text-lg font-black text-ink/50">
                "Tunde just dropped ₦1,000 for Riderezzy 💸"
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
        <div className="order-2 md:order-1">
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: "Debit Cards", icon: CreditCard },
                { name: "Bank Transfer", icon: Users },
                { name: "USSD", icon: Smartphone },
                { name: "Mobile Money", icon: Sparkles }
              ].map((method, i) => (
                <div key={i} className="p-10 bg-white rounded-[3rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] flex flex-col items-center gap-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 text-secondary border-2 border-ink rounded-2xl flex items-center justify-center">
                    <method.icon size={32} />
                  </div>
                  <span className="text-xl font-black text-ink">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-10 order-1 md:order-2">
          <h2 className="text-5xl md:text-8xl font-display font-black text-ink">Secure Payments.</h2>
          <p className="text-xl md:text-2xl text-ink/60 font-black leading-relaxed">
            Payments are processed securely through <span className="font-black text-secondary underline decoration-4 underline-offset-8">Paystack</span>. 
            Supporters can pay using their preferred methods, and creators get paid directly to their bank accounts.
          </p>
          <div className="flex items-center gap-6 p-8 bg-cream rounded-[2.5rem] border-4 border-ink">
            <div className="w-16 h-16 bg-white text-ink border-4 border-ink rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-xl font-black text-ink">Bank-grade Security</p>
              <p className="text-ink/50 font-black">Your financial data is never stored on our servers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Safety Section */}
      <section className="max-w-5xl mx-auto px-6 text-center space-y-12">
        <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-ink text-white font-black border-4 border-ink">
          <ShieldCheck size={24} fill="currentColor" />
          <span className="uppercase tracking-widest text-lg">Trust & Safety</span>
        </div>
        <h2 className="text-4xl md:text-8xl font-display font-black text-ink">Built on Transparency.</h2>
        <p className="text-xl md:text-3xl text-ink/60 font-black leading-relaxed">
          We use identity verification (KYC) to ensure security and transparency. 
          Creators must verify their identity before withdrawing earnings. 
          This helps build trust between creators and supporters.
        </p>
      </section>

      {/* Secret Weapon Section */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-accent/10 text-accent font-black border-2 border-accent/20">
            <span className="uppercase tracking-widest text-xs">The Secret Weapon</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-display font-black text-ink leading-tight">Public Supporter Messages.</h2>
          <p className="text-lg md:text-xl text-ink/60 font-black leading-relaxed">
            The feature that made platforms grow fast. When someone sends money, their message appears publicly on the creator’s page.
          </p>
          
          <div className="grid gap-4">
            {[
              { name: "Amaka", amount: "2,000", message: "Your videos helped me learn design. Thank you!" },
              { name: "Tunde", amount: "1,000", message: "Keep building bro 🔥" },
              { name: "Sadiq", amount: "500", message: "This tutorial saved me!" }
            ].map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white border-4 border-ink rounded-2xl shadow-[8px_8px_0_0_#111111]"
              >
                <p className="font-black text-ink">{msg.name} dropped ₦{msg.amount}</p>
                <p className="text-ink/50 font-black italic">"{msg.message}"</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-cream p-12 rounded-[3rem] border-4 border-ink space-y-8">
          <h3 className="text-2xl md:text-3xl font-black text-ink">Why this works:</h3>
          <div className="space-y-6">
            {[
              { title: "Social proof", desc: "People see others supporting." },
              { title: "Emotional reward", desc: "Supporters feel recognized." },
              { title: "Community feeling", desc: "It becomes a conversation, not just a payment." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 bg-secondary text-white rounded-lg flex items-center justify-center font-black flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-black text-xl text-ink">{item.title}</p>
                  <p className="text-ink/50 font-black">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="pt-6 border-t-2 border-ink/10 font-black text-ink/40 uppercase tracking-widest text-sm">
            This tiny feature turned tipping into a public celebration of creators.
          </p>
        </div>
      </section>

      {/* For Every Hustle Section */}
      <section className="max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-8xl font-display font-black text-ink">For Every Hustle.</h2>
          <p className="text-lg md:text-2xl text-ink/50 font-black max-w-3xl mx-auto leading-relaxed">
            Anyone creating value online can receive support. If you’re building something online, your audience can support you.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {creatorTypes.map((type, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-4 md:px-10 md:py-6 bg-white rounded-2xl md:rounded-[2rem] border-4 border-ink shadow-[6px_6px_0_0_#111111] flex items-center gap-3 md:gap-4 font-black text-lg md:text-2xl text-ink cursor-default"
            >
              <type.icon size={24} className="text-secondary" />
              {type.name}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-primary p-12 md:p-24 rounded-[3rem] md:rounded-[5rem] text-center space-y-12 text-white relative overflow-hidden border-8 border-ink shadow-[20px_20px_0_0_#111111]">
          <h2 className="font-display font-black leading-tight text-center">
            <span className="block text-[clamp(1.75rem,5.5vw,4.5rem)] sm:text-[clamp(2.25rem,5.8vw,5.5rem)] md:text-[clamp(3rem,6.5vw,7rem)] lg:text-[clamp(3.5rem,7.5vw,8rem)]">Support the Hustle.</span>
            <span className="block text-[clamp(1.75rem,5vw,4.25rem)] sm:text-[clamp(2.25rem,5.5vw,5.25rem)] md:text-[clamp(3rem,6.25vw,6.75rem)] lg:text-[clamp(3.5rem,7vw,7.75rem)] mt-2">Drop something.</span>
          </h2>
          <p className="text-xl md:text-3xl text-white/90 font-black max-w-3xl mx-auto">
            If someone's content has helped you, entertained you, or inspired you, show appreciation. Every drop matters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-white text-ink rounded-2xl font-black text-lg md:text-2xl hover:scale-105 transition-all shadow-[0_8px_0_0_#111111] active:shadow-none active:translate-y-1"
            >
              Start Supporting
            </Link>
            <button
              onClick={signInWithGoogle}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 md:px-12 md:py-6 bg-ink text-white rounded-2xl font-black text-lg md:text-2xl hover:scale-105 transition-all shadow-[0_8px_0_0_#FF7A00] active:shadow-none active:translate-y-1"
            >
              Create Your Page
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 border-t-8 border-ink">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 pb-12 md:pb-16">
          <div className="space-y-8">
            <h3 className="text-5xl font-display font-black text-primary">Drop Something</h3>
            <p className="text-2xl text-ink/50 font-black">Support the hustle. Drop something.</p>
            <div className="flex items-center gap-4">
              <a href="mailto:support@dropsomething.ng" className="text-secondary text-xl font-black hover:underline decoration-4 underline-offset-8">
                support@dropsomething.ng
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="font-black text-ink uppercase tracking-widest text-lg">Platform</h4>
              <ul className="space-y-4 font-black text-xl text-ink/50">
                <li><Link to="/explore" className="hover:text-secondary">Explore</Link></li>
                <li><button onClick={signInWithGoogle} className="hover:text-secondary">Join as Creator</button></li>
                <li><Link to="/about" className="hover:text-secondary">About Us</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-ink uppercase tracking-widest text-lg">Legal</h4>
              <ul className="space-y-4 font-black text-xl text-ink/50">
                <li><Link to="/privacy" className="hover:text-secondary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-secondary">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-secondary">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="py-12 border-t-4 border-ink/5 text-center text-ink/20 font-black text-lg">
          © {new Date().getFullYear()} Drop Something. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
