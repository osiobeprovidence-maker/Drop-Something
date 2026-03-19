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

export interface CreatorProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  coverImage: string;
  bio: string;
  category: string;
  supporters: number;
  rank: number;
  links: LinkItem[];
  memberships: MembershipTier[];
  goals: Goal[];
  products: Product[];
  pageStyle: "support" | "shop" | "goal" | "hybrid";
}

export const MOCK_CREATORS: CreatorProfile[] = [
  {
    id: "1",
    username: "alexrivera",
    name: "Alex Rivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    coverImage: "https://picsum.photos/seed/alex-cover/1200/400",
    bio: "Creating digital art & tutorials for aspiring artists.",
    category: "Designers",
    supporters: 1240,
    rank: 1,
    links: [
      { id: "l1", title: "My Portfolio", url: "https://portfolio.com" },
      { id: "l2", title: "Instagram", url: "https://instagram.com/alex" },
    ],
    memberships: [
      { id: "m1", title: "Supporter", price: 2000, description: "Access to my process and early bird tutorials." },
    ],
    goals: [
      { id: "g1", title: "New Studio Microphone", targetAmount: 150000, currentAmount: 85000 },
    ],
    products: [
      { id: "p1", title: "Digital Art Pack", description: "10 high-res wallpapers for your devices.", price: 2500, type: "digital" },
    ],
    pageStyle: "hybrid",
  },
  {
    id: "2",
    username: "sarahdev",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    coverImage: "https://picsum.photos/seed/sarah-cover/1200/400",
    bio: "Open source developer building tools for the web.",
    category: "Developers",
    supporters: 890,
    rank: 2,
    links: [
      { id: "l1", title: "GitHub", url: "https://github.com/sarah" },
      { id: "l2", title: "Twitter", url: "https://twitter.com/sarahdev" },
    ],
    memberships: [
      { id: "m1", title: "Sponsor", price: 5000, description: "Monthly support for open source maintenance." },
    ],
    goals: [
      { id: "g1", title: "Upgrade CI Server", targetAmount: 200000, currentAmount: 120000 },
    ],
    products: [
      { id: "p1", title: "Advanced React Course", description: "Master React with real-world projects.", price: 15000, type: "digital" },
    ],
    pageStyle: "hybrid",
  },
  {
    id: "3",
    username: "writer_joe",
    name: "Joe Penna",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joe",
    coverImage: "https://picsum.photos/seed/joe-cover/1200/400",
    bio: "Weekly essays on philosophy, tech, and the future.",
    category: "Writers",
    supporters: 750,
    rank: 3,
    links: [
      { id: "l1", title: "Substack", url: "https://joe.substack.com" },
    ],
    memberships: [
      { id: "m1", title: "Premium Newsletter", price: 1000, description: "Exclusive weekly deep-dives." },
    ],
    goals: [],
    products: [
      { id: "p1", title: "The Modern Stoic", description: "My debut ebook on philosophy.", price: 3000, type: "digital" },
    ],
    pageStyle: "hybrid",
  },
  {
    id: "4",
    username: "pod_hub",
    name: "PodHub Community",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pod",
    coverImage: "https://picsum.photos/seed/pod-cover/1200/400",
    bio: "A community for independent podcasters to share resources.",
    category: "Communities",
    supporters: 2100,
    rank: 4,
    links: [
      { id: "l1", title: "Discord Server", url: "https://discord.gg/podhub" },
    ],
    memberships: [
      { id: "m1", title: "Community Member", price: 2000, description: "Access to private forums and events." },
    ],
    goals: [
      { id: "g1", title: "Host Annual Meetup", targetAmount: 500000, currentAmount: 150000 },
    ],
    products: [],
    pageStyle: "hybrid",
  },
  {
    id: "5",
    username: "maya_cooks",
    name: "Maya's Kitchen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    coverImage: "https://picsum.photos/seed/maya-cover/1200/400",
    bio: "Sharing traditional recipes with a modern twist.",
    category: "Content Creators",
    supporters: 560,
    rank: 5,
    links: [
      { id: "l1", title: "YouTube Channel", url: "https://youtube.com/mayacooks" },
    ],
    memberships: [
      { id: "m1", title: "Recipe Club", price: 1500, description: "New recipes every week + shopping lists." },
    ],
    goals: [],
    products: [
      { id: "p1", title: "Handmade Apron", description: "Durable and stylish kitchen companion.", price: 8000, type: "physical" },
    ],
    pageStyle: "hybrid",
  },
  {
    id: "6",
    username: "tech_tips",
    name: "TechTips Daily",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
    coverImage: "https://picsum.photos/seed/tech-cover/1200/400",
    bio: "Daily bite-sized tech news and productivity hacks.",
    category: "Content Creators",
    supporters: 1500,
    rank: 6,
    links: [
      { id: "l1", title: "Twitter", url: "https://twitter.com/techtips" },
    ],
    memberships: [
      { id: "m1", title: "Insider", price: 1000, description: "Ad-free experience and weekly summary." },
    ],
    goals: [
      { id: "g1", title: "New Camera Gear", targetAmount: 300000, currentAmount: 210000 },
    ],
    products: [],
    pageStyle: "hybrid",
  },
];
