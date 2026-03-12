import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Search, 
  Users, 
  ArrowRight, 
  MapPin, 
  Globe, 
  Twitter, 
  Instagram,
  Music,
  Star,
  Zap,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Users size={16} /> },
  { id: 'content', label: 'Content', icon: <Zap size={16} /> },
  { id: 'tech', label: 'Tech', icon: <Globe size={16} /> },
  { id: 'art', label: 'Art', icon: <Star size={16} /> },
  { id: 'music', label: 'Music', icon: <Music size={16} /> },
];

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const creators = useQuery(api.users.listUsers, { limit: 50 });

  const filteredCreators = creators?.filter(creator => {
    const matchesSearch = 
      creator.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For now, since we don't have category in DB, we'll just use search
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <span className="label-mini !mb-0 text-primary bg-primary/5 px-4 py-2 rounded-full mx-auto w-fit">Explore Community</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none">
              Discover amazing <br /> <span className="text-primary italic">creators.</span>
            </h1>
            <p className="text-2xl text-gray-500 font-bold max-w-3xl mx-auto leading-relaxed">
              Support the people building, creating, and sharing original work across the internet.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-3xl relative group"
          >
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Search className="text-gray-300 group-focus-within:text-primary transition-colors" size={28} />
            </div>
            <input
              type="text"
              placeholder="Search by name, username or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-24 pl-20 pr-10 bg-gray-50/50 border-2 border-transparent rounded-[2.5rem] text-2xl font-black shadow-inner focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-300"
            />
          </motion.div>

          {/* Category Chips */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm transition-all border-2",
                  activeCategory === cat.id 
                    ? 'bg-black text-white border-black shadow-2xl scale-105' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        {!creators ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-8">
            <div className="w-20 h-20 border-8 border-gray-50 border-t-primary rounded-full animate-spin" />
            <p className="label-mini">Finding Creators...</p>
          </div>
        ) : filteredCreators?.length === 0 ? (
          <div className="text-center py-40 space-y-10 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
            <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center mx-auto text-gray-200 shadow-xl">
              <Search size={64} />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">No creators found</h3>
              <p className="text-xl text-gray-400 font-bold italic leading-relaxed max-w-md mx-auto">Try searching for something else or explore all creators.</p>
            </div>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
              className="px-12 py-5 bg-black text-white rounded-full font-black text-lg hover:scale-105 transition-all shadow-2xl"
            >
              Show All Creators
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredCreators?.map((creator, i) => (
              <motion.div
                key={creator._id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/${creator.username}`} className="block group">
                  <div className="bg-white rounded-[4rem] p-10 border border-gray-50 shadow-2xl group-hover:-translate-y-3 transition-all duration-700 relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                      <div className="relative group-hover:scale-110 transition-transform duration-700">
                        <div className="w-32 h-32 rounded-[3.5rem] bg-gray-50 p-2 shadow-inner overflow-hidden border-2 border-white">
                          {creator.photoURL ? (
                            <img src={creator.photoURL} alt={creator.displayName} className="w-full h-full object-cover rounded-[2.8rem]" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-200">
                              {creator.displayName?.[0]}
                            </div>
                          )}
                        </div>
                        {creator.isVerified && (
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl shadow-2xl p-2 border-4 border-white">
                            <CheckCircle2 size={24} className="text-primary" fill="currentColor" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors tracking-tight">{creator.displayName}</h3>
                        <p className="text-sm font-black text-primary uppercase tracking-widest">@{creator.username}</p>
                      </div>

                      <p className="text-gray-500 font-bold leading-relaxed line-clamp-2 italic h-12 text-sm px-4">
                        "{creator.bio || 'Sharing my journey and creations with the world.'}"
                      </p>

                      <div className="w-full pt-8 border-t border-gray-50 flex items-center justify-between">
                         <div className="flex -space-x-3">
                          {[1, 2, 3].map(j => (
                            <div key={j} className="w-10 h-10 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center overflow-hidden grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                               <img src={`https://i.pravatar.cc/100?u=${creator.username}${j}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          <div className="w-10 h-10 rounded-full bg-gray-50 border-4 border-white flex items-center justify-center text-[10px] font-black text-gray-400">
                             +12
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-900 font-extrabold group-hover:text-primary transition-colors">
                          <span className="text-[10px] uppercase tracking-[0.2em]">View Page</span>
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Suggested for you / Trending section could go here */}
      <section className="py-40 bg-gray-900 text-white relative overflow-hidden mx-6 md:mx-12 my-24 rounded-[5rem]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -ml-32 -mb-32" />
        
        <div className="max-w-4xl mx-auto px-8 text-center space-y-12 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">
            "Every creator deserves to be <span className="text-primary italic">supported.</span>"
          </h2>
          <p className="text-2xl text-gray-400 font-bold max-w-3xl mx-auto italic leading-relaxed opacity-80">
            DropSomething is built for the community. Whether you're a developer, artist, or storyteller, there's a place for you here.
          </p>
          <div className="pt-8">
            <Link to="/onboarding" className="inline-flex items-center gap-4 bg-accent text-black px-16 py-6 rounded-full text-2xl font-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,221,0,0.3)]">
              Become a Creator
              <Zap size={28} fill="currentColor" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
