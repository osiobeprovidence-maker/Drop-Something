import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { CoinLogo } from '../components/CoinLogo';
import { 
  ArrowRight, 
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



      {/* 9. FAQ Section */}
      <section className="py-32 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-primary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">FAQ</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
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
                <Link to="/explore" className="hover:text-black transition-colors">Explore</Link>
                <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
                <Link to="/support" className="hover:text-black transition-colors">Support</Link>
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
