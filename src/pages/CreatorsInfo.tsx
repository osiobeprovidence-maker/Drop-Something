import { motion } from "motion/react";
import { Coffee, Heart, MessageSquare, Zap, Users, ShieldCheck, Target, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreatorsInfo() {
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
            <Users size={14} className="text-black" />
            <span>Built for creators, communities, and builders.</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-4xl font-black tracking-tight text-black sm:text-6xl"
          >
            Creators
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/60 sm:text-xl"
          >
            DropSomething is designed for people who create value online and want a simple way for their audience to support them.
          </motion.p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {[
            {
              title: "Content Creators",
              description: "Video creators, streamers, and influencers can receive support directly from their audience.",
              icon: <Zap className="text-black" />,
            },
            {
              title: "Developers & Builders",
              description: "Developers, open-source maintainers, and tech educators can receive appreciation for their work.",
              icon: <Zap className="text-black" />,
            },
            {
              title: "Writers & Designers",
              description: "Writers, designers, and educators can receive support from readers and followers.",
              icon: <Zap className="text-black" />,
            },
            {
              title: "Communities & Projects",
              description: "Podcasts, clubs, and online communities can collect support for projects, events, or goals.",
              icon: <Zap className="text-black" />,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2.5rem] bg-black/5 p-10 transition-all hover:bg-black hover:text-white group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black mb-8 group-hover:bg-white/20 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black">{item.title}</h3>
              <p className="mt-4 text-lg text-black/60 group-hover:text-white/60 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-7xl px-4 mt-32">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Your supporters belong to you", icon: <Users size={24} /> },
            { title: "Instant payments to your account", icon: <Zap size={24} /> },
            { title: "No complicated setup", icon: <ShieldCheck size={24} /> },
            { title: "Simple support links you can share anywhere", icon: <ArrowRight size={24} /> },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-black mb-6">
                {item.icon}
              </div>
              <h4 className="text-lg font-bold text-black leading-tight">{item.title}</h4>
            </div>
          ))}
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
