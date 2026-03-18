export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  createdAt: string;
}

export interface Tip {
  id: string;
  creatorId: string;
  supporterName: string;
  amount: number;
  message?: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  creatorId: string;
  price: number;
  description: string;
  enabled: boolean;
}

export interface Goal {
  id: string;
  creatorId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export interface Product {
  id: string;
  creatorId: string;
  name: string;
  price: number;
  type: "digital" | "physical";
  description: string;
  stock?: number;
  fileUrl?: string; // for digital
}

export interface Link {
  id: string;
  creatorId: string;
  title: string;
  url: string;
}
