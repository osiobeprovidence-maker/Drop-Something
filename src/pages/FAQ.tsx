import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is DropSomething?",
    answer: "DropSomething is a creator support platform that helps creators share one page where supporters can send tips, payments, and messages.",
  },
  {
    question: "How do I receive support?",
    answer: "Once you create your page, you get a shareable DropSomething link that supporters can use to open your page and send support.",
  },
  {
    question: "What are the fees?",
    answer: "DropSomething is free to start. Final fee and payout terms should be reviewed on your published pricing or policy pages before launch.",
  },
  {
    question: "How do I get paid?",
    answer: "Payments are processed through Paystack in the current implementation, and payout details should follow the payment and creator setup you configure on the platform.",
  },
  {
    question: "Can I use DropSomething for my community?",
    answer: "Absolutely! DropSomething is perfect for podcasts, clubs, open-source projects, and any community that wants a simple way to collect support.",
  },
  {
    question: "Is it secure?",
    answer: "DropSomething uses a third-party payment provider for checkout, and the site now surfaces contact, policy, and payment trust information more clearly for users before payment.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tight text-black sm:text-6xl"
          >
            FAQ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg leading-relaxed text-black/60 sm:text-xl"
          >
            Everything you need to know about DropSomething.
          </motion.p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[2rem] border border-black/5 bg-black/5 transition-all hover:border-black/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-8 text-left"
              >
                <span className="text-xl font-bold text-black">{faq.question}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-sm">
                  {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-lg leading-relaxed text-black/60">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="mx-auto max-w-3xl px-4 mt-24">
        <div className="rounded-[2.5rem] bg-black p-10 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white mx-auto mb-6">
            <MessageCircle size={32} />
          </div>
          <h2 className="text-2xl font-black">Still have questions?</h2>
          <p className="mt-4 text-lg text-white/60">
            We're here to help. Reach out to our support team and we'll get back to you as soon as possible.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
