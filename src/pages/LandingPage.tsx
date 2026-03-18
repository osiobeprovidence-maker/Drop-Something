import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Coffee, Heart, MessageSquare, Zap, Users, ShieldCheck, ShoppingBag, Target, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

export default function LandingPage() {
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [recentSupporters, setRecentSupporters] = useState([
    { name: "John D.", amount: 1000, message: "Love your content! Keep it up! 🔥", emoji: "🔥" },
    { name: "Sarah W.", amount: 500, message: "Thanks for the tips!", emoji: "☕" },
    { name: "Mike R.", amount: 2000, message: "This helped me so much.", emoji: "🙌" },
  ]);

  const handleDropSomething = () => {
    if (!tipAmount) return;
    const newSupporter = {
      name: "You",
      amount: tipAmount,
      message: message || "Just dropped something!",
      emoji: "💖",
    };
    setRecentSupporters([newSupporter, ...recentSupporters.slice(0, 2)]);
    setMessage("");
    setTipAmount(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-medium text-black/60"
            >
              <Zap size={14} className="text-black" />
              <span>Support the hustle. Drop Something.</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 text-5xl font-extrabold tracking-tight text-black sm:text-7xl"
            >
              Support the hustle. <br />
              <span className="text-black/40">Drop Something.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-black/60 sm:text-xl"
            >
              A simple way to support creators and communities you love. Send small tips, leave messages, and help creators keep creating.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/signup"
                className="flex h-14 items-center justify-center rounded-full bg-black px-8 text-base font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              >
                Create Your Page
              </Link>
              <Link
                to="/explore"
                className="flex h-14 items-center justify-center rounded-full border border-black/10 bg-white px-8 text-base font-semibold text-black transition-colors hover:bg-black/5"
              >
                Explore Creators
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Support Preview */}
      <section className="bg-black/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                Experience the connection.
              </h2>
              <p className="mt-4 text-lg text-black/60">
                Supporters can send tips and messages in seconds. See it in action with this live preview.
              </p>
              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Instant Support</h3>
                    <p className="text-sm text-black/60">No complicated forms. Just a few taps and you're done.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Meaningful Messages</h3>
                    <p className="text-sm text-black/60">Add a personal note to show your appreciation.</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/5 sm:p-8 border"
            >
              <div className="flex items-center gap-4 border-b border-black/5 pb-6">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-black/5">
                  <img
                    src="https://picsum.photos/seed/creator/200"
                    alt="Creator"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Alex Rivera</h3>
                  <p className="text-sm text-black/60">Creating digital art & tutorials</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-black/40">Select amount</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[500, 1000, 2000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={cn(
                        "flex h-12 items-center justify-center rounded-xl border font-semibold transition-all",
                        tipAmount === amount
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black hover:border-black/30"
                      )}
                    >
                      ₦{amount}
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <textarea
                    placeholder="Say something nice..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-black/5 p-4 text-sm text-black focus:border-black/30 focus:outline-none"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleDropSomething}
                  disabled={!tipAmount}
                  className="mt-6 flex w-full h-14 items-center justify-center rounded-full bg-black text-base font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Drop Something
                </button>
              </div>

              <div className="mt-10">
                <p className="text-sm font-semibold uppercase tracking-wider text-black/40">Recent Supporters</p>
                <div className="mt-4 space-y-4">
                  {recentSupporters.map((supporter, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 rounded-2xl bg-black/5 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                        {supporter.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">
                          {supporter.name} <span className="font-normal text-black/40">dropped</span> ₦{supporter.amount}
                        </p>
                        <p className="mt-1 text-sm text-black/60">{supporter.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Simple as 1, 2, 3.</h2>
            <p className="mt-4 text-lg text-black/60">Everything you need to start receiving support in minutes.</p>
          </div>
          <div className="mt-20 grid gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your page",
                description: "Set up your profile, bio, and customize your support options in seconds.",
                icon: <Users className="text-black" />,
              },
              {
                step: "02",
                title: "Share your link",
                description: "Put your DropSomething link in your bio, posts, or anywhere your audience is.",
                icon: <Zap className="text-black" />,
              },
              {
                step: "03",
                title: "Receive support",
                description: "Get instant notifications when someone drops a tip or joins your membership.",
                icon: <Heart className="text-black" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 text-black">
                  {item.icon}
                </div>
                <h3 className="mt-8 text-xl font-bold text-black">{item.title}</h3>
                <p className="mt-4 text-black/60 leading-relaxed">{item.description}</p>
                <span className="absolute -top-4 -left-4 text-6xl font-black text-black/5">{item.step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for the modern creator.</h2>
              <p className="mt-4 text-lg text-white/60">
                More than just tips. A complete platform to grow your community and income.
              </p>
              <div className="mt-12 grid gap-8 sm:grid-cols-2">
                {[
                  { title: "Tips + Messages", icon: <MessageSquare size={20} />, desc: "Receive one-time support with personal notes." },
                  { title: "Memberships", icon: <Users size={20} />, desc: "Build recurring income with monthly tiers." },
                  { title: "Goals", icon: <Target size={20} />, desc: "Crowdfund specific projects with progress tracking." },
                  { title: "Shop", icon: <ShoppingBag size={20} />, desc: "Sell digital and physical products directly." },
                ].map((feature) => (
                  <div key={feature.title} className="rounded-2xl bg-white/5 p-6 border border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="mt-4 font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-white/60">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-white/10 to-transparent p-1">
                <div className="h-full w-full rounded-[calc(1.5rem-1px)] bg-black flex items-center justify-center overflow-hidden">
                   <img 
                    src="https://picsum.photos/seed/dashboard/800/800" 
                    alt="Dashboard Preview" 
                    className="opacity-50 grayscale"
                    referrerPolicy="no-referrer"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">For every kind of hustle.</h2>
            <p className="mt-4 text-lg text-black/60">Join thousands of creators who are already dropping things.</p>
          </div>
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {["Content Creators", "Developers", "Writers", "Designers", "Podcasters", "Musicians", "Non-profits", "Communities"].map((cat) => (
              <span key={cat} className="rounded-full bg-black/5 px-6 py-3 text-sm font-semibold text-black">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-black/5 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { title: "Your supporters belong to you", desc: "We don't hide your data. Export your supporter list anytime.", icon: <Users className="text-black" /> },
              { title: "Instant payments", desc: "Receive your funds directly to your bank account or wallet.", icon: <Zap className="text-black" /> },
              { title: "No complicated setup", desc: "Go live in under 2 minutes. No technical skills required.", icon: <ShieldCheck className="text-black" /> },
            ].map((trust) => (
              <div key={trust.title} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-sm border">
                  {trust.icon}
                </div>
                <h3 className="mt-6 font-bold text-black">{trust.title}</h3>
                <p className="mt-2 text-sm text-black/60">{trust.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-black sm:text-4xl">Frequently Asked Questions</h2>
          <div className="mt-16 space-y-4">
            {[
              { q: "Is DropSomething free to use?", a: "Yes! Creating a page is completely free. We only take a small platform fee on transactions to keep the lights on." },
              { q: "How do I get paid?", a: "We support instant payouts to local bank accounts and popular digital wallets." },
              { q: "Can I use it for my non-profit?", a: "Absolutely. Many communities and non-profits use DropSomething for fundraising and donations." },
              { q: "Do I need a website?", a: "Nope. Your DropSomething page is your website. Just share the link!" },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-black/5 bg-white p-6">
                <h3 className="font-bold text-black">{faq.q}</h3>
                <p className="mt-2 text-sm text-black/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-black px-8 py-20 text-center text-white sm:px-16 border">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Start receiving support today.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Join the community of creators who are building their future, one drop at a time.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/signup"
              className="flex h-16 w-full max-w-xs items-center justify-center rounded-full bg-white text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Create Your Page
            </Link>
            <p className="text-sm text-white/40">No credit card required. Setup in 2 minutes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
