import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, X, Target, RefreshCw, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface Wishlist {
  _id: Id<"wishlists">;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: "active" | "completed";
  isRenewable: boolean;
}

interface WishlistTabProps {
  wishlists: Wishlist[];
  createWishlist: (args: {
    creatorId: Id<"creators">;
    title: string;
    description: string;
    targetAmount: number;
    isRenewable: boolean;
  }) => Promise<void>;
  updateWishlist: (args: {
    wishlistId: Id<"wishlists">;
    title?: string;
    description?: string;
    targetAmount?: number;
    isRenewable?: boolean;
  }) => Promise<void>;
  deleteWishlist: (args: { wishlistId: Id<"wishlists"> }) => Promise<void>;
  resetWishlist: (args: { wishlistId: Id<"wishlists"> }) => Promise<void>;
  convexCreator: any;
}

export default function WishlistTab({
  wishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  resetWishlist,
  convexCreator,
}: WishlistTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Wishlist | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState<Id<"wishlists"> | null>(null);

  const openModal = (item: Wishlist | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!wishlistToDelete) return;
    try {
      await deleteWishlist({ wishlistId: wishlistToDelete });
    } catch (err) {
      console.error("Error deleting wishlist:", err);
    } finally {
      setDeleteModalOpen(false);
      setWishlistToDelete(null);
    }
  };

  const openDeleteModal = (wishlistId: Id<"wishlists">) => {
    setWishlistToDelete(wishlistId);
    setDeleteModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black">Wishlist</h2>
          <p className="text-sm text-black/40">Let supporters contribute to your goals.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {/* Wishlist Items */}
      <div className="space-y-6">
        {wishlists && wishlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
            <Target size={40} className="text-black/20" />
            <p className="mt-4 font-bold text-black/40">No goals set yet</p>
            <p className="text-sm text-black/30">Create your first wishlist item above</p>
          </div>
        ) : (
          wishlists?.map((item) => {
            const progress = Math.min(100, (item.currentAmount / item.targetAmount) * 100);
            const isCompleted = item.status === "completed";

            return (
              <div
                key={item._id}
                className={cn(
                  "rounded-3xl border p-6 shadow-sm transition-all",
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-black/5 bg-white"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-black">{item.title}</h4>
                      {isCompleted && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Completed
                        </span>
                      )}
                      {item.isRenewable && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          Renewable
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-black/60 mt-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="rounded-lg bg-black/5 p-2 text-black/40 hover:text-black"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item._id)}
                      className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className={cn("text-black", isCompleted && "text-emerald-700")}>
                      ₦{item.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-black/40">₦{item.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-black/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={cn(
                        "h-full transition-colors",
                        isCompleted ? "bg-emerald-500" : "bg-black"
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-black">{Math.round(progress)}% reached</p>
                    {isCompleted && item.isRenewable && (
                      <button
                        onClick={async () => {
                          if (confirm("Reset this goal? Current amount will be set back to 0.")) {
                            await resetWishlist({ wishlistId: item._id });
                          }
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw size={12} />
                        Reset Goal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
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
              className="relative w-full max-w-md rounded-3xl bg-white p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-black">
                  {editingItem ? "Edit Goal" : "Create New Goal"}
                </h3>
                <button onClick={closeModal} className="rounded-full p-2 hover:bg-black/5">
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const title = formData.get("title") as string;
                  const description = formData.get("description") as string;
                  const targetAmount = parseInt(formData.get("targetAmount") as string);
                  const isRenewable = formData.get("isRenewable") === "on";

                  if (!title || !targetAmount) {
                    alert("Please fill in required fields");
                    return;
                  }

                  try {
                    if (editingItem) {
                      await updateWishlist({
                        wishlistId: editingItem._id,
                        title,
                        description,
                        targetAmount,
                        isRenewable,
                      });
                    } else {
                      if (!convexCreator) return;
                      await createWishlist({
                        creatorId: convexCreator._id,
                        title,
                        description,
                        targetAmount,
                        isRenewable,
                      });
                    }
                    closeModal();
                  } catch (err) {
                    console.error("Error saving wishlist:", err);
                    alert("Failed to save. Please try again.");
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold uppercase text-black/40">Goal Title</label>
                  <input
                    name="title"
                    defaultValue={editingItem?.title}
                    required
                    placeholder="e.g., New Camera Equipment"
                    className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-black/40">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingItem?.description}
                    rows={3}
                    placeholder="Describe what this goal is for..."
                    className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-black/40">Target Amount (₦)</label>
                  <input
                    name="targetAmount"
                    type="number"
                    defaultValue={editingItem?.targetAmount}
                    required
                    placeholder="100000"
                    className="mt-1 w-full rounded-xl border border-black/10 bg-black/5 p-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isRenewable"
                    id="isRenewable"
                    defaultChecked={editingItem?.isRenewable}
                    className="h-4 w-4 rounded border-black/20"
                  />
                  <label htmlFor="isRenewable" className="text-sm font-medium text-black">
                    Make this goal renewable (can be reset after completion)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-black text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingItem ? "Save Changes" : "Create Goal"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6"
            >
              <h3 className="text-lg font-bold text-black">Delete Goal?</h3>
              <p className="mt-2 text-sm text-black/60">This action cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 h-11 rounded-full bg-black/5 text-sm font-bold text-black hover:bg-black/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 h-11 rounded-full bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
