import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, User, Heart, Users, Target, ShoppingBag, Link as LinkIcon, 
  LogOut, Plus, Edit2, Trash2, Check, 
  TrendingUp, DollarSign, Image as ImageIcon, ExternalLink, Copy, Share2,
  Globe, Package, FileText, X, Menu
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useData } from "@/src/context/DataContext";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const { 
    creator: profile, updateProfile,
    links, addLink, updateLink, deleteLink,
    memberships, addMembership, updateMembership, deleteMembership,
    goals, addGoal, updateGoal, deleteGoal,
    products, addProduct, updateProduct, deleteProduct
  } = useData();

  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Modal states for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"link" | "membership" | "goal" | "product" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Delete confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ type: string, id: string, title: string } | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 1000);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const sharePage = async () => {
    const url = `${window.location.origin}/${profile.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DropSomething - ${profile.username}`,
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
    { id: "links", label: "Links", icon: LinkIcon },
    { id: "memberships", label: "Memberships", icon: Users },
    { id: "goals", label: "Goals", icon: Target },
    { id: "shop", label: "Shop", icon: ShoppingBag },
  ];

  const openModal = (type: any, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  const openDeleteModal = (type: string, id: string, title: string) => {
    setDeleteConfig({ type, id, title });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteConfig) return;
    const { type, id } = deleteConfig;
    if (type === "link") deleteLink(id);
    else if (type === "membership") deleteMembership(id);
    else if (type === "goal") deleteGoal(id);
    else if (type === "product") deleteProduct(id);
    
    setIsDeleteModalOpen(false);
    setDeleteConfig(null);
    handleSave();
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
                    Changes saved
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex h-10 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
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
                    { label: "Total Support", value: `₦450,000`, icon: DollarSign, color: "text-emerald-600" },
                    { label: "Recent Drops", value: "124", icon: Heart, color: "text-rose-500" },
                    { label: "Active Members", value: memberships.length, icon: Users, color: "text-blue-500" },
                    { label: "Goal Progress", value: "65%", icon: TrendingUp, color: "text-amber-500" },
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
                      {[
                        { name: "John D.", amount: 1000, type: "tip", time: "2h ago" },
                        { name: "Sarah W.", amount: 500, type: "tip", time: "5h ago" },
                        { name: "Mike R.", amount: 5000, type: "membership", time: "1d ago" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-2xl bg-black/5 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} alt="" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">{item.name}</p>
                              <p className="text-xs text-black/40 capitalize">{item.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-black">₦{item.amount}</p>
                            <p className="text-xs text-black/40">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-black">Quick Actions</h2>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Link 
                        to={`/${profile.username}`}
                        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-black/5 p-6 transition-colors hover:bg-black hover:text-white"
                      >
                        <ExternalLink size={24} />
                        <span className="text-xs font-bold">View Public Page</span>
                      </Link>
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
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-black/5">
                      <img src={profile.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-black">@{profile.username}</h2>
                    <p className="mt-2 text-black/60">{profile.bio}</p>
                    
                    <div className="mt-8 flex w-full flex-col gap-3">
                      <Link 
                        to={`/${profile.username}`}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ExternalLink size={20} />
                        View Public Page
                      </Link>
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
                <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                  <div className="space-y-8">
                    {/* Cover Image */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-black/40">Cover Image</label>
                      <div className="group relative mt-2 h-40 w-full overflow-hidden rounded-2xl bg-black/5">
                        <img src={profile.coverImage} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <button className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <ImageIcon size={32} />
                          <span className="mt-2 text-xs font-bold">Change Cover</span>
                        </button>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="group relative h-24 w-24 overflow-hidden rounded-3xl bg-black/5">
                        <img src={profile.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <ImageIcon size={24} />
                        </button>
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
                            value={profile.username}
                            onChange={(e) => updateProfile({ username: e.target.value })}
                            className="h-12 flex-1 bg-transparent text-sm font-medium text-black focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-black/40">Bio</label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => updateProfile({ bio: e.target.value })}
                          rows={4}
                          className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-4 text-sm font-medium text-black focus:border-black/30 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
                      <div key={link.id} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
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
                            onClick={() => openDeleteModal("link", link.id, link.title)}
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
                      <div key={tier.id} className="group relative rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
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
                              onClick={() => openDeleteModal("membership", tier.id, tier.title)}
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

            {activeTab === "goals" && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">Funding Goals</h2>
                    <p className="text-sm text-black/40">Track progress towards specific targets.</p>
                  </div>
                  <button 
                    onClick={() => openModal("goal")}
                    className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                    New Goal
                  </button>
                </div>

                <div className="space-y-6">
                  {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
                      <Target size={40} className="text-black/20" />
                      <p className="mt-4 font-bold text-black/40">No goals set yet</p>
                    </div>
                  ) : (
                    goals.map((goal) => {
                      const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                      return (
                        <div key={goal.id} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-black">{goal.title}</h4>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openModal("goal", goal)}
                                className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => openDeleteModal("goal", goal.id, goal.title)}
                                className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-black">₦{goal.currentAmount.toLocaleString()}</span>
                              <span className="text-black/40">₦{goal.targetAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-black/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-black"
                              />
                            </div>
                            <p className="text-right text-xs font-bold text-black">{Math.round(progress)}% reached</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "shop" && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">Products</h2>
                    <p className="text-sm text-black/40">Manage your digital and physical offerings.</p>
                  </div>
                  <button 
                    onClick={() => openModal("product")}
                    className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                    Add Product
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {products.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
                      <ShoppingBag size={40} className="text-black/20" />
                      <p className="mt-4 font-bold text-black/40">No products in your shop</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            product.type === "digital" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {product.type}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openModal("product", product)}
                              className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => openDeleteModal("product", product.id, product.name)}
                              className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h4 className="mt-4 text-lg font-bold text-black">{product.name}</h4>
                        <p className="mt-1 text-sm text-black/60 line-clamp-2">{product.description}</p>
                        <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                          <span className="text-lg font-black text-black">₦{product.price.toLocaleString()}</span>
                          <span className="text-xs font-medium text-black/40">
                            {product.type === "physical" ? `${product.stock} in stock` : "Digital"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/5 p-6">
                <h3 className="text-xl font-bold text-black">
                  {editingItem ? "Edit" : "Add New"} {modalType}
                </h3>
                <button onClick={closeModal} className="rounded-full p-2 hover:bg-black/5">
                  <X size={20} />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data: any = Object.fromEntries(formData.entries());
                  
                  // Convert numeric fields
                  if (data.price) data.price = parseInt(data.price);
                  if (data.targetAmount) data.targetAmount = parseInt(data.targetAmount);
                  if (data.stock) data.stock = parseInt(data.stock);

                  if (modalType === "link") {
                    editingItem ? updateLink(editingItem.id, data) : addLink(data);
                  } else if (modalType === "membership") {
                    editingItem ? updateMembership(editingItem.id, data) : addMembership(data);
                  } else if (modalType === "goal") {
                    editingItem ? updateGoal(editingItem.id, data) : addGoal(data);
                  } else if (modalType === "product") {
                    editingItem ? updateProduct(editingItem.id, data) : addProduct(data);
                  }
                  
                  closeModal();
                  handleSave();
                }}
                className="p-6 space-y-4"
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
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Product Name</label>
                      <input name="name" defaultValue={editingItem?.name} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-black/40">Price (₦)</label>
                        <input name="price" type="number" defaultValue={editingItem?.price} required className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-black/40">Type</label>
                        <select name="type" defaultValue={editingItem?.type || "digital"} className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none">
                          <option value="digital">Digital</option>
                          <option value="physical">Physical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Description</label>
                      <textarea name="description" defaultValue={editingItem?.description} required rows={2} className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-black/40">Stock / File Info</label>
                      <input name="stock" type="number" defaultValue={editingItem?.stock || 0} className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none" placeholder="Stock count or file details" />
                    </div>
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
    </div>
  );
}
