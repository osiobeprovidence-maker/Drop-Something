import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, Users, CreditCard, ShieldAlert, ShoppingBag, 
  BarChart3, Settings, Search, Filter, Ban, Trash2, CheckCircle, 
  AlertCircle, ArrowUpRight, ArrowDownRight, MoreVertical, Eye, Menu, X
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Mock data
  const stats = [
    { label: "Total Users", value: "12,450", change: "+12%", trend: "up", icon: Users },
    { label: "Total Transactions", value: "₦45.2M", change: "+8%", trend: "up", icon: CreditCard },
    { label: "Total Revenue", value: "₦2.26M", change: "+15%", trend: "up", icon: BarChart3 },
    { label: "Active Users", value: "3,120", change: "-2%", trend: "down", icon: LayoutDashboard },
  ];

  const recentActivity = [
    { id: "1", type: "transaction", user: "alexrivera", amount: "₦5,000", time: "2m ago", status: "completed" },
    { id: "2", type: "user_signup", user: "sarah_w", amount: null, time: "15m ago", status: "success" },
    { id: "3", type: "moderation", user: "mike_r", amount: null, time: "1h ago", status: "flagged" },
  ];

  const users = [
    { id: "1", username: "alexrivera", email: "alex@example.com", earnings: "₦450,000", supporters: 124, status: "active" },
    { id: "2", username: "sarah_w", email: "sarah@example.com", earnings: "₦12,500", supporters: 15, status: "active" },
    { id: "3", username: "mike_r", email: "mike@example.com", earnings: "₦85,000", supporters: 42, status: "suspended" },
  ];

  const transactions = [
    { id: "TX-1001", type: "tip", user: "alexrivera", buyer: "John D.", amount: "₦1,000", date: "2024-03-18 10:30", status: "completed" },
    { id: "TX-1002", type: "membership", user: "sarah_w", buyer: "Emily S.", amount: "₦5,000", date: "2024-03-18 09:15", status: "completed" },
    { id: "TX-1003", type: "shop", user: "alexrivera", buyer: "Mike R.", amount: "₦2,500", date: "2024-03-18 08:45", status: "pending" },
  ];

  const flaggedContent = [
    { id: "1", user: "troll_user", reason: "Spam", content: "Buy cheap followers...", time: "10m ago", severity: "high" },
    { id: "2", user: "creator_x", reason: "Inappropriate Image", content: "Profile Banner", time: "2h ago", severity: "medium" },
    { id: "3", user: "random_fan", reason: "Harassment", content: "Comment on @sarah_w", time: "5h ago", severity: "low" },
  ];

  const platformProducts = [
    { id: "1", name: "Premium Badge", price: "₦2,000", sales: 1240, status: "active" },
    { id: "2", name: "Custom Domain", price: "₦15,000/yr", sales: 85, status: "active" },
    { id: "3", name: "Analytics Pro", price: "₦5,000/mo", sales: 312, status: "beta" },
  ];

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users Management", icon: Users },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "moderation", label: "Moderation", icon: ShieldAlert },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between px-4 py-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <ShieldAlert size={18} />
              </div>
              <span className="text-lg font-bold text-slate-900">Admin Panel</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 md:hidden"
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
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 md:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-slate-900 capitalize">{activeTab.replace("-", " ")}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-sm">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <stat.icon size={20} />
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold",
                          stat.trend === "up" ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {stat.change}
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p>
                      <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <h2 className="text-lg font-bold text-slate-900">Platform Activity</h2>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                      </div>
                      <div className="mt-6 space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-4">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                activity.type === "transaction" ? "bg-emerald-100 text-emerald-600" :
                                activity.type === "user_signup" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"
                              )}>
                                {activity.type === "transaction" ? <CreditCard size={18} /> :
                                 activity.type === "user_signup" ? <Users size={18} /> : <ShieldAlert size={18} />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {activity.type === "transaction" ? `Payment from ${activity.user}` :
                                   activity.type === "user_signup" ? `New creator: ${activity.user}` : `Flagged content: ${activity.user}`}
                                </p>
                                <p className="text-xs text-slate-500">{activity.time}</p>
                              </div>
                            </div>
                            {activity.amount && (
                              <p className="text-sm font-bold text-slate-900">{activity.amount}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Quick Stats</h2>
                    <div className="mt-6 space-y-6">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Monthly Target</span>
                          <span className="font-bold text-slate-900">₦50M / ₦100M</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-1/2 bg-indigo-600" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-500">Pending Payouts</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">12</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-500">Open Tickets</p>
                          <p className="mt-1 text-lg font-bold text-slate-900">5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                  <div className="flex gap-2">
                    <button className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
                      <Filter size={16} />
                      Filter
                    </button>
                    <button className="flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100 bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">User</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Earnings</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Supporters</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{user.username}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{user.earnings}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{user.supporters}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                              user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            )}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                                <Eye size={16} />
                              </button>
                              <button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                                <Ban size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "transactions" && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
                  <div className="flex gap-2">
                    <select className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 focus:outline-none">
                      <option>All Types</option>
                      <option>Tips</option>
                      <option>Memberships</option>
                      <option>Shop</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-100 bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Creator</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Buyer</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">{tx.id}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                              tx.type === "tip" ? "bg-rose-100 text-rose-700" :
                              tx.type === "membership" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                            )}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">@{tx.user}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{tx.buyer}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{tx.amount}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                              <CheckCircle size={14} />
                              {tx.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "moderation" && (
              <motion.div
                key="moderation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Content Moderation</h2>
                  <div className="flex gap-2">
                    <button className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">
                      <AlertCircle size={16} />
                      View Reports
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          item.severity === "high" ? "bg-rose-100 text-rose-600" :
                          item.severity === "medium" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                        )}>
                          <ShieldAlert size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">@{item.user}</p>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              item.severity === "high" ? "bg-rose-100 text-rose-700" :
                              item.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {item.severity}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 mt-1">{item.reason}: <span className="text-slate-500 font-normal italic">"{item.content}"</span></p>
                          <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 sm:flex-none">Dismiss</button>
                        <button className="flex-1 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 sm:flex-none">Take Action</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Platform Products</h2>
                  <button className="flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
                    Add Product
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {platformProducts.map((product) => (
                    <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <ShoppingBag size={20} />
                        </div>
                        <span className={cn(
                          "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                          product.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {product.status}
                        </span>
                      </div>
                      <h3 className="mt-4 font-bold text-slate-900">{product.name}</h3>
                      <p className="text-2xl font-black text-slate-900 mt-1">{product.price}</p>
                      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                        <span className="text-xs text-slate-500">{product.sales} sales</span>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Platform Analytics</h2>
                  <div className="flex gap-2">
                    <select className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 focus:outline-none">
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                      <option>This Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="font-bold text-slate-900">Revenue Growth</h3>
                    <div className="mt-8 flex h-48 items-end gap-2">
                      {[40, 65, 45, 90, 65, 80, 55, 70, 85, 60, 75, 95].map((h, i) => (
                        <div key={i} className="group relative flex-1">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="w-full rounded-t-lg bg-indigo-600/20 transition-colors group-hover:bg-indigo-600"
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                            ₦{h}k
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Jan</span>
                      <span>Jun</span>
                      <span>Dec</span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="font-bold text-slate-900">User Distribution</h3>
                    <div className="mt-8 space-y-6">
                      {[
                        { label: "Creators", value: 65, color: "bg-indigo-600" },
                        { label: "Fans", value: 25, color: "bg-emerald-500" },
                        { label: "Merchants", value: 10, color: "bg-amber-500" },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="text-slate-900">{item.value}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              className={cn("h-full", item.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">General Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Platform Fee</p>
                        <p className="text-xs text-slate-500">Percentage taken from every transaction</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={5} className="h-10 w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 focus:outline-none" />
                        <span className="text-sm font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Maintenance Mode</p>
                        <p className="text-xs text-slate-500">Disable platform access for users</p>
                      </div>
                      <button className="h-6 w-12 rounded-full bg-slate-200 p-1 transition-colors hover:bg-slate-300">
                        <div className="h-4 w-4 rounded-full bg-white transition-transform" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">New Creator Approval</p>
                        <p className="text-xs text-slate-500">Manually review new creator signups</p>
                      </div>
                      <button className="h-6 w-12 rounded-full bg-indigo-600 p-1">
                        <div className="h-4 w-4 translate-x-6 rounded-full bg-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Security</h3>
                  <div className="space-y-6">
                    <button className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Admin Access Logs</p>
                        <p className="text-xs text-slate-500">View recent administrative actions</p>
                      </div>
                      <ArrowUpRight size={20} className="text-slate-400" />
                    </button>
                    <button className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">API Keys</p>
                        <p className="text-xs text-slate-500">Manage platform integration keys</p>
                      </div>
                      <ArrowUpRight size={20} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
