import { Link, useNavigate } from "react-router-dom";
import { Coffee, Menu, X, Search, Info, Users, HelpCircle, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useScrollLock } from "@/src/hooks/useScrollLock";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const PlatformNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [showAdminButton, setShowAdminButton] = useState(false);

  // Lock body scroll when mobile menu is open
  useScrollLock(isOpen);

  // Check admin role from database
  const currentUser = useQuery(api.users.currentUser);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const isAdmin = currentUser.role === "admin" || currentUser.email?.toLowerCase() === "riderezzy@gmail.com";
      setShowAdminButton(isAdmin);
      return;
    }

    setShowAdminButton(false);
  }, [currentUser]);

  const navLinks = [
    { name: "Home", href: "/", icon: Coffee },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "How it Works", href: "/how-it-works", icon: Info },
    { name: "Creators", href: "/creators", icon: Users },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300",
      isScrolled
        ? "bg-white border-black/5 shadow-sm py-0"
        : "bg-white border-transparent py-1"
    )}>
      <div className="mx-auto flex h-16 max-w-7xl w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-black">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Coffee size={18} />
            </div>
            DropSomething
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-black/60 transition-colors hover:text-black"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-4">
            {/* Admin Button - Only for super admin */}
            {showAdminButton && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white border border-red-600 transition-all hover:bg-red-600 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
                title="Admin Panel"
              >
                <Shield size={14} />
                Admin
              </Link>
            )}
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-black/60 transition-colors hover:text-black"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-black/60 transition-all hover:bg-black/5 hover:text-black active:scale-90"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              ref={menuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-xs bg-white p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-black flex items-center justify-center text-white">
                      <Coffee size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">DropSomething</p>
                      <p className="text-xs text-black/40">Platform</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-black/60 hover:bg-black/5"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="space-y-1">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Navigation</p>
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-black hover:bg-black/5"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon size={20} className="text-black/40" />
                        {link.name}
                      </Link>
                    ))}
                    {/* Admin Link - Only for super admin */}
                    {showAdminButton && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-bold text-white bg-red-500 hover:bg-red-600"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield size={20} className="text-white" />
                        Admin Panel
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-black/5">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="flex h-12 items-center justify-center rounded-xl bg-black text-base font-semibold text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/login"
                        className="flex h-12 items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold text-black"
                        onClick={() => setIsOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/signup"
                        className="flex h-12 items-center justify-center rounded-xl bg-black text-base font-semibold text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
