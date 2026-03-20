import React, { createContext, useContext } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./AuthContext";

interface FollowContextType {
  follow: (creatorId: Id<"creators">) => Promise<void>;
  unfollow: (creatorId: Id<"creators">) => Promise<void>;
  isFollowing: (creatorId: Id<"creators">) => boolean;
  isLoading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { convexUserId } = useAuth();

  // Fetch following list from Convex when user is authenticated
  const following = useQuery(
    convexUserId ? api.creators.getFollowing : undefined,
    convexUserId ? { userId: convexUserId } : undefined
  );

  const followMutation = useMutation(api.creators.follow);
  const unfollowMutation = useMutation(api.creators.unfollow);

  const follow = async (creatorId: Id<"creators">) => {
    if (!convexUserId) {
      console.warn("User not authenticated, cannot follow");
      return;
    }
    try {
      await followMutation({ userId: convexUserId, creatorId });
    } catch (error) {
      console.error("Error following creator:", error);
    }
  };

  const unfollow = async (creatorId: Id<"creators">) => {
    if (!convexUserId) {
      console.warn("User not authenticated, cannot unfollow");
      return;
    }
    try {
      await unfollowMutation({ userId: convexUserId, creatorId });
    } catch (error) {
      console.error("Error unfollowing creator:", error);
    }
  };

  const isFollowing = (creatorId: Id<"creators">): boolean => {
    if (!following || !convexUserId) return false;
    return following.some((creator) => creator._id === creatorId);
  };

  const isLoading = following === undefined;

  return (
    <FollowContext.Provider value={{ follow, unfollow, isFollowing, isLoading }}>
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
