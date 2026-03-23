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

// Safe formatter for like/comment counts
const formatCount = (count: number | undefined | null): number => {
  return Number(count) || 0;
};

// Safe formatter for creator names
const getDisplayName = (name?: string | null, username?: string | null): string => {
  return name || username || "Anonymous";
};

export default function Explore() {
  const [activeTab, setActiveTab] = useState<"explore" | "following" | "creators">("explore");
  const [selectedPost, setSelectedPost] = useState<SlatePost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const { convexUserId } = useAuth();
  const { follow, unfollow, isFollowing } = useFollow();
  const toggleLike = useMutation(api.slates.toggleLike);
  const addComment = useMutation(api.slates.addComment);

  // Get ALL public slates (no pagination, shows all posts)
  const allSlates = useQuery(api.slates.getAllPublicSlates);
  const [posts, setPosts] = useState<SlatePost[]>([]);

  // Get some creators for "People to Follow" suggestions
  const allCreators = useQuery(api.creators.listCreators);

  // Get comments for selected post
  const comments = useQuery(
    api.slates.getComments,
    selectedPost ? { slateId: selectedPost._id } : "skip"
  );

  // Get all creators for Creators tab
  const creators = useQuery(api.creators.listCreators);
  const { user } = useAuth();

  // Update posts when slates load
  useEffect(() => {
    if (activeTab === "creators") return;
    if (allSlates) {
      if (activeTab === "explore") {
        setPosts(allSlates);
      } else if (activeTab === "following" && convexUserId) {
        // Filter to only show posts from followed creators
        // This would require a separate query in production
        setPosts(allSlates);
      }
    }
  }, [allSlates, activeTab, convexUserId]);

  const handleLike = async (slateId: Id<"slates">) => {
    if (!convexUserId) return;
    try {
      const result = await toggleLike({
        slateId,
        userId: convexUserId as Id<"users">,
      });
      
      // Update local state based on like result
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === slateId) {
            // If liked, add 1; if unliked, subtract 1
            const newLikeCount = result.liked 
              ? post.likeCount + 1 
              : Math.max(0, post.likeCount - 1);
            return { ...post, likeCount: newLikeCount };
          }
          return post;
        })
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
              className="divide-y divide-gray-100"
            >
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/20 mb-6">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-black">Nothing here yet</h3>
                  <p className="mt-2 text-gray-500 max-w-xs text-sm">
                    Be the first to post on Slate
                  </p>
                </div>
              ) : (
                <>
                  {posts.map((post, index) => (
                    <>
                      <PostCard
                        key={post._id}
                        post={post}
                        onLike={handleLike}
                        onComment={() => setSelectedPost(post)}
                        onFollow={handleFollow}
                        isFollowing={isFollowing(post.creatorId)}
                        formatTimeAgo={formatTimeAgo}
                      />
                      {/* Show "People to Follow" after every 2 posts */}
                      {(index + 1) % 2 === 0 && allCreators && allCreators.length > 0 && (
                        <PeopleToFollow
                          key={`people-${index}`}
                          creators={allCreators.filter(c => c._id !== post.creatorId)}
                          onFollow={handleFollow}
                          isFollowing={isFollowing}
                        />
                      )}
                    </>
                  ))}
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
              className="divide-y divide-gray-100"
            >
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/5 text-black/20 mb-6">
                    <Users size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-black">You're not following anyone yet</h3>
                  <p className="mt-2 text-gray-500 max-w-xs text-sm">
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
                  {posts.map((post, index) => (
                    <>
                      <PostCard
                        key={post._id}
                        post={post}
                        onLike={handleLike}
                        onComment={() => setSelectedPost(post)}
                        onFollow={handleFollow}
                        isFollowing={isFollowing(post.creatorId)}
                        formatTimeAgo={formatTimeAgo}
                      />
                      {/* Show "People to Follow" after every 2 posts */}
                      {(index + 1) % 2 === 0 && allCreators && allCreators.length > 0 && (
                        <PeopleToFollow
                          key={`people-${index}`}
                          creators={allCreators.filter(c => c._id !== post.creatorId)}
                          onFollow={handleFollow}
                          isFollowing={isFollowing}
                        />
                      )}
                    </>
                  ))}
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

// People to Follow Component
function PeopleToFollow({
  creators,
  onFollow,
  isFollowing,
}: {
  creators: any[];
  onFollow: (id: Id<"creators">) => void;
  isFollowing: (id: Id<"creators">) => boolean;
}) {
  if (!creators || creators.length === 0) return null;

  return (
    <div className="py-6 border-b border-gray-100">
      <div className="px-4 sm:px-6 mb-4">
        <h3 className="text-sm font-bold text-black">People to follow</h3>
        <p className="text-xs text-gray-500 mt-0.5">Discover new creators</p>
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-hide">
        {creators.slice(0, 10).map((creator) => (
          <div
            key={creator._id}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <a
              href={`/${creator.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 w-14 rounded-full overflow-hidden bg-gray-100 shrink-0"
            >
              <img
                src={creator.avatar}
                alt={creator.name}
                className="h-full w-full object-cover"
              />
            </a>
            <div className="text-center">
              <p className="text-xs font-bold text-black truncate max-w-[80px]">
                {creator.name}
              </p>
              <button
                onClick={() => onFollow(creator._id)}
                className={cn(
                  "mt-1 rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap",
                  isFollowing(creator._id)
                    ? "bg-gray-100 text-gray-700"
                    : "bg-black text-white"
                )}
              >
                {isFollowing(creator._id) ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
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
  // Safe display values with defensive programming
  const displayLikeCount = formatCount(post.likeCount);
  const displayCommentCount = formatCount(post.commentCount);
  const displayCreatorName = getDisplayName(post.creatorName, post.creatorUsername);
  const displayUsername = post.creatorUsername || "anonymous";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white py-6 border-b border-gray-100 last:border-b-0"
    >
      {/* Creator Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <a
          href={`/${displayUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
            <img
              src={post.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUsername}`}
              alt={displayCreatorName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-black leading-tight">{displayCreatorName}</p>
            <p className="text-xs text-gray-500">@{displayUsername} · {formatTimeAgo(post._creationTime)}</p>
          </div>
        </a>
        <button
          onClick={() => onFollow(post.creatorId)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            isFollowing
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-black text-white hover:bg-gray-800"
          )}
        >
          <UserPlus size={12} />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* Content */}
      <div className="mb-4 px-4 sm:px-6">
        {post.type === "text" && post.content && (
          <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.type === "image" && post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full rounded-2xl object-cover max-h-[500px]"
          />
        )}

        {post.type === "video" && post.playbackId && (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video controls className="w-full max-h-[500px] object-cover">
              <source src={`https://stream.mux.com/${post.playbackId}.m3u8`} type="application/x-mpegURL" />
            </video>
          </div>
        )}

        {post.type === "audio" && post.playbackId && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <audio controls className="w-full">
              <source src={post.mediaUrl || `https://stream.mux.com/${post.playbackId}.m3u8`} />
            </audio>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 px-4 sm:px-6">
        <button
          onClick={() => onLike(post._id)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
        >
          <Heart size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">{displayLikeCount}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
        >
          <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">{displayCommentCount}</span>
        </button>
        <a
          href={`/${displayUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors ml-auto group"
        >
          <span className="text-sm font-medium">View Profile</span>
          <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </motion.article>
  );
}
