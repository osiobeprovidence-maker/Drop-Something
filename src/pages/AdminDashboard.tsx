import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, FileText, MessageCircle, ShoppingBag,
  Flag, LogOut, Shield, Ban, Trash2, Check, X, AlertCircle,
  TrendingUp, Activity, DollarSign, Package
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type AdminTab = "overview" | "users" | "slate" | "comments" | "shop" | "reports";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, signOut, convexUserId, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const currentUser = useQuery(api.users.currentUser);
  const isAdmin = currentUser?.role === "admin";

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2 px-4 py-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
              <Shield size={18} />
            </div>
            <span className="text-lg font-bold text-black">Admin Panel</span>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "users", label: "Users", icon: Users },
              { id: "slate", label: "Slate", icon: FileText },
              { id: "comments", label: "Comments", icon: MessageCircle },
              { id: "shop", label: "Shop", icon: ShoppingBag },
              { id: "reports", label: "Reports", icon: Flag },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
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
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              >
                <LayoutDashboard size={24} />
              </button>
              <h1 className="text-xl font-bold text-black capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield size={16} />
              <span>Admin Access</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "slate" && <SlateTab />}
            {activeTab === "comments" && <CommentsTab />}
            {activeTab === "shop" && <ShopTab />}
            {activeTab === "reports" && <ReportsTab />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ==================== OVERVIEW TAB ====================

function OverviewTab() {
  const stats = useQuery(api.admin.getOverviewStats);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
          { label: "Slate Posts", value: stats.totalSlates, icon: FileText, color: "text-purple-600" },
          { label: "Comments", value: stats.totalComments, icon: MessageCircle, color: "text-green-600" },
          { label: "Creators", value: stats.totalCreators, icon: Activity, color: "text-pink-600" },
          { label: "Products", value: stats.totalProducts, icon: Package, color: "text-amber-600" },
          { label: "Pending Reports", value: stats.pendingReports, icon: Flag, color: "text-red-600" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100", stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-black">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ==================== USERS TAB ====================

function UsersTab() {
  const users = useQuery(api.admin.getAllUsers);
  const updateUserRole = useMutation(api.admin.updateUserRole);
  const banUser = useMutation(api.admin.banUser);

  if (!users) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-black">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "rounded-full px-2 py-1 text-xs font-bold uppercase",
                    user.role === "admin" ? "bg-purple-100 text-purple-700" :
                    user.role === "banned" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {user.role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => updateUserRole({ userId: user._id, role: "admin" })}
                        className="rounded-lg p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                        title="Make Admin"
                      >
                        <Shield size={16} />
                      </button>
                    )}
                    {user.role !== "banned" && (
                      <button
                        onClick={() => {
                          if (confirm("Ban this user?")) {
                            banUser({ userId: user._id, reason: "Admin action" });
                          }
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Ban User"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ==================== SLATE TAB ====================

function SlateTab() {
  const slates = useQuery(api.admin.getAllSlates);
  const deleteSlate = useMutation(api.admin.deleteSlate);

  if (!slates) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {slates.length === 0 ? (
        <EmptyState message="No Slate posts found" />
      ) : (
        slates.map((slate) => (
          <div key={slate._id} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    slate.type === "text" ? "bg-blue-100 text-blue-700" :
                    slate.type === "image" ? "bg-purple-100 text-purple-700" :
                    slate.type === "video" ? "bg-pink-100 text-pink-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {slate.type}
                  </span>
                  <span className="text-xs text-gray-500">@{slate.creatorUsername}</span>
                </div>
                {slate.content && (
                  <p className="text-sm text-gray-600 line-clamp-2">{slate.content}</p>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this post?")) {
                    deleteSlate({ slateId: slate._id });
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}

// ==================== COMMENTS TAB ====================

function CommentsTab() {
  const comments = useQuery(api.admin.getAllComments);
  const deleteComment = useMutation(api.admin.deleteComment);

  if (!comments) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {comments.length === 0 ? (
        <EmptyState message="No comments found" />
      ) : (
        comments.map((comment) => (
          <div key={comment._id} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{comment.userName}</p>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this comment?")) {
                    deleteComment({ commentId: comment._id });
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}

// ==================== SHOP TAB ====================

function ShopTab() {
  const products = useQuery(api.admin.getAllProducts);
  const deleteProduct = useMutation(api.admin.deleteProduct);

  if (!products) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {products.length === 0 ? (
        <EmptyState message="No products found" />
      ) : (
        products.map((product) => (
          <div key={product._id} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-black">{product.title}</span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    product.type === "digital" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {product.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">@{product.creatorUsername}</p>
                <p className="text-lg font-black text-black mt-2">₦{product.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove this product?")) {
                    deleteProduct({ productId: product._id });
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}

// ==================== REPORTS TAB ====================

function ReportsTab() {
  const reports = useQuery(api.admin.getReports, { status: "pending" });
  const updateReportStatus = useMutation(api.admin.updateReportStatus);

  if (!reports) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Check size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-bold text-black">All caught up!</h3>
          <p className="text-sm text-gray-500 mt-1">No pending reports</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report._id} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flag size={16} className="text-red-500" />
                  <span className="text-sm font-bold text-black capitalize">{report.type}</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-700">
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.reason}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateReportStatus({ reportId: report._id, status: "resolved" });
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:text-green-600 hover:bg-green-50"
                  title="Resolve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    updateReportStatus({ reportId: report._id, status: "dismissed" });
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}

// ==================== HELPER COMPONENTS ====================

function LoadingState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
      <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-bold text-black">{message}</h3>
    </div>
  );
}
