import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { User, LayoutDashboard, ShieldCheck, LogOut, Menu, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-black">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary border-4 border-black rounded-full flex items-center justify-center rotate-[-15deg] group-hover:rotate-0 transition-transform shadow-[3px_3px_0px_0px_#000]">
                <span className="text-xl font-black italic">D</span>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter">DropSomething</span>
            </Link>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            }}
            className="hidden lg:flex items-center flex-1 justify-center max-w-xl px-8"
          >
            <div className="w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" size={18} />
              <input
                aria-label="Search creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators..."
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border-4 border-black bg-white text-sm font-black placeholder:font-bold shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all outline-none"
              />
            </div>
          </form>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-8 font-black uppercase text-xs tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">FAQ</a>
              <a href="#" className="hover:text-primary transition-colors">Resources</a>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  Dashboard
                </Link>
                <Link to={`/${profile?.username || 'setup'}`} className="flex items-center gap-2 hover:scale-105 transition-transform group">
                  <div className="w-10 h-10 rounded-full bg-white border-4 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000] group-hover:rotate-6 transition-transform">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="m-2 text-black" />
                    )}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-black/40 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="font-black text-sm uppercase tracking-widest hover:text-primary transition-colors text-black">Log in</Link>
                <Link
                  to="/setup-profile"
                  className="px-6 py-2.5 bg-primary border-4 border-black font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-black"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 border-4 border-black bg-white shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
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