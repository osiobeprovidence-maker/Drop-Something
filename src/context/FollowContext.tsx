import React, { createContext, useContext } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "./AuthContext";

interface FollowContextType {
  following: Id<"creators">[];
  follow: (creatorId: Id<"creators">) => Promise<void>;
  unfollow: (creatorId: Id<"creators">) => Promise<void>;
  isFollowing: (creatorId: Id<"creators">) => boolean;
  isLoading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { convexUserId } = useAuth();

  // Fetch follows from Convex
  const follows = useQuery(
    api.creators.getFollows,
    convexUserId ? { followerId: convexUserId as Id<"users"> } : "skip"
  );

  const followCreator = useMutation(api.creators.followCreator);
  const unfollowCreator = useMutation(api.creators.unfollowCreator);

  const following = follows?.map((f) => f.followingId) || [];

  const follow = async (creatorId: Id<"creators">) => {
    if (!convexUserId) return;
    try {
      await followCreator({
        followerId: convexUserId as Id<"users">,
        followingId: creatorId,
      });
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const unfollow = async (creatorId: Id<"creators">) => {
    if (!convexUserId) return;
    try {
      await unfollowCreator({
        followerId: convexUserId as Id<"users">,
        followingId: creatorId,
      });
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  const isFollowing = (creatorId: Id<"creators">) => {
    return following.includes(creatorId);
  };

  const value: FollowContextType = {
    following,
    follow,
    unfollow,
    isFollowing,
    isLoading: follows === undefined,
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
}
