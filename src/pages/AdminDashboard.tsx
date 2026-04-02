import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, MessageCircle, ShoppingBag,
  Flag, Shield, Ban, Trash2, Check, X, AlertCircle,
  Activity, Package
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAdmin } from "@/src/context/AdminContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type AdminTab = "overview" | "users" | "slate" | "comments" | "shop" | "reports";

function useAdminQueryArgs() {
  const { sessionToken } = useAdmin();
  return { sessionToken: sessionToken ?? undefined };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
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

          <div className="mt-auto border-t border-gray-200 pt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <LayoutDashboard size={20} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </aside>

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
              <h1 className="text-xl font-bold capitalize text-black">{activeTab}</h1>
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

function OverviewTab() {
  const adminQueryArgs = useAdminQueryArgs();
  const stats = useQuery(api.admin.getOverviewStats, adminQueryArgs);

  if (!stats) {
    return <LoadingState />;
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

function UsersTab() {
  const adminQueryArgs = useAdminQueryArgs();
  const users = useQuery(api.admin.getAllUsers, adminQueryArgs);
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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              (() => {
                const userRole = user.role as "user" | "admin" | "banned" | undefined;
                const isBanned = userRole === "banned";

                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-black">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-bold uppercase",
                          userRole === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : isBanned
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {userRole || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {userRole !== "admin" && (
                          <button
                            onClick={() =>
                              updateUserRole({
                                sessionToken: adminQueryArgs.sessionToken,
                                userId: user._id,
                                role: "admin",
                              })
                            }
                            className="rounded-lg p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                            title="Make Admin"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        {!isBanned && (
                          <button
                            onClick={() => {
                              if (confirm("Ban this user?")) {
                                banUser({
                                  sessionToken: adminQueryArgs.sessionToken,
                                  userId: user._id,
                                  reason: "Admin action",
                                });
                              }
                            }}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Ban User"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })()
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function SlateTab() {
  const adminQueryArgs = useAdminQueryArgs();
  const slates = useQuery(api.admin.getAllSlates, adminQueryArgs);
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
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      slate.type === "text"
                        ? "bg-blue-100 text-blue-700"
                        : slate.type === "image"
                          ? "bg-purple-100 text-purple-700"
                          : slate.type === "video"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {slate.type}
                  </span>
                  <span className="text-xs text-gray-500">@{slate.creatorUsername}</span>
                </div>
                {slate.content && <p className="line-clamp-2 text-sm text-gray-600">{slate.content}</p>}
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this post?")) {
                    deleteSlate({ sessionToken: adminQueryArgs.sessionToken, slateId: slate._id });
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
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

function CommentsTab() {
  const adminQueryArgs = useAdminQueryArgs();
  const comments = useQuery(api.admin.getAllComments, adminQueryArgs);
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
                <p className="mb-1 text-sm font-medium text-gray-900">{comment.userName}</p>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this comment?")) {
                    deleteComment({ sessionToken: adminQueryArgs.sessionToken, commentId: comment._id });
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
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

function ShopTab() {
  const adminQueryArgs = useAdminQueryArgs();
  const products = useQuery(api.admin.getAllProducts, adminQueryArgs);
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
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-black">{product.title}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      product.type === "digital"
                        ? "bg-emerald-100 text-emerald-700"
                        : product.type === "ticket"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    {product.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">@{product.creatorUsername}</p>
                <p className="mt-2 text-lg font-black text-black">N{product.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove this product?")) {
                    deleteProduct({ sessionToken: adminQueryArgs.sessionToken, productId: product._id });
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
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

function ReportsTab() {
  const adminQueryArgs = useAdminQueryArgs();
  const reports = useQuery(api.admin.getReports, {
    ...adminQueryArgs,
    status: "pending",
  });
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
          <Check size={48} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-bold text-black">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">No pending reports</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report._id} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Flag size={16} className="text-red-500" />
                  <span className="text-sm font-bold capitalize text-black">{report.type}</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-700">
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.reason}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateReportStatus({
                      sessionToken: adminQueryArgs.sessionToken,
                      reportId: report._id,
                      status: "resolved",
                    })
                  }
                  className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600"
                  title="Resolve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() =>
                    updateReportStatus({
                      sessionToken: adminQueryArgs.sessionToken,
                      reportId: report._id,
                      status: "dismissed",
                    })
                  }
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
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
      <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-bold text-black">{message}</h3>
    </div>
  );
}
