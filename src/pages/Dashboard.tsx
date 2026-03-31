import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type FormEvent,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, User, Heart, Users, Target, ShoppingBag, Link as LinkIcon,
  LogOut, Plus, Edit2, Trash2, Check, Settings, Shield,
  TrendingUp, DollarSign, Image as ImageIcon, ExternalLink, Copy, Share2,
  Globe, Package, FileText, X, Menu, Square, Search, Loader2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useScrollLock } from "@/src/hooks/useScrollLock";
import SlateTab from "./SlateTab";
import ShopTab from "./ShopTab";
import WishlistTab from "./WishlistTab";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, convexUserId, isLoading: isAuthLoading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const currentUser = useQuery(api.users.currentUser);
  const SUPER_ADMIN_EMAIL = "riderezzy@gmail.com";
  const [showAdminButton, setShowAdminButton] = useState(false);

  useEffect(() => {
    if (currentUser === undefined) {
      return;
    }

    const isAdmin =
      currentUser?.role === "admin" ||
      currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    setShowAdminButton(!!isAdmin);
  }, [currentUser]);

  // Fetch live data from Convex
  const convexCreator = useQuery(api.creators.getCreatorByUserId, {
    userId: convexUserId as Id<"users"> | undefined
  });

  // Check for Pro/Shop subscription
  const subscription = useQuery(api.settings.getSubscription, {
    userId: convexUserId as Id<"users"> | undefined
  });
  const hasProFeatures = subscription?.plan === "premium" || subscription?.plan === "shop";

  // Convex mutations
  const updateCreator = useMutation(api.creators.updateCreator);
  const addLink = useMutation(api.creators.addLink);
  const updateLink = useMutation(api.creators.updateLink);
  const deleteLink = useMutation(api.creators.deleteLink);
  const addMembership = useMutation(api.creators.createMembership);
  const updateMembership = useMutation(api.creators.updateMembership);
  const deleteMembership = useMutation(api.creators.deleteMembership);
  const addGoal = useMutation(api.creators.createGoal);
  const updateGoal = useMutation(api.creators.updateGoal);
  const deleteGoal = useMutation(api.creators.deleteGoal);

  // Wishlist mutations
  const createWishlist = useMutation(api.wishlist.createWishlist);
  const updateWishlist = useMutation(api.wishlist.updateWishlist);
  const deleteWishlist = useMutation(api.wishlist.deleteWishlist);
  const contributeToWishlist = useMutation(api.wishlist.contributeToWishlist);
  const resetWishlist = useMutation(api.wishlist.resetWishlist);
  const wishlists = useQuery(api.wishlist.getWishlistsByCreator, {
    creatorId: convexCreator?._id as Id<"creators"> | undefined
  });

  // Mux actions for video upload
  const createVideoUpload = useAction(api.slates.createVideoUpload);
  const getVideoPlaybackInfo = useAction(api.slates.getVideoPlaybackInfo);
  const addProduct = useMutation(api.creators.createProduct);
  const updateProduct = useMutation(api.creators.updateProduct);
  const deleteProduct = useMutation(api.creators.deleteProduct);
  const generateUploadUrl = useMutation(api.creators.generateUploadUrl);

  // Slate mutations
  const createSlateMutation = useMutation(api.slates.createSlate);
  const deleteSlateMutation = useMutation(api.slates.deleteSlate);
  const slates = useQuery(api.slates.getSlatesByCreator, {
    creatorId: convexCreator?._id as Id<"creators"> | undefined
  });

  const createSlate = async (args: {
    creatorId: Id<"creators">;
    type: "text" | "image" | "video" | "audio";
    content?: string;
    mediaUrl?: string;
    playbackId?: string;
    visibility: "public" | "followers" | "supporters" | "members";
  }) => {
    return await createSlateMutation({
      ...args,
      tokenIdentifier: user?.uid,
    });
  };

  const deleteSlate = async (args: { slateId: Id<"slates"> }) => {
    return await deleteSlateMutation({
      ...args,
      tokenIdentifier: user?.uid,
    });
  };

  useEffect(() => {
    // If auth is done loading and we definitely don't have a creator profile in Convex
    if (!isAuthLoading && user && convexCreator === null) {
      navigate("/onboarding");
    }
  }, [isAuthLoading, user, convexCreator, navigate]);

  // Use Convex data, fallback to defaults while loading
  const profile = useMemo(() => convexCreator, [convexCreator]);
  const links = useMemo(() => convexCreator?.links || [], [convexCreator]);
  const memberships = useMemo(() => convexCreator?.memberships || [], [convexCreator]);
  const goals = useMemo(() => convexCreator?.goals || [], [convexCreator]);
  const products = useMemo(() => convexCreator?.products || [], [convexCreator]);
  const tips = useMemo(() => convexCreator?.tips || [], [convexCreator]);
  const totalRevenue = convexCreator?.totalRevenue ?? 0;
  const supporterCount = convexCreator?.supporterCount ?? 0;

  // Resolve avatar URL
  const avatarUrl = useMemo(() => {
    if (!profile) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName}`;
    return profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName}`;
  }, [profile, user]);

  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Profile form local state
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
    about: "",
    avatar: "",
    coverImage: ""
  });

  // Update local form when convex data arrives
  useEffect(() => {
    if (convexCreator) {
      console.log("Initializing profile form from Convex:", convexCreator);
      setProfileForm({
        username: convexCreator.username || "",
        bio: convexCreator.bio || "",
        about: (convexCreator as any).about || "",
        avatar: convexCreator.avatar || "",
        coverImage: convexCreator.coverImage || ""
      });
    }
  }, [convexCreator]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!convexCreator) return;
    
    console.log("Submitting profile changes:", profileForm);
    setIsSaving(true);
    try {
      await updateCreator({
        creatorId: convexCreator._id,
        username: profileForm.username,
        bio: profileForm.bio,
        about: profileForm.about,
        avatar: profileForm.avatar,
        coverImage: profileForm.coverImage,
      });
      console.log("Profile saved successfully");
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save changes.";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Modal states for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"link" | "membership" | "goal" | "product" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [productImage, setProductImage] = useState<string>("");
  const [productImagePreview, setProductImagePreview] = useState<string>("");
  const [isProductUploading, setIsProductUploading] = useState(false);
  const [productFile, setProductFile] = useState<string>("");
  const [productFileLabel, setProductFileLabel] = useState("");
  const [productType, setProductType] = useState<"digital" | "physical" | "ticket">("digital");
  const [hasExistingDigitalFile, setHasExistingDigitalFile] = useState(false);
  const [isProductFileUploading, setIsProductFileUploading] = useState(false);

  // Delete confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ type: string, id: string, title: string } | null>(null);

  // Cover image adjuster states
  const [isCoverAdjustOpen, setIsCoverAdjustOpen] = useState(false);
  const [coverImageAdjust, setCoverImageAdjust] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const coverAdjustRef = useRef<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modals are open
  useScrollLock(isModalOpen);
  useScrollLock(isDeleteModalOpen);
  useScrollLock(isCoverAdjustOpen);

  const handleSave = async () => {
    setIsSaving(true);
    // Data is saved directly to Convex via mutations, just show feedback
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 500);
  };

  const copyToClipboard = () => {
    const username = profile?.username || user?.displayName;
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const sharePage = async () => {
    const username = profile?.username || user?.displayName;
    const url = `${window.location.origin}/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DropSomething - ${username}`,
          text: `Check out my creator page!`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "my-page", label: "My Page", icon: Globe },
    { id: "profile", label: "Profile", icon: User },
    { id: "about", label: "About Us", icon: FileText },
    { id: "links", label: "Links", icon: LinkIcon },
    { id: "memberships", label: "Memberships", icon: Users },
    { id: "wishlist", label: "Wishlist", icon: Target },
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "slate", label: "Slate", icon: Square },
    { id: "explore", label: "Explore", icon: Search },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const openModal = (type: any, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === "product") {
      setProductImage(item?.image || "");
      setProductImagePreview(item?.image || "");
      setProductFile("");
      setProductType(item?.type || "digital");
      setHasExistingDigitalFile(Boolean(item?.hasDigitalFile));
      setProductFileLabel(item?.hasDigitalFile ? "Digital file already uploaded" : "");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setProductImage("");
    setProductImagePreview("");
    setProductFile("");
    setProductFileLabel("");
    setProductType("digital");
    setHasExistingDigitalFile(false);
    setIsProductUploading(false);
    setIsProductFileUploading(false);
  };

  const openDeleteModal = (type: string, id: string, title: string) => {
    setDeleteConfig({ type, id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfig || !convexCreator) return;
    const { type, id } = deleteConfig;
    
    try {
      if (type === "link") {
        await deleteLink({ linkId: id as Id<"links"> });
      } else if (type === "membership") {
        await deleteMembership({ membershipId: id as Id<"memberships"> });
      } else if (type === "goal") {
        await deleteGoal({ goalId: id as Id<"goals"> });
      } else if (type === "product") {
        await deleteProduct({ productId: id as Id<"products"> });
      }
    } catch (err) {
      console.error("Delete error:", err);
    }

    setIsDeleteModalOpen(false);
    setDeleteConfig(null);
  };

  // Handle product image upload
  const handleProductImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    // Immediate local feedback
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsProductUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();
      setProductImage(storageId);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
      setProductImage(editingItem?.image || "");
      setProductImagePreview(editingItem?.image || "");
    } finally {
      setIsProductUploading(false);
    }
  };

  const handleProductFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProductFileUploading(true);
    setProductFileLabel(file.name);

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      setProductFile(storageId);
    } catch (err) {
      console.error("Digital product upload error:", err);
      alert("Failed to upload digital product file. Please try again.");
      setProductFile("");
      setProductFileLabel(hasExistingDigitalFile ? "Digital file already uploaded" : "");
    } finally {
      setIsProductFileUploading(false);
      e.target.value = "";
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file || !convexCreator) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    // Immediate local feedback
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setIsSaving(true);
    try {
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 2. Upload file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();

      // 3. Update creator with storageId
      await updateCreator({
        creatorId: convexCreator._id,
        [field]: storageId,
      });
      
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
      // Reset to current profile value on failure
      if (convexCreator) {
        setProfileForm(prev => ({ ...prev, [field]: (convexCreator as any)[field] || "" }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Cover image adjustment handlers
  const handleOpenCoverAdjust = () => {
    // Initialize with saved position from profile if available
    const savedPosition = convexCreator?.coverPosition;
    if (savedPosition) {
      setCoverImageAdjust({ x: savedPosition.x, y: savedPosition.y, zoom: savedPosition.zoom });
      coverAdjustRef.current = { x: savedPosition.x, y: savedPosition.y, zoom: savedPosition.zoom };
    } else {
      setCoverImageAdjust({ x: 0, y: 0, zoom: 1 });
      coverAdjustRef.current = { x: 0, y: 0, zoom: 1 };
    }
    setIsCoverAdjustOpen(true);
  };

  const handleCoverMouseDown = (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent<HTMLDivElement>).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent<HTMLDivElement>).clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleCoverMouseMove = (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent<HTMLDivElement>).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent<HTMLDivElement>).clientY;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate image dimensions at current zoom
    const baseWidth = 1200;
    const baseHeight = 400;
    const scaledWidth = baseWidth * coverImageAdjust.zoom;
    const scaledHeight = baseHeight * coverImageAdjust.zoom;
    
    // Calculate max drag boundaries (prevent image from going completely out of frame)
    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    
    const newX = coverAdjustRef.current.x + deltaX;
    const newY = coverAdjustRef.current.y + deltaY;
    
    // Clamp position within boundaries
    const clampedX = Math.max(-maxX, Math.min(maxX, newX));
    const clampedY = Math.max(-maxY, Math.min(maxY, newY));
    
    setCoverImageAdjust(prev => ({ ...prev, x: clampedX, y: clampedY }));
    setDragStart({ x: clientX, y: clientY });
  };

  const handleCoverMouseUp = () => {
    setIsDragging(false);
    coverAdjustRef.current = { ...coverImageAdjust };
  };

  const handleCoverZoom = (direction: 'in' | 'out') => {
    setCoverImageAdjust(prev => {
      const newZoom = direction === 'in' ? Math.min(prev.zoom + 0.1, 3) : Math.max(prev.zoom - 0.1, 0.5);
      return { ...prev, zoom: newZoom };
    });
  };

  const handleSaveCoverAdjust = async () => {
    if (!convexCreator) return;
    
    try {
      await updateCreator({
        creatorId: convexCreator._id,
        coverPosition: {
          x: coverImageAdjust.x,
          y: coverImageAdjust.y,
          zoom: coverImageAdjust.zoom,
        },
      });
      setIsCoverAdjustOpen(false);
    } catch (err) {
      console.error("Failed to save cover position:", err);
      alert("Failed to save cover position. Please try again.");
    }
  };

  const handleResetCoverAdjust = () => {
    setCoverImageAdjust({ x: 0, y: 0, zoom: 1 });
    coverAdjustRef.current = { x: 0, y: 0, zoom: 1 };
  };

  // Handle profile update
  const handleProfileUpdate = async (field: string, value: string) => {
    if (!convexCreator) return;
    try {
      await updateCreator({
        creatorId: convexCreator._id,
        [field]: value,
      });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Handle CRUD operations with Convex
  const handleAddLink = async (data: { title: string; url: string }) => {
    if (!convexCreator) return;
    await addLink({ creatorId: convexCreator._id, ...data });
  };

  const handleUpdateLink = async (id: string, data: { title?: string; url?: string }) => {
    await updateLink({ linkId: id as Id<"links">, ...data });
  };

  const handleAddMembership = async (data: { title: string; price: number; description: string }) => {
    if (!convexCreator) return;
    await addMembership({ creatorId: convexCreator._id, ...data });
  };

  const handleUpdateMembership = async (id: string, data: { title?: string; price?: number; description?: string }) => {
    await updateMembership({ membershipId: id as Id<"memberships">, ...data });
  };

  const handleAddGoal = async (data: { title: string; targetAmount: number }) => {
    if (!convexCreator) return;
    await addGoal({ creatorId: convexCreator._id, ...data });
  };

  const handleUpdateGoal = async (id: string, data: { title?: string; targetAmount?: number; currentAmount?: number }) => {
    await updateGoal({ goalId: id as Id<"goals">, ...data });
  };

  const handleAddProduct = async (data: {
    title: string;
    description: string;
    price: number;
    type: "digital" | "physical" | "ticket";
    stock?: number;
    image?: string;
    fileUrl?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    locationAddress?: string;
    ticketType?: string;
  }) => {
    if (!convexCreator) return;
    await addProduct({ creatorId: convexCreator._id, ...data });
  };

  const handleUpdateProduct = async (id: string, data: {
    title?: string;
    description?: string;
    price?: number;
    type?: "digital" | "physical" | "ticket";
    stock?: number;
    image?: string;
    fileUrl?: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    locationAddress?: string;
    ticketType?: string;
  }) => {
    await updateProduct({ productId: id as Id<"products">, ...data });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (!convexCreator) return null;

  return (
    <div className="flex min-h-screen bg-black/5 transition-colors duration-300">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-black/5 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between px-4 py-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Heart size={18} />
              </div>
              <span className="text-lg font-bold text-black">DropSomething</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-full p-2 text-black/40 hover:bg-black/5 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "settings") {
                    navigate("/settings");
                    return;
                  }
                  if (item.id === "explore") {
                    window.open("/explore", "_blank", "noopener,noreferrer");
                    return;
                  }
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-black/40 hover:bg-black/5 hover:text-black"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Admin Button - Only for super admin */}
          {showAdminButton && (
            <div className="mt-4 pt-4 border-t border-black/5">
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
              >
                <Shield size={20} />
                Admin Panel
              </Link>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-black/5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl p-2 text-black/60 hover:bg-black/5 md:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-black capitalize">{activeTab.replace("-", " ")}</h1>
            </div>
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {showSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600"
                  >
                    <Check size={16} />
                    Saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Total Support", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
                    { label: "Total Supporters", value: supporterCount, icon: Heart, color: "text-rose-500" },
                    { label: "Active Members", value: memberships.length, icon: Users, color: "text-blue-500" },
                    { label: "Goal Progress", value: goals.length > 0 ? `${Math.round((goals[0].currentAmount / goals[0].targetAmount) * 100)}%` : "0%", icon: TrendingUp, color: "text-amber-500" },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-black/5", stat.color)}>
                        <stat.icon size={20} />
                      </div>
                      <p className="mt-4 text-sm font-medium text-black/40">{stat.label}</p>
                      <p className="mt-1 text-2xl font-black text-black">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-black">Recent Activity</h2>
                    <div className="mt-6 space-y-4">
                      {tips.length === 0 ? (
                        <p className="text-sm text-black/40 text-center py-8">No activity yet</p>
                      ) : (
                        tips.slice(0, 5).map((item) => {
                          const timeAgo = (date: string) => {
                            const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                            if (seconds < 60) return "just now";
                            const minutes = Math.floor(seconds / 60);
                            if (minutes < 60) return `${minutes}m ago`;
                            const hours = Math.floor(minutes / 60);
                            if (hours < 24) return `${hours}h ago`;
                            return `${Math.floor(hours / 24)}d ago`;
                          };
                          return (
                            <div key={item._id} className="flex items-center justify-between rounded-2xl bg-black/5 p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.supporterName}`} alt="" referrerPolicy="no-referrer" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-black">{item.supporterName}</p>
                                  <p className="text-xs text-black/40 capitalize">{item.type}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-black">₦{item.amount.toLocaleString()}</p>
                                <p className="text-xs text-black/40">{timeAgo(item._creationTime)}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-black">Quick Actions</h2>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <a
                        href={`/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-black/5 p-6 transition-colors hover:bg-black hover:text-white"
                      >
                        <ExternalLink size={24} />
                        <span className="text-xs font-bold">View Public Page</span>
                      </a>
                      <button
                        onClick={() => openModal("goal")}
                        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-black/5 p-6 transition-colors hover:bg-black hover:text-white"
                      >
                        <Target size={24} />
                        <span className="text-xs font-bold">New Goal</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "my-page" && (
              <motion.div
                key="my-page"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 overflow-hidden rounded-3xl bg-black/5 ring-4 ring-white shadow-sm">
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-black">@{profile.username}</h2>
                    <a
                      href={`/${profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors"
                    >
                      <ExternalLink size={14} />
                      View live page
                    </a>
                    <p className="mt-2 text-black/60">{profile.bio || "No bio yet"}</p>

                    <div className="mt-8 flex w-full flex-col gap-3">
                      <a
                        href={`/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ExternalLink size={20} />
                        View Public Page
                      </a>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-4 font-bold text-black transition-all hover:bg-black/5"
                        >
                          {isCopied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                          {isCopied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                          onClick={sharePage}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-4 font-bold text-black transition-all hover:bg-black/5"
                        >
                          <Share2 size={20} />
                          Share Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                  <div className="space-y-8">
                    {/* Cover Image */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40">Cover Image</label>
                      <div className="mt-2 space-y-3">
                        <div className="group relative h-40 w-full overflow-hidden rounded-2xl bg-black/5 border border-black/5">
                          <img 
                            src={profileForm.coverImage || "https://picsum.photos/seed/cover/1200/400"} 
                            alt="" 
                            className="h-full w-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                            <ImageIcon size={32} />
                            <span className="mt-2 text-xs font-bold">Change Cover</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, 'coverImage')}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenCoverAdjust}
                          className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black transition-all hover:bg-black/5"
                        >
                          Adjust Position & Zoom
                        </button>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="group relative h-24 w-24 overflow-hidden rounded-3xl bg-black/5 border border-black/5">
                        <img 
                          src={profileForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileForm.username}`} 
                          alt="" 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                          <ImageIcon size={24} />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'avatar')}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="font-bold text-black">Profile Picture</h3>
                        <p className="text-sm text-black/40">Recommended: 400x400px</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-black/40">Username</label>
                        <div className="mt-2 flex items-center rounded-xl border border-black/10 bg-black/5 px-4 focus-within:border-black/30">
                          <span className="text-black/40">dropsomething.com/</span>
                          <input
                            type="text"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                            className="h-12 flex-1 bg-transparent text-sm font-medium text-black focus:outline-none"
                            placeholder="username"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-black/40">Bio</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                          rows={2}
                          className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black focus:border-black/30 focus:outline-none"
                          placeholder="Short bio for your profile..."
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <Check size={20} />
                            Save Profile Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-black">About Us / Detailed Bio</h2>
                      <p className="text-sm text-black/40">This information will be displayed on your profile's about page.</p>
                    </div>
                    <div>
                      <textarea
                        value={profileForm.about}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, about: e.target.value }))}
                        rows={12}
                        className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black focus:border-black/30 focus:outline-none"
                        placeholder="Tell your supporters more about what you do, your mission, and why they should support you..."
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <Check size={20} />
                            Save About Us Info
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "links" && (
              <motion.div
                key="links"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">External Links</h2>
                    <p className="text-sm text-black/40">Add links to your social media or portfolio.</p>
                  </div>
                  <button
                    onClick={() => openModal("link")}
                    className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                    Add Link
                  </button>
                </div>

                <div className="space-y-4">
                  {links.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
                      <LinkIcon size={40} className="text-black/20" />
                      <p className="mt-4 font-bold text-black/40">No links added yet</p>
                    </div>
                  ) : (
                    links.map((link) => (
                      <div key={link._id} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black">
                          <LinkIcon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-black">{link.title}</p>
                          <p className="truncate text-xs text-black/40">{link.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("link", link)}
                            className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal("link", link._id, link.title)}
                            className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "memberships" && (
              <motion.div
                key="memberships"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">Membership Tiers</h2>
                    <p className="text-sm text-black/40">Create recurring support plans for your fans.</p>
                  </div>
                  <button
                    onClick={() => openModal("membership")}
                    className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                    Add Tier
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {memberships.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
                      <Users size={40} className="text-black/20" />
                      <p className="mt-4 font-bold text-black/40">No membership tiers yet</p>
                    </div>
                  ) : (
                    memberships.map((tier) => (
                      <div key={tier._id} className="group relative rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-black">{tier.title}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal("membership", tier)}
                              className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal("membership", tier._id, tier.title)}
                              className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-black/60 line-clamp-2">{tier.description}</p>
                        <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                          <span className="text-lg font-black text-black">₦{tier.price.toLocaleString()}/mo</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <WishlistTab
                wishlists={wishlists || []}
                createWishlist={createWishlist}
                updateWishlist={updateWishlist}
                deleteWishlist={deleteWishlist}
                resetWishlist={resetWishlist}
                convexCreator={convexCreator}
              />
            )}

            {activeTab === "shop" && (
              <ShopTab
                products={products}
                openModal={openModal}
                openDeleteModal={openDeleteModal}
              />
            )}

            {activeTab === "slate" && (
              <SlateTab
                convexCreator={convexCreator}
                createSlate={createSlate}
                deleteSlate={deleteSlate}
                slates={slates || []}
                generateUploadUrl={generateUploadUrl}
                hasProFeatures={!!hasProFeatures}
                createVideoUpload={createVideoUpload}
                getVideoPlaybackInfo={getVideoPlaybackInfo}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative mx-auto my-4 flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-8 sm:max-h-[calc(100vh-4rem)]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-black/5 p-6">
                <h3 className="text-xl font-bold text-black">
                  {editingItem ? "Edit" : "Add New"} {modalType}
                </h3>
                <button onClick={closeModal} className="rounded-full p-2 hover:bg-black/5">
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data: any = Object.fromEntries(formData.entries());

                  // Convert numeric fields
                  if (data.price) data.price = parseInt(data.price);
                  if (data.targetAmount) data.targetAmount = parseInt(data.targetAmount);
                  if (data.stock) data.stock = parseInt(data.stock);

                  try {
                    if (modalType === "link") {
                      if (editingItem) {
                        await handleUpdateLink(editingItem._id, data);
                      } else {
                        await handleAddLink(data);
                      }
                    } else if (modalType === "membership") {
                      if (editingItem) {
                        await handleUpdateMembership(editingItem._id, data);
                      } else {
                        await handleAddMembership(data);
                      }
                    } else if (modalType === "goal") {
                      if (editingItem) {
                        await handleUpdateGoal(editingItem._id, data);
                      } else {
                        await handleAddGoal(data);
                      }
                    } else if (modalType === "product") {
                      if (data.type === "digital" && !productFile && !hasExistingDigitalFile) {
                        throw new Error("Upload the digital product file before listing it.");
                      }

                      if (data.type === "ticket" && (!data.eventDate || !data.eventTime || !data.venue || !data.locationAddress || !data.ticketType)) {
                        throw new Error("Tickets need event date, time, venue, address, and ticket type.");
                      }

                      const productData = {
                        ...data,
                        image: productImage || undefined,
                        fileUrl: data.type === "digital" ? productFile || undefined : undefined,
                        stock: data.type === "physical" || data.type === "ticket" ? data.stock : undefined,
                      };
                      if (editingItem) {
                        await handleUpdateProduct(editingItem._id, productData);
                      } else {
                        await handleAddProduct(productData);
                      }
                    }

                    closeModal();
                    setShowSaved(true);
                    setTimeout(() => setShowSaved(false), 3000);
                  } catch (err) {
                    console.error("Save error:", err);
                    const errorMessage = err instanceof Error ? err.message : "Failed to save. Please try again.";
                    alert(errorMessage);
                  }
                }}
                className="space-y-4 overflow-y-auto p-6"
              >
                {modalType === "link" && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">URL</label>
                      <input name="url" type="url" defaultValue={editingItem?.url} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                  </>
                )}

                {modalType === "membership" && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Tier Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Price (₦/mo)</label>
                      <input name="price" type="number" defaultValue={editingItem?.price} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Description</label>
                      <textarea name="description" defaultValue={editingItem?.description} required rows={3} className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                  </>
                )}

                {modalType === "goal" && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Goal Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Target Amount (₦)</label>
                      <input name="targetAmount" type="number" defaultValue={editingItem?.targetAmount} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                  </>
                )}

                {modalType === "product" && (
                  <>
                    <div className="flex flex-col items-center">
                      <div className="group relative h-40 w-full overflow-hidden rounded-2xl bg-black/5 border border-black/5">
                        {productImagePreview ? (
                          <img 
                            src={productImagePreview}
                            alt="" 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-black/20">
                            <ImageIcon size={48} />
                            <span className="mt-2 text-xs font-bold uppercase tracking-wider">Product Image</span>
                          </div>
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                          {isProductUploading ? (
                            <Loader2 className="animate-spin" size={32} />
                          ) : (
                            <>
                              <ImageIcon size={32} />
                              <span className="mt-2 text-xs font-bold">Upload Image</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleProductImageUpload}
                            disabled={isProductUploading}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">
                        {productType === "ticket" ? "Event Name" : "Product Name"}
                      </label>
                      <input name="title" defaultValue={editingItem?.title} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-black/40">
                          {productType === "ticket" ? "Price Per Ticket (₦)" : "Price (₦)"}
                        </label>
                        <input name="price" type="number" defaultValue={editingItem?.price} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-black/40">Type</label>
                        <select
                          name="type"
                          value={productType}
                          onChange={(e) => setProductType(e.target.value as "digital" | "physical" | "ticket")}
                          className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none"
                        >
                          <option value="digital">Digital</option>
                          <option value="physical">Physical</option>
                          <option value="ticket">Ticket</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">
                        {productType === "ticket" ? "Event Description" : "Description"}
                      </label>
                      <textarea name="description" defaultValue={editingItem?.description} required rows={2} className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    {productType === "digital" ? (
                      <div>
                        <label className="text-xs font-bold uppercase text-black/40">Digital Product File</label>
                        <div className="mt-1 rounded-2xl border border-black/10 bg-black/5 p-4">
                          <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-black/20 px-4 py-6 text-center text-sm font-bold text-black/50 transition-colors hover:border-black/40 hover:text-black/70">
                            {isProductFileUploading ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                Uploading file...
                              </span>
                            ) : (
                              "Upload digital file"
                            )}
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleProductFileUpload}
                              disabled={isProductFileUploading}
                            />
                          </label>
                          <p className="mt-3 text-sm font-medium text-black">
                            {productFileLabel || "No digital file uploaded yet"}
                          </p>
                          <p className="mt-1 text-xs text-black/40">
                            Buyers will get this file to download after payment. File type is unrestricted.
                          </p>
                        </div>
                      </div>
                    ) : productType === "ticket" ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold uppercase text-black/40">Event Date</label>
                            <input name="eventDate" type="date" defaultValue={editingItem?.eventDate || ""} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase text-black/40">Event Time</label>
                            <input name="eventTime" type="time" defaultValue={editingItem?.eventTime || ""} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold uppercase text-black/40">Ticket Type</label>
                            <input name="ticketType" defaultValue={editingItem?.ticketType || ""} required placeholder="General Admission" className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase text-black/40">Available Quantity</label>
                            <input name="stock" type="number" defaultValue={editingItem?.stock || 0} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" placeholder="100" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-black/40">Venue</label>
                          <input name="venue" defaultValue={editingItem?.venue || ""} required placeholder="Landmark Event Centre" className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-black/40">Venue Address</label>
                          <textarea name="locationAddress" defaultValue={editingItem?.locationAddress || ""} required rows={2} placeholder="Full event address" className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="text-xs font-bold uppercase text-black/40">Stock</label>
                        <input name="stock" type="number" defaultValue={editingItem?.stock || 0} className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" placeholder="Stock count (for physical products)" />
                      </div>
                    )}
                  </>
                )}

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-bold">Cancel</button>
                  <button type="submit" className="flex-1 rounded-xl bg-black py-3 text-sm font-bold text-white">
                    {editingItem ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-black">Delete {deleteConfig?.type}?</h3>
                <p className="mt-2 text-sm text-black/60">
                  Are you sure you want to delete <span className="font-bold text-black">"{deleteConfig?.title}"</span>? This action cannot be undone.
                </p>
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-bold text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cover Image Adjuster Modal */}
      <AnimatePresence>
        {isCoverAdjustOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCoverAdjustOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="p-8">
                <h3 className="text-xl font-bold text-black">Adjust Cover Image</h3>
                <p className="mt-1 text-sm text-black/60">Drag to reposition, use buttons to zoom</p>

                <div className="mt-6 space-y-4">
                  {/* Preview with drag controls */}
                  <div
                    ref={containerRef}
                    className="relative h-64 w-full overflow-hidden rounded-2xl bg-black/5 border border-black/10 cursor-grab active:cursor-grabbing touch-none"
                    onMouseDown={handleCoverMouseDown}
                    onMouseMove={handleCoverMouseMove}
                    onMouseUp={handleCoverMouseUp}
                    onMouseLeave={handleCoverMouseUp}
                    onTouchStart={handleCoverMouseDown}
                    onTouchMove={handleCoverMouseMove}
                    onTouchEnd={handleCoverMouseUp}
                  >
                    <img
                      src={profileForm.coverImage || "https://picsum.photos/seed/cover/1200/400"}
                      alt=""
                      className="h-full w-full select-none pointer-events-none"
                      style={{
                        transform: `translate(${coverImageAdjust.x}px, ${coverImageAdjust.y}px) scale(${coverImageAdjust.zoom})`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        objectFit: 'cover',
                      }}
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-black/20" />
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleCoverZoom('out')}
                      className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black transition-all hover:bg-black/5 disabled:opacity-50"
                      disabled={coverImageAdjust.zoom <= 0.5}
                    >
                      − Zoom Out
                    </button>
                    <span className="text-sm font-bold text-black/60 min-w-16 text-center">
                      {Math.round(coverImageAdjust.zoom * 100)}%
                    </span>
                    <button
                      onClick={() => handleCoverZoom('in')}
                      className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black transition-all hover:bg-black/5 disabled:opacity-50"
                      disabled={coverImageAdjust.zoom >= 3}
                    >
                      + Zoom In
                    </button>
                  </div>

                  {/* Reset button */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleResetCoverAdjust}
                      className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black transition-all hover:bg-black/5"
                    >
                      Reset Position
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsCoverAdjustOpen(false)}
                    className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-bold text-black transition-all hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCoverAdjust}
                    className="flex-1 rounded-xl bg-black py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Done
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
