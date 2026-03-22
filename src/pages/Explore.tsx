import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, MessageCircle, UserPlus, ExternalLink, Loader2,
  Users, X, Send, Image as ImageIcon, Music, Video, FileText, Search
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useFollow } from "@/src/context/FollowContext";
import { useAuth } from "@/src/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
  _creationTime: number;
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState<"explore" | "following" | "creators">("explore");
  const [cursor, setCursor] = useState<Id<"slates"> | undefined>(undefined);
  const [posts, setPosts] = useState<SlatePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState<SlatePost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const { convexUserId } = useAuth();
  const { follow, unfollow, isFollowing } = useFollow();
  const toggleLike = useMutation(api.slates.toggleLike);
  const addComment = useMutation(api.slates.addComment);

  // Get comments for selected post
  const comments = useQuery(
    api.slates.getComments,
    selectedPost ? { slateId: selectedPost._id } : "skip"
  );

  // Get all creators for Creators tab
  const creators = useQuery(api.creators.listCreators);
  const { user } = useAuth();

  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial posts
  useEffect(() => {
    if (activeTab === "creators") return;
    
    setPosts([]);
    setCursor(undefined);
    setHasMore(true);
    loadMorePosts();
  }, [activeTab]);

  const loadMorePosts = async () => {
    if (loading || !hasMore || !convexUserId) return;

    setLoading(true);
    try {
      let result;
      if (activeTab === "explore") {
        result = await (api.slates.getPublicSlates as any)({
          cursor,
          limit: 10,
        });
      } else {
        result = await (api.slates.getFollowingSlates as any)({
          userId: convexUserId,
          cursor,
          limit: 10,
        });
      }

      if (result && result.items) {
        setPosts((prev) => [...prev, ...result.items]);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (activeTab === "creators") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, activeTab]);

  const handleLike = async (slateId: Id<"slates">) => {
    if (!convexUserId) return;
    try {
      await toggleLike({
        slateId,
        userId: convexUserId as Id<"users">,
      });
      setPosts((prev) =>
        prev.map((post) =>
          post._id === slateId
            ? { ...post, likeCount: post.likeCount + 1 }
            : post
        )
      );
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <h1 className="text-2xl font-black text-black">Explore what creators are sharing</h1>
          <p className="text-sm text-black/60 mt-1">Discover new creators, posts, and ideas</p>

          {/* Tabs */}
          <div className="mt-4 flex gap-6">
            <button
              onClick={() => setActiveTab("explore")}
              className={cn(
                "pb-3 text-sm font-bold transition-all relative",
                activeTab === "explore" ? "text-black" : "text-black/40 hover:text-black/60"
              )}
            >
              Explore
              {activeTab === "explore" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={cn(
                "pb-3 text-sm font-bold transition-all relative",
                activeTab === "following" ? "text-black" : "text-black/40 hover:text-black/60"
              )}
            >
              Following
              {activeTab === "following" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={cn(
                "pb-3 text-sm font-bold transition-all relative",
                activeTab === "creators" ? "text-black" : "text-black/40 hover:text-black/60"
              )}
            >
              Creators
              {activeTab === "creators" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <AnimatePresence mode="wait">
          {/* EXPLORE TAB */}
          {activeTab === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {posts.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/20 mb-6">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-black">Nothing here yet</h3>
                  <p className="mt-2 text-black/60 max-w-xs text-sm">
                    Be the first to post on Slate
                  </p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onLike={handleLike}
                      onComment={() => setSelectedPost(post)}
                      onFollow={handleFollow}
                      isFollowing={isFollowing(post.creatorId)}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}

                  {loading && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-black/40" />
                    </div>
                  )}

                  {!hasMore && posts.length > 0 && (
                    <div className="text-center py-8 text-sm text-black/40">
                      No more posts to load
                    </div>
                  )}

                  <div ref={observerTarget} className="h-10" />
                </>
              )}
            </motion.div>
          )}

          {/* FOLLOWING TAB */}
          {activeTab === "following" && (
            <motion.div
              key="following"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {posts.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/20 mb-6">
                    <Users size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-black">You're not following anyone yet</h3>
                  <p className="mt-2 text-black/60 max-w-xs text-sm">
                    Follow creators to see their posts here
                  </p>
                  <button
                    onClick={() => setActiveTab("creators")}
                    className="mt-6 font-bold text-black underline underline-offset-4 text-sm"
                  >
                    Explore creators
                  </button>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onLike={handleLike}
                      onComment={() => setSelectedPost(post)}
                      onFollow={handleFollow}
                      isFollowing={isFollowing(post.creatorId)}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}

                  {loading && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-black/40" />
                    </div>
                  )}

                  {!hasMore && posts.length > 0 && (
                    <div className="text-center py-8 text-sm text-black/40">
                      No more posts to load
                    </div>
                  )}

                  <div ref={observerTarget} className="h-10" />
                </>
              )}
            </motion.div>
          )}

          {/* CREATORS TAB */}
          {activeTab === "creators" && (
            <motion.div
              key="creators"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {creators && creators.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/20 mb-6">
                    <Search size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-black">No creators available yet</h3>
                  <p className="mt-2 text-black/60 max-w-xs text-sm">
                    Check back later for new creators
                  </p>
                </div>
              ) : (
                creators?.map((creator) => {
                  // Check if this is the current user's profile
                  const isOwnProfile = user?.username === creator.username;

                  return (
                    <div
                      key={creator._id}
                      className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[2.5rem] border border-black/5 bg-white p-6 transition-all hover:shadow-xl hover:shadow-black/5"
                    >
                      <a
                        href={`/${creator.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-0 rounded-[2.5rem]"
                      />

                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4 z-10">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-black/5 shadow-sm">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {/* Mobile Follow Button - Hide for own profile */}
                        {!isOwnProfile && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleFollow(creator._id);
                            }}
                            className={cn(
                              "sm:hidden flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95",
                              isFollowing(creator._id)
                                ? "bg-black text-white"
                                : "bg-black/5 text-black hover:bg-black/10"
                            )}
                          >
                            <UserPlus size={18} />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 z-10 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-black text-black">@{creator.username}</h3>
                            <p className="line-clamp-1 text-sm text-black/60 mt-1">{creator.bio}</p>
                          </div>
                          {/* Desktop Follow Button - Hide for own profile */}
                          {!isOwnProfile && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleFollow(creator._id);
                              }}
                              className={cn(
                                "hidden sm:flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95",
                                isFollowing(creator._id)
                                  ? "bg-black/5 text-black hover:bg-black/10"
                                  : "bg-black text-white hover:bg-black/90"
                              )}
                            >
                              <UserPlus size={14} />
                              {isFollowing(creator._id) ? "Following" : "Follow"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-black/5">
                <h3 className="font-bold text-black">Comments</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full p-2 hover:bg-black/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-black/5 shrink-0">
                        <img
                          src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                          alt={comment.userName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black">{comment.userName}</p>
                        <p className="text-sm text-black/80 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-black/40">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-black/5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 h-10 rounded-full border border-black/10 bg-black/5 px-4 text-sm focus:outline-none"
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || isCommenting}
                    className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50"
                  >
                    {isCommenting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Post Card Component
function PostCard({
  post,
  onLike,
  onComment,
  onFollow,
  isFollowing,
  formatTimeAgo,
}: {
  post: SlatePost;
  onLike: (id: Id<"slates">) => void;
  onComment: () => void;
  onFollow: (id: Id<"creators">) => void;
  isFollowing: boolean;
  formatTimeAgo: (timestamp: number) => string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white p-6 shadow-sm border border-black/5"
    >
      {/* Creator Header */}
      <div className="flex items-center justify-between mb-4">
        <a
          href={`/${post.creatorUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden bg-black/5">
            <img
              src={post.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorUsername}`}
              alt={post.creatorName}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-black">{post.creatorName}</p>
            <p className="text-xs text-black/40">@{post.creatorUsername} · {formatTimeAgo(post._creationTime)}</p>
          </div>
        </a>
        <button
          onClick={() => onFollow(post.creatorId)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
            isFollowing
              ? "bg-black/5 text-black hover:bg-black/10"
              : "bg-black text-white hover:bg-black/90"
          )}
        >
          <UserPlus size={12} />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        {post.type === "text" && post.content && (
          <p className="text-sm font-medium text-black/80 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}

        {post.type === "image" && post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full rounded-2xl object-cover max-h-96"
          />
        )}

        {post.type === "video" && post.playbackId && (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video controls className="w-full max-h-96 object-cover">
              <source src={`https://stream.mux.com/${post.playbackId}.m3u8`} type="application/x-mpegURL" />
            </video>
          </div>
        )}

        {post.type === "audio" && post.playbackId && (
          <div className="rounded-2xl border border-black/10 bg-black/5 p-4">
            <audio controls className="w-full">
              <source src={post.mediaUrl || `https://stream.mux.com/${post.playbackId}.m3u8`} />
            </audio>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-black/5">
        <button
          onClick={() => onLike(post._id)}
          className="flex items-center gap-2 text-black/60 hover:text-red-500 transition-colors"
        >
          <Heart size={18} />
          <span className="text-xs font-bold">{post.likeCount}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-xs font-bold">{post.commentCount}</span>
        </button>
        <a
          href={`/${post.creatorUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors ml-auto"
        >
          <ExternalLink size={16} />
          <span className="text-xs font-bold">View Profile</span>
        </a>
      </div>
    </motion.article>
  );
}
