import { motion } from "motion/react";
import { Coffee, Heart, MessageSquare, Zap, Users, ArrowRight, Check, ShieldCheck, Target, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

export default function HowItWorks() {
  const [tipAmount, setTipAmount] = useState<number | null>(1000);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold text-black/60"
          >
            <Zap size={14} className="text-black" />
            <span>Start receiving support in minutes.</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-4xl font-black tracking-tight text-black sm:text-6xl"
          >
            How it works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/60 sm:text-xl"
          >
            DropSomething makes it easy for creators and communities to receive support from their audience. Create your page, share your link, and let supporters drop something.
          </motion.p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-24 lg:grid-cols-2 lg:items-center">
          <div className="space-y-20">
            {[
              {
                step: "01",
                title: "Create Your Page",
                description: "Set up your personal DropSomething page with your name, bio, and profile picture.",
                subtext: "Your page becomes your personal support hub.",
                icon: <Users className="text-black" />,
              },
              {
                step: "02",
                title: "Share Your Link",
                description: "Add your DropSomething link to your social media bio, posts, videos, or messages.",
                subtext: "Anywhere your audience follows you.",
                icon: <Zap className="text-black" />,
              },
              {
                step: "03",
                title: "Receive Support",
                description: "Your fans can drop small tips, leave messages, join memberships, or help you reach your goals.",
                subtext: "Support arrives instantly.",
                icon: <Heart className="text-black" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative flex gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black/5 text-black">
                  {item.icon}
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-black/20">{item.step}</span>
                  <h3 className="mt-1 text-2xl font-black text-black">{item.title}</h3>
                  <p className="mt-4 text-lg text-black/60 leading-relaxed">{item.description}</p>
                  <p className="mt-2 text-sm font-bold text-black/40 italic">{item.subtext}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-black/5 blur-2xl" />
            <div className="relative rounded-[2.5rem] bg-white p-8 shadow-2xl border border-black/5">
              <div className="text-center mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4">Supporters see this</p>
                <div className="h-20 w-20 mx-auto overflow-hidden rounded-full bg-black/5 mb-4">
                  <img src="https://picsum.photos/seed/creator/200" alt="" className="h-full w-full object-cover" />
                </div>
                <h4 className="text-xl font-black text-black">Alex Rivera</h4>
                <p className="text-sm text-black/60">Creating digital art & tutorials</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    H = ₦100 · K = ₦1,000
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTipAmount(amount)}
                        className={cn(
                          "flex h-12 items-center justify-center rounded-xl border-2 font-bold transition-all",
                          tipAmount === amount
                            ? "border-black bg-black text-white"
                            : "border-black/5 bg-zinc-50 text-black hover:border-black/20"
                        )}
                      >
                        {amount >= 1000 ? `${amount / 1000}K` : `${amount / 100}H`}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="flex h-14 w-full items-center justify-center rounded-full bg-black text-base font-black text-white shadow-lg shadow-black/10">
                  Drop ₦{tipAmount?.toLocaleString()}
                </button>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-black/5 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm">🔥</div>
                  <div>
                    <p className="text-xs font-bold text-black">John D. <span className="font-normal text-black/40">dropped</span> ₦1,000</p>
                    <p className="mt-1 text-xs text-black/60">Love your content! Keep it up! 🔥</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 mt-32">
        <div className="rounded-[3rem] bg-black p-12 text-center text-white sm:p-20">
          <h2 className="text-3xl font-black sm:text-5xl">Start receiving support from your audience.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Create your DropSomething page today and let your supporters drop something.
          </p>
          <Link
            to="/signup"
            className="mt-10 inline-flex h-16 items-center justify-center rounded-full bg-white px-12 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Create Your Page
          </Link>
        </div>
      </section>
    </div>
  );
}
