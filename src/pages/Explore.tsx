import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Users, Plus, Check, Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useFollow } from "@/src/context/FollowContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const CATEGORIES = ["All", "Content Creators", "Developers", "Writers", "Designers", "Communities"];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("explore");
  const navigate = useNavigate();
  const { isFollowing, follow, unfollow, isLoading: followLoading } = useFollow();

  // Fetch creators from Convex
  const convexCreators = useQuery(api.creators.listCreators);
  const seedMockData = useMutation(api.seed.seedMockData);
  const [isSeeding, setIsSeeding] = useState(false);

  const isLoading = convexCreators === undefined;

  const creatorsToDisplay = useMemo(() => {
    return convexCreators || [];
  }, [convexCreators]);

  const filteredCreators = useMemo(() => {
    let result = creatorsToDisplay;

    if (activeTab === "following") {
      // Filter to only show creators the user is following
      result = result.filter((creator) => isFollowing(creator._id));
    }

    return result.filter((creator) => {
      const matchesSearch =
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio.toLowerCase().includes(searchQuery.toLowerCase());

      // Category mapping - in production you'd store this in Convex
      const categoryMap: Record<string, string> = {
        alexrivera: "Designers",
        sarahdev: "Developers",
        writer_joe: "Writers",
        pod_hub: "Communities",
        maya_cooks: "Content Creators",
        tech_tips: "Content Creators",
      };
      const creatorCategory = categoryMap[creator.username] || "Content Creators";
      const matchesCategory = activeCategory === "All" || creatorCategory === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, activeTab, creatorsToDisplay, isFollowing]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedMockData();
      alert("Dummy data seeded to Convex successfully!");
    } catch (error) {
      console.error("Seed error:", error);
      alert("Failed to seed data. Make sure 'npx convex dev' is running.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFollowToggle = (e: React.MouseEvent, creatorId: Id<"creators">) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowing(creatorId)) {
      unfollow(creatorId);
    } else {
      follow(creatorId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/20 border-t-black mx-auto mb-4" />
          <p className="text-black/60 font-medium">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 w-full">
      {/* Page Header */}
      <header className="border-b border-black/5 bg-white pt-12 sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl">Explore creators</h1>

            {/* Dev Seed Button - Only visible if Convex is empty */}
            {convexCreators && convexCreators.length === 0 && (
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <Database size={16} />
                {isSeeding ? "Seeding..." : "Seed Dummy Data"}
              </button>
            )}
          </div>

          <div className="mt-8 flex gap-8 border-b border-transparent overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("explore")}
              className={cn(
                "pb-4 text-base font-bold transition-all relative whitespace-nowrap",
                activeTab === "explore" ? "text-black" : "text-black/40 hover:text-black/60"
              )}
            >
              All creators
              {activeTab === "explore" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={cn(
                "pb-4 text-base font-bold transition-all relative whitespace-nowrap",
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
        {/* Search Bar & Filters */}
        <div className="sticky top-16 z-40 bg-white/80 py-6 backdrop-blur-md">
          <div className="relative">
            <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input
              type="text"
              placeholder="Search creators, bios, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border border-black/10 bg-black/5 pl-12 pr-4 text-base font-medium text-black focus:border-black/30 focus:outline-none transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="mt-6 flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all",
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

        {/* Content Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-black">
              {activeTab === "following" ? "Creators you follow" : "Trending creators this week"}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {filteredCreators.length > 0 ? (
              <motion.div
                key={`${activeTab}-results`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2"
              >
                {filteredCreators.map((creator) => (
                  <div
                    key={creator._id}
                    className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[2.5rem] border border-black/5 bg-white p-6 transition-all hover:shadow-xl hover:shadow-black/5"
                  >
                    <Link to={`/${creator.username}`} className="absolute inset-0 z-0 rounded-[2.5rem]" />

                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4 z-10">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/5 text-base font-black text-black/20">
                        #{creator.rank || 0}
                      </div>
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-black/5 shadow-sm">
                        <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <button
                        onClick={(e) => handleFollowToggle(e, creator._id)}
                        className={cn(
                          "sm:hidden flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95",
                          isFollowing(creator._id)
                            ? "bg-black text-white"
                            : "bg-black/5 text-black hover:bg-black/10"
                        )}
                      >
                        {isFollowing(creator._id) ? <Check size={18} /> : <Plus size={18} />}
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 z-10 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-lg font-black text-black group-hover:underline">{creator.name}</h3>
                        <button
                          onClick={(e) => handleFollowToggle(e, creator._id)}
                          className={cn(
                            "hidden sm:flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95",
                            isFollowing(creator._id)
                              ? "bg-black text-white"
                              : "bg-black/5 text-black hover:bg-black/10"
                          )}
                        >
                          {isFollowing(creator._id) ? (
                            <>
                              <Check size={14} />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="line-clamp-1 text-sm text-black/60 mb-3">{creator.bio}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-500">
                          <Heart size={14} fill="currentColor" />
                          <span>{creator.supporterCount.toLocaleString()} supporters</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <Users size={40} />
                </div>
                <h3 className="text-xl font-bold text-black">
                  {activeTab === "following" ? "You're not following anyone yet" : "No creators found"}
                </h3>
                <p className="mt-2 text-black/60 max-w-xs">
                  {activeTab === "following"
                    ? "Start exploring and follow creators you love to see them here."
                    : "Try adjusting your search or category filters to find what you're looking for."}
                </p>
                <button
                  onClick={() => {
                    if (activeTab === "following") setActiveTab("explore");
                    else { setSearchQuery(""); setActiveCategory("All"); }
                  }}
                  className="mt-6 font-bold text-black underline underline-offset-4"
                >
                  {activeTab === "following" ? "Explore creators" : "Clear all filters"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Call to Action */}
        <div className="mt-24 rounded-[3.5rem] bg-black p-8 sm:p-16 text-center text-white border border-white/10">
          <h2 className="text-3xl font-black sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">Start receiving support from your audience.</h2>
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">Create your DropSomething page today and let your supporters drop something to help you keep creating.</p>
          <Link
            to="/signup"
            className="mt-10 inline-flex h-16 items-center justify-center rounded-full bg-white px-12 text-lg font-black text-black transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
          >
            Create Your Page
          </Link>
        </div>
      </div>
    </div>
  );
}
