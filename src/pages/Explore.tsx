import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, Users, Zap, MessageSquare, ArrowRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

// Mock data for creators
const MOCK_CREATORS = [
  {
    id: "1",
    username: "alexrivera",
    name: "Alex Rivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Creating digital art & tutorials for aspiring artists.",
    category: "Designers",
    supporters: 1240,
    rank: 1,
  },
  {
    id: "2",
    username: "sarahdev",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    bio: "Open source developer building tools for the web.",
    category: "Developers",
    supporters: 890,
    rank: 2,
  },
  {
    id: "3",
    username: "writer_joe",
    name: "Joe Penna",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joe",
    bio: "Weekly essays on philosophy, tech, and the future.",
    category: "Writers",
    supporters: 750,
    rank: 3,
  },
  {
    id: "4",
    username: "pod_hub",
    name: "PodHub Community",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pod",
    bio: "A community for independent podcasters to share resources.",
    category: "Communities",
    supporters: 2100,
    rank: 4,
  },
  {
    id: "5",
    username: "maya_cooks",
    name: "Maya's Kitchen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    bio: "Sharing traditional recipes with a modern twist.",
    category: "Content Creators",
    supporters: 560,
    rank: 5,
  },
  {
    id: "6",
    username: "tech_tips",
    name: "TechTips Daily",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
    bio: "Daily bite-sized tech news and productivity hacks.",
    category: "Content Creators",
    supporters: 1500,
    rank: 6,
  },
];

const CATEGORIES = ["All", "Content Creators", "Developers", "Writers", "Designers", "Communities"];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("explore");

  const filteredCreators = useMemo(() => {
    return MOCK_CREATORS.filter((creator) => {
      const matchesSearch = 
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === "All" || creator.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Page Header */}
      <header className="border-b border-black/5 bg-white pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-black sm:text-4xl">Explore creators</h1>
          
          <div className="mt-8 flex gap-8 border-b border-transparent">
            <button
              onClick={() => setActiveTab("explore")}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative",
                activeTab === "explore" ? "text-black" : "text-black/40 hover:text-black/60"
              )}
            >
              Explore creators
              {activeTab === "explore" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative",
                activeTab === "following" ? "text-black" : "text-black/40 hover:text-black/60"
              )}
            >
              Following
              {activeTab === "following" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="sticky top-16 z-40 -mx-4 bg-white/80 px-4 py-6 backdrop-blur-md sm:mx-0 sm:px-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input
              type="text"
              placeholder="Search 1,000,000+ creators"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border border-black/10 bg-black/5 pl-12 pr-4 text-base font-medium text-black focus:border-black/30 focus:outline-none transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-bold transition-all",
                  activeCategory === category
                    ? "bg-black text-white"
                    : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-black"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-black">Trending creators this week</h2>
          </div>

          <AnimatePresence mode="wait">
            {filteredCreators.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
              >
                {filteredCreators.map((creator) => (
                  <Link
                    key={creator.id}
                    to={`/${creator.username}`}
                    className="group flex items-center gap-4 rounded-[2rem] border border-black/5 bg-white p-6 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-black text-black/20">
                      #{creator.rank}
                    </div>
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-black/5 shadow-sm">
                      <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-lg font-black text-black group-hover:underline">{creator.name}</h3>
                      <p className="truncate text-sm text-black/60">{creator.bio}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-500">
                          <Heart size={14} fill="currentColor" />
                          <span>{creator.supporters.toLocaleString()} supporters</span>
                        </div>
                        <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black/40">
                          {creator.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-black/20 transition-transform group-hover:translate-x-1 group-hover:text-black" />
                  </Link>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/20 mb-6">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold text-black">No creators found</h3>
                <p className="mt-2 text-black/60">Try adjusting your search or category filters.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                  className="mt-6 font-bold text-black underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Call to Action */}
        <div className="mt-24 rounded-[3rem] bg-black p-12 text-center text-white">
          <h2 className="text-3xl font-black sm:text-4xl">Start receiving support from your audience.</h2>
          <p className="mt-4 text-white/60">Create your DropSomething page today and let your supporters drop something.</p>
          <Link
            to="/signup"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-base font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Create Your Page
          </Link>
        </div>
      </div>
    </div>
  );
}
