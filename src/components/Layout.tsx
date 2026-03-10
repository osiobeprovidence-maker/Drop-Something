import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { LogIn, User, LayoutDashboard, ShieldCheck, LogOut, Sparkles, Menu, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signInWithGoogle, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: !!user },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, show: profile?.role === 'admin' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-ink">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-xl md:text-2xl font-display font-black tracking-tight text-primary">Drop Something</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* Search form for creators */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
              }}
              className="flex items-center gap-2 mr-2"
            >
              <input
                aria-label="Search creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators"
                className="hidden md:inline-block w-64 px-3 py-2 rounded-full border-2 border-ink bg-white text-sm font-black placeholder:font-black"
              />
              <button type="submit" className="px-3 py-2 rounded-full bg-white border-2 border-ink text-ink hidden md:inline-flex items-center">
                <Search size={16} />
              </button>
            </form>
            {navItems.filter(item => item.show).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-lg font-black transition-all hover:text-primary",
                  location.pathname === item.path ? "text-primary" : "text-ink"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Sign Up / Sign In actions */}
            {!user && (
              <Link to="/setup-profile" className="hidden md:inline-flex items-center px-4 py-2 border-2 border-ink rounded-2xl font-black text-ink hover:bg-cream">
                Create Account
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-6">
                <Link to={`/${profile?.username || 'setup'}`} className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white border-2 border-ink overflow-hidden shadow-[2px_2px_0_0_#111111]">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="m-1 md:m-1.5 text-stone-500" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs md:text-sm font-black uppercase tracking-wider">{user.displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-stone-400 hover:text-primary transition-colors"
                  title="Logout"
                >
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-secondary text-white rounded-2xl font-black text-base md:text-lg hover:scale-105 transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1"
              >
                <LogIn size={18} className="md:w-5 md:h-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger (only when signed in) */}
          <div className="md:hidden">
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Open menu"
                className="p-2 text-stone-600 hover:text-primary transition-colors"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={cn(
        "max-w-7xl mx-auto px-4",
        isHomePage ? "py-0" : "py-12"
      )}>
        {children}
      </main>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-white shadow-lg border-t-4 border-ink">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-lg font-black hover:text-primary text-ink">Dashboard</Link>
            <Link to={`/${profile?.username || 'setup'}`} onClick={() => setMobileOpen(false)} className="block text-lg font-black hover:text-primary text-ink">My Page</Link>
            <Link to="/edit-profile" onClick={() => setMobileOpen(false)} className="block text-lg font-black hover:text-primary text-ink">Edit Profile</Link>

            <div className="pt-2 border-t border-ink/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-ink overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="m-2 text-stone-500" />
                  )}
                </div>
                <div className="text-sm font-black uppercase tracking-wider text-ink">{user?.displayName}</div>
              </div>

              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="w-full text-left mt-3 px-2 py-2 font-black text-ink hover:text-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {!isHomePage && (
        <footer className="border-t-4 border-ink py-16 bg-white mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <h3 className="text-2xl font-display font-black text-primary">Drop Something 💸</h3>
            <p className="text-ink/60 font-black">
              Support the hustle. Drop something.
            </p>
            <p className="text-ink/40 text-sm font-black uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Drop Something. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
