import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Share2, Copy, Check,
  Home, ShoppingBag, Target, Users,
  LayoutDashboard, LogOut, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useData } from "@/src/context/DataContext";

interface CreatorNavbarProps {
  username: string;
}

export const CreatorNavbar: React.FC<CreatorNavbarProps> = ({ username }) => {
  const { avatar, name, supporterCount, pageStyle, creator: profile } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isOwnPage = user?.username === username || !username;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharePage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} on DropSomething`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyLink();
    }
  };

  const tabs = [
    { id: "home", label: "Home", icon: Home, show: true },
    { id: "membership", label: "Membership", icon: Users, show: pageStyle === "hybrid" || pageStyle === "support" },
    { id: "shop", label: "Shop", icon: ShoppingBag, show: pageStyle === "hybrid" || pageStyle === "shop" },
    { id: "goals", label: "Goals", icon: Target, show: pageStyle === "hybrid" || pageStyle === "goal" },
  ].filter(tab => tab.show);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white/80 backdrop-blur-md py-2 border-black/5 shadow-sm" : "bg-white py-4 border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Left: Creator Info */}
          <div className="flex items-center gap-3">
            <img 
              src={avatar} 
              alt={name} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">{name}</h1>
              {supporterCount !== undefined && (
                <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
                  {supporterCount} Supporters
                </p>
              )}
            </div>
            <div className="sm:hidden">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">{name}</h1>
            </div>
          </div>

          {/* Center: Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-black/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isOwnPage ? (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <a
                href="/explore"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-black/10 text-black text-sm font-bold transition-all hover:bg-black/5"
              >
                <Search size={16} />
                Explore
              </a>
            )}
            <button 
              onClick={copyLink}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-black/5 text-gray-600 hover:bg-white hover:text-gray-900 transition-all active:scale-95"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              onClick={sharePage}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all active:scale-95"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-black/5 text-gray-600 active:scale-90 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-black/5">
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{name}</h2>
                    <p className="text-xs text-gray-500">@{username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button 
                    onClick={copyLink}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-black/5 text-gray-600 gap-2 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">Copy Link</span>
                  </button>
                  <button 
                    onClick={sharePage}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 gap-2 active:scale-95 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Share</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
                  {isOwnPage ? (
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  ) : (
                    <a
                      href="/explore"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <Search className="w-4 h-4" />
                      Explore
                    </a>
                  )}
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-black/5 bg-gray-50/50">
                <Link 
                  to="/" 
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="w-5 h-5 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-500">DS</span>
                  POWERED BY DROPSOMETHING
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
