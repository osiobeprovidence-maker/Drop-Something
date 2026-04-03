import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  Heart,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { PaymentTrustNotice } from "@/src/components/marketing/PaymentTrustNotice";
import { StatsGrid } from "@/src/components/marketing/StatsGrid";
import { TestimonialsGrid } from "@/src/components/marketing/TestimonialsGrid";
import {
  HERO_SUBTEXT,
  PLATFORM_PAYMENT_PROVIDER,
  PLATFORM_STAT_SEEDS,
  TESTIMONIAL_SEEDS,
  TRUST_STRIP_ITEMS,
} from "@/src/content/siteContent";

export default function LandingPage() {
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [recentSupporters, setRecentSupporters] = useState([
    { name: "Preview supporter", amount: 1000, message: "Love your work. Keep going." },
    { name: "Preview supporter", amount: 500, message: "Simple, fast, and easy to use." },
    { name: "Preview supporter", amount: 2000, message: "Happy to support the next release." },
  ]);

  const handleDropSomething = () => {
    if (!tipAmount) return;

    setRecentSupporters((prev) => [
      {
        name: "You",
        amount: tipAmount,
        message: message || "Just dropped support.",
      },
      ...prev.slice(0, 2),
    ]);
    setTipAmount(null);
    setMessage("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFCFB]">
      <section className="relative overflow-hidden border-b border-black/5 bg-white px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm font-semibold text-black/68"
            >
              <BadgeCheck size={14} />
              Trusted creator support pages
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mt-6 text-5xl font-black tracking-tight text-black sm:text-6xl lg:text-7xl"
            >
              Support the hustle.
              <span className="block text-black/42">Drop Something.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-black/64 sm:text-xl"
            >
              {HERO_SUBTEXT}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/signup"
                className="inline-flex h-14 items-center justify-center rounded-full bg-black px-8 text-base font-bold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Create your page
              </Link>
              <Link
                to="/explore"
                className="inline-flex h-14 items-center justify-center rounded-full border border-black/10 bg-white px-8 text-base font-bold text-black"
              >
                Explore creators
              </Link>
            </motion.div>
            <div className="mt-8 flex flex-wrap gap-3">
              {TRUST_STRIP_ITEMS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/68"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-black/55">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} />
                Payments processed securely
              </span>
              <span className="inline-flex items-center gap-2">
                <Wallet size={16} />
                Powered by {PLATFORM_PAYMENT_PROVIDER}
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-[2.5rem] border border-black/10 bg-[#F6F5F2] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-7"
          >
            <div className="rounded-[2rem] border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between border-b border-black/5 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Support preview</p>
                  <h2 className="mt-2 text-2xl font-black text-black">Creator page checkout</h2>
                </div>
                <div className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  Preview
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-black/10 bg-black/[0.03] p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-black text-white" />
                  <div>
                    <p className="text-lg font-black text-black">Alex Rivera</p>
                    <p className="text-sm text-black/55">Digital artist and educator</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[500, 1000, 2000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTipAmount(amount)}
                      className={cn(
                        "h-12 rounded-xl border text-sm font-bold transition-colors",
                        tipAmount === amount
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black"
                      )}
                    >
                      NGN {amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Add a message with your support"
                  className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black focus:outline-none"
                />

                <button
                  onClick={handleDropSomething}
                  disabled={!tipAmount}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white disabled:opacity-50"
                >
                  Send support
                </button>

                <p className="mt-3 text-xs leading-relaxed text-black/48">
                  Preview only. Live creator pages use the secure platform payment flow.
                </p>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Recent supporter messages</p>
                <div className="mt-4 space-y-3">
                  {recentSupporters.map((supporter, index) => (
                    <div key={`${supporter.name}-${index}`} className="rounded-2xl border border-black/10 bg-white p-4">
                      <p className="text-sm font-bold text-black">
                        {supporter.name}
                        <span className="font-medium text-black/45"> sent NGN {supporter.amount.toLocaleString()}</span>
                      </p>
                      <p className="mt-1 text-sm text-black/62">{supporter.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PaymentTrustNotice />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">How it works</p>
            <h2 className="mt-3 text-3xl font-black text-black sm:text-4xl">A simple support flow creators can share in minutes.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your page",
                description: "Set up your creator page with your profile, message, and the support options you want to offer.",
              },
              {
                step: "02",
                title: "Share your link",
                description: "Put your DropSomething page in your bio, posts, videos, newsletters, and direct messages.",
              },
              {
                step: "03",
                title: "Receive tips",
                description: "Supporters can send small payments and encouraging messages without a complicated checkout flow.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-[2rem] border border-black/10 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">{item.step}</p>
                <h3 className="mt-3 text-xl font-black text-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Why users trust us</p>
            <h2 className="mt-3 text-3xl font-black text-black sm:text-4xl">Trust cues that reduce friction before a supporter pays.</h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {[
              {
                title: "Clear payment handling",
                description:
                  "We surface the payment provider and explain how checkout works so supporters know what to expect before they pay.",
                icon: LockKeyhole,
              },
              {
                title: "Visible support channels",
                description:
                  "Support links, contact details, and dispute guidance are easy to find across the site instead of hidden in the product.",
                icon: CircleHelp,
              },
              {
                title: "Published policy pages",
                description:
                  "Privacy, terms, and refund guidance are linked in the public footer so creators and supporters can review the basics up front.",
                icon: ShieldCheck,
              },
              {
                title: "Platform responsibility",
                description:
                  "DropSomething presents itself clearly as the platform layer that helps creators receive support and helps users reach support when issues arise.",
                icon: MessageSquare,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-black/10 bg-[#F7F6F3] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                  <item.icon size={18} />
                </div>
                <h3 className="mt-5 text-xl font-black text-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/60">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-black/10 bg-black p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/78">
                HTTPS / security badge area
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/78">
                Launch checklist
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72">
              Verify that your live domain keeps HTTPS enabled, your support inbox is active, and your policy pages are approved before launch. These checks help reinforce platform legitimacy for creators and supporters.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Platform stats</p>
            <h2 className="mt-3 text-3xl font-black text-black sm:text-4xl">Reusable stats blocks are ready for verified numbers.</h2>
          </div>
          <StatsGrid items={PLATFORM_STAT_SEEDS} />
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/35">Social proof</p>
            <h2 className="mt-3 text-3xl font-black text-black sm:text-4xl">Reusable testimonial cards are in place for approved customer proof.</h2>
          </div>
          <TestimonialsGrid items={TESTIMONIAL_SEEDS} />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl rounded-[2.75rem] bg-black px-8 py-14 text-white sm:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Final CTA</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Give creators one trusted link for audience support.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/68">
            Create your page, share it anywhere, and let supporters send small payments through a clearer, more trustworthy flow.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-black"
            >
              Create your page
            </Link>
            <Link
              to="/about"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-8 text-base font-bold text-white"
            >
              Learn more about the platform
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
