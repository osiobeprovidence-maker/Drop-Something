import React, { createContext, useContext, useState, useEffect } from "react";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface MembershipTier {
  id: string;
  title: string;
  price: number;
  description: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "digital" | "physical";
  image?: string;
  fileUrl?: string; // for digital
  stock?: number; // for physical
  deliveryInfo?: string; // for physical
}

export interface Tip {
  id: string;
  supporterName: string;
  amount: number;
  message?: string;
  createdAt: string;
  type: "tip" | "membership";
}

export interface CreatorData {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  coverImage: string;
  links: LinkItem[];
  memberships: MembershipTier[];
  goals: Goal[];
  products: Product[];
  totalRevenue: number;
  pageStyle: "support" | "shop" | "goal" | "hybrid";
  supporterCount?: number;
  tips: Tip[];
}

interface DataContextType {
  creator: CreatorData;
  // Expose creator properties directly for convenience
  username: string;
  name: string;
  bio: string;
  avatar: string;
  coverImage: string;
  links: LinkItem[];
  memberships: MembershipTier[];
  goals: Goal[];
  products: Product[];
  totalRevenue: number;
  pageStyle: "support" | "shop" | "goal" | "hybrid";
  supporterCount?: number;
  tips: Tip[];
  
  updateProfile: (data: Partial<CreatorData>) => void;
  // Links CRUD
  addLink: (link: Omit<LinkItem, "id">) => void;
  updateLink: (id: string, link: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  // Memberships CRUD
  addMembership: (tier: Omit<MembershipTier, "id">) => void;
  updateMembership: (id: string, tier: Partial<MembershipTier>) => void;
  deleteMembership: (id: string) => void;
  // Goals CRUD
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  // Products CRUD
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Tips
  addTip: (tip: Omit<Tip, "id" | "createdAt">) => void;
}

const DEFAULT_DATA: CreatorData = {
  username: "alexrivera",
  name: "Alex Rivera",
  bio: "Creating digital art, tutorials, and sharing my journey with the world. Thanks for being here! ✨",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexrivera",
  coverImage: "https://picsum.photos/seed/cover/1200/400",
  links: [
    { id: "1", title: "My Portfolio", url: "https://portfolio.com" },
    { id: "2", title: "Twitter", url: "https://twitter.com/alex" },
  ],
  memberships: [
    { id: "1", title: "Supporter", price: 2000, description: "Access to my process and early bird tutorials." },
    { id: "2", title: "VIP", price: 5000, description: "Private Discord community and monthly group calls." },
  ],
  goals: [
    { id: "1", title: "New Studio Microphone", targetAmount: 150000, currentAmount: 85000 },
  ],
  products: [
    { id: "1", title: "Digital Art Pack", description: "10 high-res wallpapers for your devices.", price: 2500, type: "digital" },
  ],
  totalRevenue: 124500,
  pageStyle: "hybrid",
  supporterCount: 128,
  tips: [
    { id: "1", supporterName: "John D.", amount: 1000, message: "Love your work!", createdAt: new Date(Date.now() - 7200000).toISOString(), type: "tip" },
    { id: "2", supporterName: "Sarah W.", amount: 500, message: "Thanks for the tips!", createdAt: new Date(Date.now() - 18000000).toISOString(), type: "tip" },
    { id: "3", supporterName: "Mike R.", amount: 5000, message: "Joining the VIP tier!", createdAt: new Date(Date.now() - 86400000).toISOString(), type: "membership" },
  ],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [creator, setCreator] = useState<CreatorData>(() => {
    const saved = localStorage.getItem("creator_data");
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem("creator_data", JSON.stringify(creator));
  }, [creator]);

  const updateProfile = (data: Partial<CreatorData>) => {
    setCreator(prev => ({ ...prev, ...data }));
  };

  const addLink = (link: Omit<LinkItem, "id">) => {
    const newLink = { ...link, id: Math.random().toString(36).substr(2, 9) };
    setCreator(prev => ({ ...prev, links: [...prev.links, newLink] }));
  };

  const updateLink = (id: string, link: Partial<LinkItem>) => {
    setCreator(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === id ? { ...l, ...link } : l)
    }));
  };

  const deleteLink = (id: string) => {
    setCreator(prev => ({ ...prev, links: prev.links.filter(l => l.id !== id) }));
  };

  const addMembership = (tier: Omit<MembershipTier, "id">) => {
    const newTier = { ...tier, id: Math.random().toString(36).substr(2, 9) };
    setCreator(prev => ({ ...prev, memberships: [...prev.memberships, newTier] }));
  };

  const updateMembership = (id: string, tier: Partial<MembershipTier>) => {
    setCreator(prev => ({
      ...prev,
      memberships: prev.memberships.map(m => m.id === id ? { ...m, ...tier } : m)
    }));
  };

  const deleteMembership = (id: string) => {
    setCreator(prev => ({ ...prev, memberships: prev.memberships.filter(m => m.id !== id) }));
  };

  const addGoal = (goal: Omit<Goal, "id">) => {
    const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9) };
    setCreator(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, goal: Partial<Goal>) => {
    setCreator(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...goal } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setCreator(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    setCreator(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setCreator(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...product } : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setCreator(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  const addTip = (tip: Omit<Tip, "id" | "createdAt">) => {
    const newTip: Tip = {
      ...tip,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setCreator(prev => ({
      ...prev,
      tips: [newTip, ...prev.tips],
      totalRevenue: prev.totalRevenue + tip.amount,
      supporterCount: (prev.supporterCount || 0) + 1
    }));
  };

  return (
    <DataContext.Provider value={{
      creator,
      ...creator,
      updateProfile,
      addLink, updateLink, deleteLink,
      addMembership, updateMembership, deleteMembership,
      addGoal, updateGoal, deleteGoal,
      addProduct, updateProduct, deleteProduct,
      addTip
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
