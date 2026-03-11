import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { User, LayoutDashboard, ShieldCheck, LogOut, Menu, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

import { CoinLogo } from './CoinLogo';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-black">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <CoinLogo className="w-8 h-8" />
              <span className="text-lg font-bold tracking-tight text-gray-900">DropSomething</span>
            </Link>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            }}
            className="hidden lg:flex items-center flex-1 justify-center max-w-sm px-8"
          >
            <div className="w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
              <input
                aria-label="Search creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </form>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-6 font-semibold text-sm text-gray-600">
              <a href="#" className="hover:text-black transition-colors">FAQ</a>
              <a href="#" className="hover:text-black transition-colors">Resources</a>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden sm:block text-sm font-bold text-gray-700 hover:text-black transition-colors">
                  Dashboard
                </Link>
                <Link to={`/${profile?.username || 'setup'}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="m-2 text-gray-400" />
                    )}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-bold text-sm text-gray-600 hover:text-black transition-colors">Log in</Link>
                <Link
                  to="/setup-profile"
                  className="px-5 py-2 bg-accent text-black font-bold text-sm rounded-full shadow-sm hover:shadow-md hover:bg-accent/90 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-black"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>


      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white pt-20">
          <div className="p-6 flex flex-col gap-6">
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-primary">Dashboard</Link>
            <Link to="/explore" onClick={() => setMobileOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-primary">Explore</Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-primary">FAQ</Link>
            <Link to="/resources" onClick={() => setMobileOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-primary">Resources</Link>
            {user && (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-4xl font-black uppercase tracking-tighter text-red-500 text-left"
              >
                Logout
              </button>
            )}
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