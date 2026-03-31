import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings, User, CreditCard, Shield, Key, MapPin, Star,
  Save, Loader2, CheckCircle2, AlertCircle, Upload, Camera,
  ExternalLink, LogOut, X, Menu, ChevronRight, DollarSign,
  Plus, Edit2, Trash2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@/src/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { PaystackPayment } from "@/src/lib/PaystackPayment";

const PENDING_DELIVERY_KEY = "dropsomething.pendingDeliverySignup";

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, convexUserId } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const requestedTab = new URLSearchParams(location.search).get("tab");

  // Ensure creator profile exists for old accounts
  const ensureCreatorProfile = useMutation(api.creators.ensureCreatorProfile);

  useEffect(() => {
    const initializeProfile = async () => {
      if (convexUserId) {
        try {
          await ensureCreatorProfile({ userId: convexUserId as Id<"users"> });
        } catch (err) {
          console.error("Failed to initialize creator profile:", err);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeProfile();
  }, [convexUserId, ensureCreatorProfile]);

  // Fetch data from Convex
  const paymentDetails = useQuery(api.settings.getPaymentDetails,
    convexUserId && !isInitializing ? { userId: convexUserId as Id<"users"> } : "skip"
  );
  const kyc = useQuery(api.settings.getKYC,
    convexUserId && !isInitializing ? { userId: convexUserId as Id<"users"> } : "skip"
  );
  const subscription = useQuery(api.settings.getSubscription,
    convexUserId && !isInitializing ? { userId: convexUserId as Id<"users"> } : "skip"
  );
  const addresses = useQuery(api.settings.getAddresses,
    convexUserId && !isInitializing ? { userId: convexUserId as Id<"users"> } : "skip"
  );
  const currentUser = useQuery(api.users.currentUser);
  const userEmail = currentUser?.email || "";
  const pendingDeliveryPurchases = useQuery(api.settings.getPendingDeliveryPurchases,
    userEmail ? { email: userEmail } : "skip"
  );

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "payment", label: "Payment Details", icon: CreditCard },
    { id: "kyc", label: "KYC Verification", icon: Shield },
    { id: "subscription", label: "Subscription", icon: Star },
    { id: "security", label: "Security", icon: Key },
    { id: "delivery", label: "Delivery Address", icon: MapPin },
  ];

  return (
    <div className="flex min-h-screen bg-black/5">
      {/* Mobile Sidebar Overlay */}
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
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-black/5 bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between px-4 py-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Settings size={18} />
              </div>
              <span className="text-lg font-bold text-black">Settings</span>
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
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-black/40 hover:bg-black/5 hover:text-black transition-colors"
            >
              <ExternalLink size={20} />
              Back to Dashboard
            </Link>
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
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl p-2 text-black/60 hover:bg-black/5 md:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-black capitalize">{activeTab}</h1>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && <ProfileTab convexUserId={convexUserId} />}
            {activeTab === "payment" && <PaymentTab paymentDetails={paymentDetails} convexUserId={convexUserId} />}
            {activeTab === "kyc" && <KYCTab kyc={kyc} convexUserId={convexUserId} />}
            {activeTab === "subscription" && <SubscriptionTab subscription={subscription} convexUserId={convexUserId} userEmail={userEmail} />}
            {activeTab === "security" && <SecurityTab user={user} />}
            {activeTab === "delivery" && (
              <DeliveryTab
                addresses={addresses}
                convexUserId={convexUserId}
                userEmail={userEmail}
                pendingDeliveryPurchases={pendingDeliveryPurchases}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ==================== PROFILE TAB ====================

function ProfileTab({ convexUserId }: { convexUserId?: string }) {
  const creator = useQuery(api.creators.getCreatorByUserId,
    convexUserId ? { userId: convexUserId as Id<"users"> } : "skip"
  );
  
  const updateCreator = useMutation(api.creators.updateCreator);
  const generateUploadUrl = useMutation(api.creators.generateUploadUrl);

  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [formData, setFormData] = useState({
    username: creator?.username || "",
    name: creator?.name || "",
    bio: creator?.bio || "",
    about: (creator as any)?.about || "",
  });

  // Sync form data when creator data arrives from Convex
  useEffect(() => {
    if (creator) {
      setFormData({
        username: creator.username || "",
        name: creator.name || "",
        bio: creator.bio || "",
        about: (creator as any).about || "",
      });
    }
  }, [creator]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file || !convexUserId || !creator) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      await updateCreator({
        creatorId: creator._id,
        [field]: storageId,
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!convexUserId || !creator) return;

    setIsSaving(true);
    try {
      await updateCreator({
        creatorId: creator._id,
        username: formData.username,
        name: formData.name,
        bio: formData.bio,
        about: formData.about,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!creator) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-center text-black/40">No creator profile found.</p>
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
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-black">Profile Information</h2>
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-sm font-medium text-emerald-600"
              >
                <CheckCircle2 size={16} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="group relative h-24 w-24 overflow-hidden rounded-3xl bg-black/5">
              <img src={creator.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                <Camera size={24} />
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

          {/* Cover Image */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">Cover Image</label>
            <div className="group relative mt-2 h-40 w-full overflow-hidden rounded-2xl bg-black/5">
              <img src={creator.coverImage} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                <Upload size={32} />
                <span className="mt-2 text-xs font-bold">Change Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'coverImage')}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">Username</label>
              <div className="mt-2 flex items-center rounded-xl border border-black/10 bg-black/5 px-4">
                <span className="text-black/40 text-sm">dropsomething.com/</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-12 flex-1 bg-transparent text-sm font-medium text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={2}
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-4 text-sm focus:outline-none focus:border-black/30"
              placeholder="Short profile summary..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">About Us / Detailed Bio</label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              rows={6}
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-4 text-sm focus:outline-none focus:border-black/30"
              placeholder="Detailed information about you or your mission..."
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ==================== PAYMENT TAB ====================

function PaymentTab({ paymentDetails, convexUserId }: { paymentDetails?: any, convexUserId?: string }) {
  const savePaymentDetails = useMutation(api.settings.savePaymentDetails);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [formData, setFormData] = useState({
    accountName: paymentDetails?.accountName || "",
    bankName: paymentDetails?.bankName || "",
    accountNumber: paymentDetails?.accountNumber || "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!convexUserId) return;

    if (!formData.accountName || !formData.bankName || !formData.accountNumber) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    try {
      await savePaymentDetails({
        userId: convexUserId as Id<"users">,
        ...formData,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save payment details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-black">Bank Account Details</h2>
            <p className="text-sm text-black/40 mt-1">Add your bank account for receiving payouts.</p>
          </div>
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-sm font-medium text-emerald-600"
              >
                <CheckCircle2 size={16} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">Account Name</label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="John Doe"
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="GTBank, Zenith Bank, etc."
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="10-digit account number"
              maxLength={10}
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : "Save Bank Details"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ==================== KYC TAB ====================

function KYCTab({ kyc, convexUserId }: { kyc?: any, convexUserId?: string }) {
  const submitKYC = useMutation(api.settings.submitKYC);
  const generateUploadUrl = useMutation(api.settings.generateUploadUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [idImageId, setIdImageId] = useState("");
  const [selfieImageId, setSelfieImageId] = useState("");
  const [formData, setFormData] = useState({
    fullName: kyc?.fullName || "",
    idType: kyc?.idType || "international_passport",
  });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      if (type === 'id') setIdImageId(storageId);
      else setSelfieImageId(storageId);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!convexUserId) return;

    if (!formData.fullName || !idImageId || !selfieImageId) {
      alert("Please fill in all fields and upload both images.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitKYC({
        userId: convexUserId as Id<"users">,
        fullName: formData.fullName,
        idType: formData.idType,
        idImageId,
        selfieImageId,
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err instanceof Error ? err.message : "Failed to submit KYC.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (!kyc) return "text-black/40";
    switch (kyc.status) {
      case "approved": return "text-emerald-600";
      case "rejected": return "text-red-600";
      default: return "text-amber-600";
    }
  };

  const getStatusIcon = () => {
    if (!kyc) return null;
    switch (kyc.status) {
      case "approved": return <CheckCircle2 size={20} />;
      case "rejected": return <AlertCircle size={20} />;
      default: return <Loader2 size={20} className="animate-spin" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Status Banner */}
      {kyc && (
        <div className={cn("rounded-3xl border p-6 flex items-center gap-4", 
          kyc.status === "approved" ? "border-emerald-200 bg-emerald-50" :
          kyc.status === "rejected" ? "border-red-200 bg-red-50" :
          "border-amber-200 bg-amber-50"
        )}>
          <div className={getStatusColor()}>{getStatusIcon()}</div>
          <div>
            <p className={cn("font-bold capitalize", getStatusColor())}>
              KYC {kyc.status}
            </p>
            {kyc.status === "rejected" && kyc.rejectionReason && (
              <p className="text-sm text-red-600 mt-1">{kyc.rejectionReason}</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-black">KYC Verification</h2>
            <p className="text-sm text-black/40 mt-1">Verify your identity to receive payouts.</p>
          </div>
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-sm font-medium text-emerald-600"
              >
                <CheckCircle2 size={16} />
                Submitted
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {kyc?.status === "approved" ? (
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-4" />
            <p className="font-bold text-black">Your identity is verified!</p>
            <p className="text-sm text-black/40 mt-1">You can receive payouts.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">Full Name (as on ID)</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">ID Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
              >
                <option value="international_passport">International Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID Card</option>
                <option value="voters_card">Voter's Card</option>
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* ID Upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">ID Document</label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-black/10 bg-black/5 cursor-pointer hover:border-black/30 transition-colors">
                    {idImageId ? (
                      <div className="text-center">
                        <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                        <p className="text-xs font-bold text-black mt-2">ID Uploaded</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-black/20" />
                        <p className="text-xs text-black/40 mt-2">Click to upload</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'id')}
                    />
                  </label>
                </div>
              </div>

              {/* Selfie Upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">Selfie with ID</label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-black/10 bg-black/5 cursor-pointer hover:border-black/30 transition-colors">
                    {selfieImageId ? (
                      <div className="text-center">
                        <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                        <p className="text-xs font-bold text-black mt-2">Selfie Uploaded</p>
                      </div>
                    ) : (
                      <>
                        <Camera size={32} className="text-black/20" />
                        <p className="text-xs text-black/40 mt-2">Click to upload</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'selfie')}
                    />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !idImageId || !selfieImageId}
              className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Submit for Verification"}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}

// ==================== SUBSCRIPTION TAB ====================

function SubscriptionTab({ subscription, convexUserId, userEmail }: { subscription?: any, convexUserId?: string, userEmail?: string }) {

  const isExpired = subscription?.expiresAt && subscription.expiresAt < Date.now();
  const isActive = subscription?.status === "active" && !isExpired;

  const handleSubscribeSuccess = async (_reference: string) => {};

  const handleSubscribeError = (_error: string) => {};

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Current Plan */}
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-black mb-6">Current Subscription</h2>
        
        {isActive ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Star size={24} />
              </div>
              <div>
                <p className="font-bold text-black capitalize">{subscription.plan} Plan</p>
                <p className="text-sm text-emerald-600 font-medium">Active</p>
              </div>
            </div>
            <div className="rounded-xl bg-black/5 p-4">
              <p className="text-sm text-black/40">Renews on</p>
              <p className="font-bold text-black">{formatDate(subscription.expiresAt)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 mx-auto mb-4">
              <DollarSign size={32} className="text-black/40" />
            </div>
            <p className="font-bold text-black">No Active Subscription</p>
            <p className="text-sm text-black/40 mt-1">Subscriptions are only needed for premium features.</p>
          </div>
        )}
      </div>

      {/* Shop Subscription Plan */}
      <div className="rounded-3xl border-2 border-black bg-black p-8 shadow-sm text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black">Shop Access</h2>
            <p className="text-sm text-white/60 mt-1">All creators can now create products for free</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">₦3,000</p>
            <p className="text-sm text-white/60">per month</p>
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {[
            "Create digital and physical products",
            "Add prices, stock, and product images",
            "Manage your shop from the dashboard",
            "No subscription required",
            "Available to every creator"
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {convexUserId && userEmail ? (
          <PaystackPayment
            email={userEmail}
            amount={3000}
            type="subscription"
            userId={convexUserId as Id<"users">}
            subscriptionPlan="shop"
            onSuccess={handleSubscribeSuccess}
            onError={handleSubscribeError}
          >
            {({ loading, handlePayment }) => (
              <button
                onClick={handlePayment}
                disabled={true}
                className={cn(
                  "flex h-14 w-full items-center justify-center rounded-full text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]",
                  true
                    ? "bg-white/20 text-white/60 cursor-not-allowed"
                    : "bg-white text-black hover:shadow-lg hover:shadow-white/20"
                )}
              >
                {false ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Included For All Creators"
                )}
              </button>
            )}
          </PaystackPayment>
        ) : (
          <button
            disabled={true}
            className="flex h-14 w-full items-center justify-center rounded-full text-sm font-bold bg-white/20 text-white/60 cursor-not-allowed transition-all"
          >
            Included For All Creators
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== SECURITY TAB ====================

function SecurityTab({ user }: { user?: any }) {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState(user?.email || "");

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setIsSending(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      alert(err.message || "Failed to send password reset email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Password Reset */}
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5">
            <Key size={20} />
          </div>
          <div>
            <h2 className="font-bold text-black">Reset Password</h2>
            <p className="text-sm text-black/40">Send a password reset link to your email</p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">
              Password reset link sent! Check your email inbox (and spam folder).
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-black/40">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
            />
          </div>

          <button
            onClick={handlePasswordReset}
            disabled={isSending}
            className="flex h-12 w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : "Send Reset Link"}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <h2 className="font-bold text-black mb-6">Account Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-black/5">
            <span className="text-sm text-black/40">Email</span>
            <span className="text-sm font-medium text-black">{user?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-black/5">
            <span className="text-sm text-black/40">Display Name</span>
            <span className="text-sm font-medium text-black">{user?.displayName || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-black/40">Email Verified</span>
            <span className={cn(
              "text-sm font-medium",
              user?.emailVerified ? "text-emerald-600" : "text-amber-600"
            )}>
              {user?.emailVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== DELIVERY TAB ====================

function DeliveryTab({
  addresses,
  convexUserId,
  userEmail,
  pendingDeliveryPurchases,
}: {
  addresses?: any[],
  convexUserId?: string,
  userEmail?: string,
  pendingDeliveryPurchases?: any[],
}) {
  const addAddress = useMutation(api.settings.addAddress);
  const updateAddress = useMutation(api.settings.updateAddress);
  const deleteAddress = useMutation(api.settings.deleteAddress);
  const assignAddressToPendingPurchases = useMutation(api.settings.assignAddressToPendingPurchases);

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    isDefault: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!convexUserId) return;

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state) {
      alert("Please fill in all fields.");
      return;
    }

    setIsAdding(true);
    setIsSaving(true);
    try {
      let savedAddressId = editingId as Id<"addresses"> | null;

      if (editingId) {
        await updateAddress({
          addressId: editingId as Id<"addresses">,
          ...formData,
        });
      } else {
        savedAddressId = await addAddress({
          userId: convexUserId as Id<"users">,
          ...formData,
        });
      }

      if (savedAddressId && userEmail && pendingDeliveryPurchases && pendingDeliveryPurchases.length > 0) {
        await assignAddressToPendingPurchases({
          email: userEmail,
          userId: convexUserId as Id<"users">,
          addressId: savedAddressId,
        });
        localStorage.removeItem(PENDING_DELIVERY_KEY);
      }
      
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      isDefault: false,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (addr: any) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await deleteAddress({ addressId: id as Id<"addresses"> });
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updateAddress({
        addressId: id as Id<"addresses">,
        isDefault: true,
      });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {pendingDeliveryPurchases && pendingDeliveryPurchases.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Delivery address needed</h2>
              <p className="mt-1 text-sm text-emerald-800">
                You have {pendingDeliveryPurchases.length} paid physical {pendingDeliveryPurchases.length === 1 ? "order" : "orders"} waiting for a delivery address.
                Save an address below and we’ll attach it automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Form */}
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-black">{editingId ? "Edit Address" : "Add New Address"}</h2>
            <p className="text-sm text-black/40">Your delivery address for physical products</p>
          </div>
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-sm font-medium text-emerald-600"
              >
                <CheckCircle2 size={16} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-black/40">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/40">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none focus:border-black/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-black/20"
              />
              <label htmlFor="isDefault" className="text-sm text-black/60">Set as default address</label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-xl border border-black/10 py-3 text-sm font-bold text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-black py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin mx-auto" /> : editingId ? "Update" : "Save Address"}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-black/20 text-sm font-bold text-black/40 transition-colors hover:border-black/40 hover:text-black/60"
          >
            <Plus size={20} />
            Add New Address
          </button>
        )}
      </div>

      {/* Saved Addresses */}
      {addresses && addresses.length > 0 && (
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-black mb-6">Saved Addresses</h2>
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  addr.isDefault ? "border-black bg-black/5" : "border-black/5 bg-white"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-black">{addr.fullName}</p>
                      {addr.isDefault && (
                        <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-black/60 mt-1">{addr.phone}</p>
                    <p className="text-sm text-black/60 mt-1">{addr.address}</p>
                    <p className="text-sm text-black/60">{addr.city}, {addr.state}</p>
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                        title="Set as default"
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
