import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { User, LayoutDashboard, ShieldCheck, LogOut, Menu, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

import { CoinLogo } from './CoinLogo';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-black">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <CoinLogo className="w-9 h-9" />
              <span className="text-xl font-bold tracking-tight text-gray-900">DropSomething</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-8 font-bold text-sm text-gray-500">
              <Link to="/explore" className="hover:text-black transition-all">Explore</Link>
              <a href="/#how-it-works" className="hover:text-black transition-all">How it Works</a>
              <a href="/#creators" className="hover:text-black transition-all">Creators</a>
            </nav>

            <div className="h-6 w-[1px] bg-gray-100" />

            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-bold text-gray-900 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to={`/${profile?.username || 'setup'}`} className="flex items-center gap-2 group">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden group-hover:shadow-md transition-all">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="m-2.5 text-gray-400" />
                    )}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/login" className="font-bold text-sm text-gray-500 hover:text-black transition-colors">Sign In</Link>
                <Link
                  to="/setup-profile"
                  className="px-8 py-3.5 bg-accent text-black font-extrabold text-sm rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Create Page
                </Link>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-black"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>



      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white pt-24">
          <div className="p-10 flex flex-col gap-8">
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-colors">Explore</Link>
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-colors">How it Works</a>
            <a href="/#creators" onClick={() => setMobileOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-colors">Creators</a>
            
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-colors">Dashboard</Link>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-colors">Sign In</Link>
            )}

            <div className="pt-8">
              <Link
                to="/setup-profile"
                onClick={() => setMobileOpen(false)}
                className="w-full block text-center px-10 py-6 bg-accent text-black font-black text-2xl rounded-full shadow-xl"
              >
                Create Page
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className={cn(
        "w-full",
        !isHomePage && "max-w-7xl mx-auto px-4 py-12"
      )}>
        {children}
      </main>
    </div>
  );
}