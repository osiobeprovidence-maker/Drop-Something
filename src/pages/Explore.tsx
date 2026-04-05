import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Bell,
  Compass,
  ExternalLink,
  FileText,
  Heart,
  Home,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Music,
  Plus,
  Search,
  Send,
  Sparkles,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { cn } from "@/src/lib/utils";
import { useFollow } from "@/src/context/FollowContext";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useScrollLock } from "@/src/hooks/useScrollLock";
import { buildCreatorPath } from "@/src/lib/creatorRoutes";

interface SlatePost {
  _id: Id<"slates">;
  type: "text" | "image" | "video" | "audio";
  content?: string;
  mediaUrl?: string;
  playbackId?: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  creatorId: Id<"creators">;
  likeCount: number;
  commentCount: number;
  likedByViewer?: boolean;
  _creationTime: number;
}

interface CreatorSummary {
  _id: Id<"creators">;
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  supporterCount?: number;
  totalRevenue?: number;
}

const formatCount = (count: number | undefined | null): number => Number(count) || 0;

const getDisplayName = (name?: string | null, username?: string | null): string => {
  const normalizedName = name?.trim();
  const lowered = normalizedName?.toLowerCase();
  if (normalizedName && lowered !== "anonymous" && lowered !== "unknown" && lowered !== "unnamed creator") {
    return normalizedName;
  }
  return username || "Anonymous";
};

