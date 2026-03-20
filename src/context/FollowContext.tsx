import React, { createContext, useContext, useState, useEffect } from "react";

interface FollowContextType {
  following: string[];
  follow: (id: string) => void;
  unfollow: (id: string) => void;
  isFollowing: (id: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [following, setFollowing] = useState<string[]>(() => {
    const saved = localStorage.getItem("following_creators");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("following_creators", JSON.stringify(following));
  }, [following]);

  const follow = (id: string) => {
    setFollowing((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const unfollow = (id: string) => {
    setFollowing((prev) => prev.filter((favId) => favId !== id));
  };

  const isFollowing = (id: string) => following.includes(id);

  return (
    <FollowContext.Provider value={{ following, follow, unfollow, isFollowing }}>
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
