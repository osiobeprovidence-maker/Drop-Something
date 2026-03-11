import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  ArrowRight, 
  MapPin, 
  Globe, 
  Twitter, 
  Instagram,
  Heart,
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
  { id: 'music', label: 'Music', icon: <Heart size={16} /> },
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
      <section className="pt-20 pb-16 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="text-primary font-black tracking-widest text-xs uppercase underline decoration-accent decoration-4 underline-offset-4">Explore</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none">
              Discover amazing <br /> <span className="text-primary">creators.</span>
            </h1>
            <p className="text-xl text-gray-500 font-bold max-w-2xl leading-relaxed">
              Support the people building, creating, and sharing original work across the internet.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-2xl relative group"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-primary transition-colors" size={24} />
            </div>
            <input
              type="text"
              placeholder="Search by name, username or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-20 pl-16 pr-8 bg-white border-2 border-gray-100 rounded-full text-lg font-bold shadow-lg focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-300"
            />
          </motion.div>

          {/* Category Chips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-black text-white shadow-xl scale-105' 
                    : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {!creators ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Finding Creators...</p>
          </div>
        ) : filteredCreators?.length === 0 ? (
          <div className="text-center py-40 space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-300">
              <Search size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900">No creators found</h3>
              <p className="text-gray-400 font-bold italic leading-relaxed">Try searching for something else or explore all creators.</p>
            </div>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
              className="px-8 py-4 bg-gray-900 text-white rounded-full font-black text-sm hover:bg-black transition-all"
            >
              Show All Creators
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCreators?.map((creator, i) => (
              <motion.div
                key={creator._id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/${creator.username}`} className="block group">
                  <div className="bg-white rounded-[3rem] p-8 border-2 border-gray-50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] group-hover:-translate-y-2 group-hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
                    
                    <div className="flex items-start gap-6 mb-8 relative z-10">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-[2rem] bg-gray-100 p-1 shadow-inner overflow-hidden">
                          {creator.photoURL ? (
                            <img src={creator.photoURL} alt={creator.displayName} className="w-full h-full object-cover rounded-[1.8rem] group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-300">
                              {creator.displayName?.[0]}
                            </div>
                          )}
                        </div>
                        {creator.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-primary" fill="currentColor" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors leading-none">{creator.displayName}</h3>
                        <p className="text-sm font-bold text-gray-400">@{creator.username}</p>
                        <div className="flex gap-1 pt-1">
                          <span className="px-2 py-0.5 bg-gray-50 rounded-md text-[8px] font-black uppercase text-gray-400">Creator</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                      <p className="text-sm font-bold text-gray-500 leading-relaxed line-clamp-2 italic h-10">
                        "{creator.bio || 'Sharing my journey and creations with the world.'}"
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(j => (
                            <div key={j} className="w-7 h-7 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center overflow-hidden">
                               <img src={`https://i.pravatar.cc/100?u=${creator.username}${j}`} alt="" className="w-full h-full object-cover opacity-50" />
                            </div>
                          ))}
                          <div className="w-7 h-7 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">
                            +12
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                          <span className="text-xs font-black uppercase tracking-wider">View Page</span>
                          <ArrowRight size={14} />
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
      <section className="py-32 bg-black text-white relative overflow-hidden mx-6 md:mx-10 my-20 rounded-[4rem]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
            "Every creator deserves to be <span className="text-primary italic">supported.</span>"
          </h2>
          <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto italic leading-relaxed">
            DropSomething is built for the community. Whether you're a developer, artist, or storyteller, there's a place for you here.
          </p>
          <div className="pt-6">
            <Link to="/setup-profile" className="inline-flex items-center gap-3 bg-accent text-black px-12 py-5 rounded-full text-xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl">
              Become a Creator
              <zap size={20} fill="currentColor" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