const formatCurrency = (amount: number | undefined | null) => {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

const getComposerPrompt = (activeTab: "explore" | "following" | "creators") => {
  if (activeTab === "following") return "Share an update with the creators and supporters in your circle";
  if (activeTab === "creators") return "Introduce your creator page, current drop, or next release";
  return "Share a slate update, behind-the-scenes note, or a new drop";
};

export default function Explore() {
  const [activeTab, setActiveTab] = useState<"explore" | "following" | "creators">("explore");
  const [selectedPost, setSelectedPost] = useState<SlatePost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [composerText, setComposerText] = useState("");

  useScrollLock(!!selectedPost);

  const { user, convexUserId, isLoading: isAuthLoading } = useAuth();
  const { following, follow, unfollow, isFollowing, isLoading: isFollowLoading } = useFollow();
  const toggleLike = useMutation(api.slates.toggleLike);
  const addComment = useMutation(api.slates.addComment);

  const allSlates = useQuery(api.slates.getAllPublicSlates, {
    userId: convexUserId ? (convexUserId as Id<"users">) : undefined,
  });
  const followingSlatesResult = useQuery(
    api.slates.getFollowingSlates,
    convexUserId ? { userId: convexUserId as Id<"users">, limit: 50 } : "skip"
  );
  const [explorePosts, setExplorePosts] = useState<SlatePost[]>([]);
  const [followingPosts, setFollowingPosts] = useState<SlatePost[]>([]);

  const comments = useQuery(
    api.slates.getComments,
    selectedPost ? { slateId: selectedPost._id } : "skip"
  );
  const creators = useQuery(api.creators.listCreators);

  useEffect(() => {
    if (allSlates) {
      setExplorePosts(allSlates);
    }
  }, [allSlates]);

  useEffect(() => {
    if (followingSlatesResult?.items) {
      setFollowingPosts(followingSlatesResult.items);
      return;
    }

    if (!convexUserId) {
      setFollowingPosts([]);
    }
  }, [followingSlatesResult, convexUserId]);

  const handleLike = async (slateId: Id<"slates">) => {
    if (!convexUserId) return;
    try {
      const result = await toggleLike({
        slateId,
        userId: convexUserId as Id<"users">,
      });

      const updatePostLikes = (postList: SlatePost[]) =>
        postList.map((post) => {
          if (post._id !== slateId) return post;

          const newLikeCount = result.liked
            ? post.likeCount + 1
            : Math.max(0, post.likeCount - 1);

          return {
            ...post,
            likeCount: newLikeCount,
            likedByViewer: result.liked,
          };
        });

      setExplorePosts((prev) => updatePostLikes(prev));
      setFollowingPosts((prev) => updatePostLikes(prev));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedPost || !convexUserId) return;
    setIsCommenting(true);
    try {
      await addComment({
        slateId: selectedPost._id,
        userId: convexUserId as Id<"users">,
        content: commentText,
      });
      setCommentText("");
      const incrementCommentCount = (postList: SlatePost[]) =>
        postList.map((post) =>
          post._id === selectedPost._id
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        );

      setExplorePosts((prev) => incrementCommentCount(prev));
      setFollowingPosts((prev) => incrementCommentCount(prev));
      setSelectedPost((prev) =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleFollow = async (creatorId: Id<"creators">) => {
    if (isFollowing(creatorId)) {
      await unfollow(creatorId);
    } else {
      await follow(creatorId);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isFollowingTabLoading =
    activeTab === "following" &&
    (isAuthLoading ||
      (convexUserId !== null && isFollowLoading) ||
      (convexUserId !== null && followingSlatesResult === undefined));

  const creatorList = ((creators || []) as CreatorSummary[]);
  const feedPosts = activeTab === "following" ? followingPosts : explorePosts;
  const feedCount = feedPosts.length;
  const totalCreators = creatorList.length;
  const totalLikes = useMemo(
    () => explorePosts.reduce((sum, post) => sum + formatCount(post.likeCount), 0),
    [explorePosts]
  );
  const currentUserCreator = useMemo(
    () => creatorList.find((creator) => creator.username === user?.displayName),
    [creatorList, user?.displayName]
  );

  const featuredCreator = useMemo(() => {
    if (!creatorList.length) return null;
    return [...creatorList].sort((a, b) => {
      const revenueDiff = (b.totalRevenue || 0) - (a.totalRevenue || 0);
      if (revenueDiff !== 0) return revenueDiff;
      return (b.supporterCount || 0) - (a.supporterCount || 0);
    })[0];
  }, [creatorList]);

  const suggestedCreators = useMemo(
    () => creatorList.filter((creator) => creator._id !== featuredCreator?._id).slice(0, 5),
    [creatorList, featuredCreator]
  );

  const feedSummary = useMemo(() => {
    if (activeTab === "following") {
      return {
        eyebrow: "Following feed",
        title: user ? "Posts from creators you follow" : "Sign in to unlock your circle",
        description: user
          ? "Fresh drops, process notes, and creator updates from the people already in your orbit."
          : "Follow creators to build a tighter, more personal feed.",
      };
    }

    if (activeTab === "creators") {
      return {
        eyebrow: "Creator directory",
        title: "Discover your next favorite creator",
        description:
          "Browse polished creator pages, jump into profiles, and follow the people building in public.",
      };
    }

    return {
      eyebrow: "Explore feed",
      title: "See what the community is dropping right now",
      description:
        "A denser social dashboard for new posts, standout creators, and the next people worth following.",
    };
  }, [activeTab, user]);

  const navItems = [
    { label: "Feed", href: "/explore", icon: Compass, active: true },
    { label: "Home", href: "/", icon: Home, active: false },
    { label: "Creators", href: "/creators", icon: Users, active: false },
  ];

  return (
    <div className="min-h-screen bg-[#f3f1ea] text-black">
      <div className="mx-auto flex w-full max-w-[1560px] gap-5 px-3 py-4 sm:px-4 lg:px-6 xl:gap-6">
        <aside className="hidden lg:block lg:w-[270px] xl:w-[290px]">
          <div className="sticky top-4 rounded-[2rem] border border-black/10 bg-[#111111] p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.16)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4b000] text-black shadow-lg shadow-[#f4b000]/30">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Creator network</p>
                <h1 className="mt-1 text-xl font-black tracking-tight">DropSomething</h1>
              </div>
            </div>

            <p className="mt-6 max-w-[18rem] text-sm leading-relaxed text-white/64">
              A tighter social dashboard for drops, posts, and creator discovery without the dead space.
            </p>

            <div className="mt-8 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                    item.active
                      ? "bg-white text-black shadow-[0_16px_40px_rgba(255,255,255,0.12)]"
                      : "text-white/72 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={16} />
                    {item.label}
                  </span>
                  <ArrowUpRight size={14} className={item.active ? "text-black/40" : "text-white/35"} />
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/38">Workspace stats</p>
              <div className="mt-4 grid gap-3">
                <SidebarMetric label="Live posts" value={String(explorePosts.length)} />
                <SidebarMetric label="Creators" value={String(totalCreators)} />
                <SidebarMetric label="Likes this week" value={String(totalLikes)} />
              </div>
            </div>

            <div className="mt-8 rounded-[1.8rem] bg-[#f4b000] p-4 text-black">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/48">Quick action</p>
              <h2 className="mt-2 text-lg font-black">Open your creator workspace</h2>
              <p className="mt-2 text-sm leading-relaxed text-black/70">
                Jump into your dashboard to publish a new slate, tune your page, or review supporter activity.
              </p>
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white"
              >
                {user ? "Open dashboard" : "Create your page"}
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[760px] space-y-4 xl:max-w-[820px]">
            <section className="overflow-hidden rounded-[2.1rem] border border-black/10 bg-[#f8f6ef] shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="border-b border-black/8 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">{feedSummary.eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-black sm:text-[2rem]">{feedSummary.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-black/62 sm:text-[15px]">{feedSummary.description}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold text-black/65 shadow-sm">
                    <Bell size={14} />
                    Fresh creator activity
                  </div>
                </div>
              </div>

              <div className="border-b border-black/8 px-4 py-3 sm:px-6">
                <div className="flex flex-wrap gap-2">
                  {([
                    ["explore", "Explore"],
                    ["following", "Following"],
                    ["creators", "Creators"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-bold transition-all",
                        activeTab === value
                          ? "bg-black text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                          : "bg-white text-black/55 hover:bg-black/5 hover:text-black"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 sm:px-6">
                <div className="rounded-[1.8rem] border border-black/10 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.06)] sm:px-5">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-black/5 ring-1 ring-black/8">
                      <img
                        src={
                          currentUserCreator?.avatar ||
                          user?.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.displayName || "drop-something")}`
                        }
                        alt={user?.displayName || "DropSomething user"}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <textarea
                        value={composerText}
                        onChange={(event) => setComposerText(event.target.value)}
                        rows={3}
                        placeholder={getComposerPrompt(activeTab)}
                        className="min-h-[92px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-black placeholder:text-black/35 focus:outline-none"
                      />
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Image", icon: ImageIcon },
                            { label: "Video", icon: Video },
                            { label: "Audio", icon: Music },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              className="inline-flex items-center gap-2 rounded-full bg-[#f3f1ea] px-3 py-2 text-xs font-bold text-black/64 transition hover:bg-black/5"
                            >
                              <item.icon size={14} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <Link
                          to={user ? "/dashboard" : "/login"}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white"
                        >
                          {user ? "Publish from dashboard" : "Log in to post"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <AnimatePresence mode="wait">
              {activeTab === "explore" && (
                <motion.div
                  key="explore"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-4"
                >
                  {explorePosts.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="Nothing here yet"
                      description="Be the first creator to publish a slate and start the feed."
                    />
                  ) : (
                    <>
                      {explorePosts.map((post, index) => (
                        <Fragment key={post._id}>
                          <PostCard
                            post={post}
                            onLike={handleLike}
                            onComment={() => setSelectedPost(post)}
                            onFollow={handleFollow}
                            isFollowing={isFollowing(post.creatorId)}
                            formatTimeAgo={formatTimeAgo}
                          />
                          {(index + 1) % 3 === 0 && suggestedCreators.length > 0 && (
                            <PeopleToFollow
                              creators={suggestedCreators}
                              onFollow={handleFollow}
                              isFollowing={isFollowing}
                            />
                          )}
                        </Fragment>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "following" && (
                <motion.div
                  key="following"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-4"
                >
                  {isFollowingTabLoading ? (
                    <LoadingState message="Loading posts from creators you follow" />
                  ) : !user || !convexUserId ? (
                    <EmptyState
                      icon={Users}
                      title="Log in to see your following feed"
                      description="Sign in to build a personal stream of updates from creators you care about."
                      actionLabel="Log in"
                      actionHref="/login"
                    />
                  ) : following.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="You're not following anyone yet"
                      description="Follow a few creators and this column becomes your private update stream."
                      actionLabel="Explore creators"
                      actionClick={() => setActiveTab("creators")}
                    />
                  ) : followingPosts.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No posts from people you follow yet"
                      description="When the creators in your circle publish, their updates will appear here first."
                    />
                  ) : (
                    <>
                      {followingPosts.map((post, index) => (
                        <Fragment key={post._id}>
                          <PostCard
                            post={post}
                            onLike={handleLike}
                            onComment={() => setSelectedPost(post)}
                            onFollow={handleFollow}
                            isFollowing={isFollowing(post.creatorId)}
                            formatTimeAgo={formatTimeAgo}
                          />
                          {(index + 1) % 3 === 0 && suggestedCreators.length > 0 && (
                            <PeopleToFollow
                              creators={suggestedCreators}
                              onFollow={handleFollow}
                              isFollowing={isFollowing}
                            />
                          )}
                        </Fragment>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === "creators" && (
                <motion.div
                  key="creators"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-4"
                >
                  {creatorList.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="No creators available yet"
                      description="Check back soon for fresh creator pages and new profiles to follow."
                    />
                  ) : (
                    creatorList.map((creator) => {
                      const isOwnProfile = user?.displayName === creator.username;

                      return (
                        <motion.div
                          key={creator._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[1.25rem] bg-black/5 ring-1 ring-black/8">
                                <img
                                  src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.username)}`}
                                  alt={creator.name || creator.username}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="truncate text-lg font-black text-black">@{creator.username}</h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-black/62">{creator.bio || "Creator page ready for new supporters and fresh drops."}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-black/45">
                                  <span className="rounded-full bg-[#f3f1ea] px-3 py-1">{formatCurrency(creator.totalRevenue)}</span>
                                  <span className="rounded-full bg-[#f3f1ea] px-3 py-1">{formatCount(creator.supporterCount)} supporters</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={buildCreatorPath(creator.username)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-11 items-center gap-2 rounded-full border border-black/10 bg-[#f8f6ef] px-4 text-sm font-bold text-black"
                              >
                                View profile
                                <ExternalLink size={14} />
                              </a>
                              {!isOwnProfile && (
                                <button
                                  onClick={() => handleFollow(creator._id)}
                                  className={cn(
                                    "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition-all",
                                    isFollowing(creator._id)
                                      ? "bg-black/6 text-black hover:bg-black/10"
                                      : "bg-black text-white hover:bg-black/90"
                                  )}
                                >
                                  <UserPlus size={14} />
                                  {isFollowing(creator._id) ? "Following" : "Follow"}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <aside className="hidden xl:block xl:w-[330px]">
          <div className="sticky top-4 space-y-4">
            <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
              <div className="h-28 bg-[linear-gradient(135deg,#111111_0%,#2f2f2f_45%,#f4b000_100%)]" />
              <div className="px-5 pb-5">
                <div className="-mt-10 flex items-end justify-between gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-[1.5rem] border-4 border-white bg-black/5 shadow-lg">
                    <img
                      src={featuredCreator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(featuredCreator?.username || "featured")}`}
                      alt={featuredCreator?.name || featuredCreator?.username || "Featured creator"}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">Featured</span>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">Featured creator</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-black">
                    {featuredCreator ? getDisplayName(featuredCreator.name, featuredCreator.username) : "Top creator loading"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-black/46">@{featuredCreator?.username || "dropsomething"}</p>
                  <p className="mt-3 text-sm leading-relaxed text-black/62">
                    {featuredCreator?.bio || "High-signal creator page with steady supporter momentum and a polished public profile."}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <StatPill label="Supporters" value={String(formatCount(featuredCreator?.supporterCount))} />
                  <StatPill label="Revenue" value={formatCurrency(featuredCreator?.totalRevenue)} />
                </div>

                {featuredCreator && (
                  <div className="mt-5 flex gap-2">
                    <a
                      href={buildCreatorPath(featuredCreator.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-black text-sm font-bold text-white"
                    >
                      View profile
                    </a>
                    <button
                      onClick={() => handleFollow(featuredCreator._id)}
                      className={cn(
                        "inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-bold transition-all",
                        isFollowing(featuredCreator._id)
                          ? "bg-black/6 text-black"
                          : "border border-black/10 bg-[#f8f6ef] text-black"
                      )}
                    >
                      {isFollowing(featuredCreator._id) ? "Following" : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">Suggested creators</p>
                  <h3 className="mt-2 text-lg font-black text-black">People worth following</h3>
                </div>
                <span className="rounded-full bg-[#f3f1ea] px-3 py-1 text-xs font-bold text-black/55">{suggestedCreators.length}</span>
              </div>

              <div className="mt-5 space-y-4">
                {suggestedCreators.length === 0 ? (
                  <p className="text-sm leading-relaxed text-black/55">Creator suggestions will appear here as new profiles go live.</p>
                ) : (
                  suggestedCreators.map((creator) => (
                    <div key={creator._id} className="flex items-center gap-3 rounded-[1.4rem] bg-[#f8f6ef] p-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[1rem] bg-black/5 ring-1 ring-black/8">
                        <img
                          src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.username)}`}
                          alt={creator.name || creator.username}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-black">{getDisplayName(creator.name, creator.username)}</p>
                        <p className="truncate text-xs text-black/45">@{creator.username}</p>
                      </div>
                      <button
                        onClick={() => handleFollow(creator._id)}
                        className={cn(
                          "inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-bold transition-all",
                          isFollowing(creator._id)
                            ? "bg-black/8 text-black"
                            : "bg-black text-white"
                        )}
                      >
                        {isFollowing(creator._id) ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-[#111111] p-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/38">At a glance</p>
              <div className="mt-4 grid gap-3">
                <SidebarMetricDark label="Active feed items" value={String(feedCount)} />
                <SidebarMetricDark label="Following" value={String(following.length)} />
                <SidebarMetricDark label="Creator pages" value={String(totalCreators)} />
              </div>
            </section>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white sm:max-w-lg sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-black/5 p-4">
                <h3 className="font-bold text-black">Comments</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full p-2 hover:bg-black/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-black/5">
                        <img
                          src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                          alt={comment.userName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black">{comment.userName}</p>
                        <p className="mt-1 text-sm text-black/80">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-black/40">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>

              <div className="border-t border-black/5 p-4">
                {convexUserId ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="h-10 flex-1 rounded-full border border-black/10 bg-black/5 px-4 text-sm focus:outline-none"
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    />
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || isCommenting}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white disabled:opacity-50"
                    >
                      {isCommenting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/5 px-4 py-3">
                    <p className="text-sm text-black/60">Log in to join the conversation.</p>
                    <Link
                      to="/login"
                      className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                    >
                      Log in
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionClick,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionClick?: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-16 text-center shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3f1ea] text-black/28">
        <Icon size={28} />
      </div>
      <h3 className="mt-5 text-xl font-black text-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-black/58">{description}</p>
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && actionClick && !actionHref && (
        <button
          onClick={actionClick}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-black/10 bg-white px-6 py-16 text-center shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
      <Loader2 size={28} className="mx-auto animate-spin text-black/35" />
      <p className="mt-4 text-sm text-black/55">{message}</p>
    </div>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function SidebarMetricDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
      <span className="text-sm text-white/58">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] bg-[#f8f6ef] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/34">{label}</p>
      <p className="mt-2 text-sm font-black text-black">{value}</p>
    </div>
  );
}

function PeopleToFollow({
  creators,
  onFollow,
  isFollowing,
}: {
  creators: CreatorSummary[];
  onFollow: (id: Id<"creators">) => void | Promise<void>;
  isFollowing: (id: Id<"creators">) => boolean;
}) {
  if (!creators || creators.length === 0) return null;

  return (
    <section className="rounded-[2rem] border border-black/10 bg-[#111111] px-5 py-5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/38">Suggested follows</p>
          <h3 className="mt-2 text-lg font-black">New faces for your dashboard</h3>
        </div>
        <Plus size={18} className="text-white/36" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {creators.slice(0, 4).map((creator) => (
          <div key={creator._id} className="rounded-[1.4rem] bg-white/7 p-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-[1rem] bg-white/10">
                <img
                  src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.username)}`}
                  alt={creator.name || creator.username}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{getDisplayName(creator.name, creator.username)}</p>
                <p className="truncate text-xs text-white/48">@{creator.username}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <a
                href={buildCreatorPath(creator.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-white/62 hover:text-white"
              >
                View page
              </a>
              <button
                onClick={() => onFollow(creator._id)}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-bold transition-all",
                  isFollowing(creator._id)
                    ? "bg-white/12 text-white"
                    : "bg-[#f4b000] text-black"
                )}
              >
                {isFollowing(creator._id) ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PostCard({
  post,
  onLike,
  onComment,
  onFollow,
  isFollowing,
  formatTimeAgo,
}: {
  post: SlatePost;
  onLike: (id: Id<"slates">) => void | Promise<void>;
  onComment: () => void;
  onFollow: (id: Id<"creators">) => void | Promise<void>;
  isFollowing: boolean;
  formatTimeAgo: (timestamp: number) => string;
}) {
  const displayLikeCount = formatCount(post.likeCount);
  const displayCreatorName = getDisplayName(post.creatorName, post.creatorUsername);
  const displayUsername = post.creatorUsername || "anonymous";
  const isLiked = !!post.likedByViewer;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-black/6 px-5 py-5">
        <a
          href={buildCreatorPath(displayUsername)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[1rem] bg-[#f3f1ea] ring-1 ring-black/8">
            <img
              src={post.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayUsername)}`}
              alt={displayCreatorName}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-black">{displayCreatorName}</p>
            <p className="truncate text-xs text-black/45">@{displayUsername} · {formatTimeAgo(post._creationTime)}</p>
          </div>
        </a>
        <button
          onClick={() => onFollow(post.creatorId)}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all",
            isFollowing
              ? "bg-black/6 text-black hover:bg-black/10"
              : "bg-black text-white hover:bg-black/90"
          )}
        >
          <UserPlus size={13} />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      <div className="px-5 py-5">
        {post.type === "text" && post.content && (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-black/84">{post.content}</p>
        )}

        {post.type === "image" && post.mediaUrl && (
          <div className="space-y-4">
            {post.content && (
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-black/84">{post.content}</p>
            )}
            <img
              src={post.mediaUrl}
              alt="Post"
              className="max-h-[560px] w-full rounded-[1.6rem] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        {post.type === "video" && (post.playbackId || post.mediaUrl) && (
          <div className="space-y-4">
            {post.content && (
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-black/84">{post.content}</p>
            )}
            <div className="overflow-hidden rounded-[1.6rem] bg-black">
              <video controls className="max-h-[560px] w-full object-cover">
                <source
                  src={post.playbackId ? `https://stream.mux.com/${post.playbackId}.m3u8` : post.mediaUrl}
                  type={post.playbackId ? "application/x-mpegURL" : "video/mp4"}
                />
              </video>
            </div>
          </div>
        )}

        {post.type === "audio" && (post.playbackId || post.mediaUrl) && (
          <div className="space-y-4">
            {post.content && (
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-black/84">{post.content}</p>
            )}
            <div className="rounded-[1.6rem] bg-[#f8f6ef] p-4">
              <audio controls className="w-full">
                <source src={post.mediaUrl || `https://stream.mux.com/${post.playbackId}.m3u8`} />
              </audio>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-black/6 px-5 py-4">
        <button
          onClick={() => onLike(post._id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all",
            isLiked ? "bg-red-50 text-red-500" : "bg-[#f3f1ea] text-black/65 hover:text-black"
          )}
        >
          <Heart size={18} className={cn(isLiked && "fill-current")} />
          {displayLikeCount}
        </button>
        <button
          onClick={onComment}
          className="inline-flex items-center gap-2 rounded-full bg-[#f3f1ea] px-3 py-2 text-sm font-semibold text-black/65 transition-all hover:text-black"
        >
          <MessageCircle size={18} />
          {formatCount(post.commentCount)}
        </button>
        <a
          href={buildCreatorPath(displayUsername)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-black/55 transition hover:text-black"
        >
          View profile
          <ExternalLink size={15} />
        </a>
      </div>
    </motion.article>
  );
}
