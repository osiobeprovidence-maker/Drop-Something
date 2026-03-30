import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Edit2, Trash2, X, Image as ImageIcon, Loader2,
  ShoppingBag, FileText, Video, Users, Ticket, Package,
  Star, TrendingUp, Lock
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface Product {
  _id: Id<"products">;
  title: string;
  description: string;
  price: number;
  type: "digital" | "physical";
  image?: string;
  stock?: number;
}

interface ShopTabProps {
  products: Product[];
  openModal: (type: "product", item?: Product) => void;
  openDeleteModal: (type: string, id: string, title: string) => void;
}

interface Template {
  id: string;
  type: "digital" | "physical" | "service" | "access" | "event";
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface PopularIdea {
  id: string;
  title: string;
  description: string;
  icon: any;
}

export default function ShopTab({
  products,
  openModal,
  openDeleteModal,
}: ShopTabProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const templates: Template[] = [
    {
      id: "digital",
      type: "digital",
      title: "Digital Product",
      description: "Sell ebooks, presets, courses, files",
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "consultation",
      type: "service",
      title: "1-on-1 Zoom Call",
      description: "Offer coaching or consultations",
      icon: Video,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "exclusive",
      type: "access",
      title: "Exclusive Access",
      description: "Sell exclusive content or community access",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "event",
      type: "event",
      title: "Event Ticket",
      description: "Sell access to events or webinars",
      icon: Ticket,
      color: "bg-pink-50 text-pink-600",
    },
    {
      id: "physical",
      type: "physical",
      title: "Physical Product",
      description: "Sell merch or physical items",
      icon: Package,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const popularIdeas: PopularIdea[] = [
    {
      id: "1",
      title: "Design Templates",
      description: "Sell UI kits, social media templates, or design assets",
      icon: Star,
    },
    {
      id: "2",
      title: "Private Coaching",
      description: "Offer 1-on-1 sessions in your area of expertise",
      icon: Users,
    },
    {
      id: "3",
      title: "Exclusive Content",
      description: "Behind-the-scenes, tutorials, or premium posts",
      icon: Lock,
    },
    {
      id: "4",
      title: "Mini Courses",
      description: "Package your knowledge into bite-sized courses",
      icon: TrendingUp,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-black">Start selling to your audience</h2>
          <p className="text-sm text-black/60 mt-1">Create digital products, services, or physical goods and earn directly</p>
        </div>
        <button
          onClick={() => openModal("product")}
          className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Product Templates */}
      {!showTemplates && products.length === 0 && (
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-black/40 uppercase tracking-wider mb-4">Choose a product type</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => openModal("product")}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-2xl border-2 border-black/5 p-5 text-left transition-all hover:border-black/20 hover:shadow-md"
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", template.color)}>
                  <template.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-black">{template.title}</h4>
                  <p className="text-xs text-black/60 mt-1">{template.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Popular Ideas Section */}
          <div className="mt-8 pt-6 border-t border-black/5">
            <h3 className="text-sm font-bold text-black/40 uppercase tracking-wider mb-4">Popular ways creators earn</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {popularIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-start gap-3 rounded-xl bg-black/5 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black/60">
                    <idea.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black">{idea.title}</h4>
                    <p className="text-xs text-black/60 mt-0.5">{idea.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product._id}
              className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:shadow-md"
            >
              {product.image && (
                <div className="h-40 w-full overflow-hidden border-b border-black/5 bg-black/5">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      product.type === "digital"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
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
                      onClick={() => openDeleteModal("product", product._id, product.title)}
                      className="rounded-lg bg-red-50 p-2 text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="mt-4 text-lg font-bold text-black">{product.title}</h4>
                <p className="mt-1 text-sm text-black/60 line-clamp-2">{product.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="text-lg font-black text-black">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-black/40">
                    {product.type === "physical"
                      ? `${product.stock || 0} in stock`
                      : "Digital"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - When products were deleted */}
      {products.length === 0 && showTemplates && (
        <div className="rounded-3xl border-2 border-dashed border-black/10 p-12 text-center">
          <ShoppingBag size={48} className="text-black/20 mx-auto" />
          <h3 className="mt-4 text-lg font-bold text-black">Your shop is empty — let's fix that</h3>
          <p className="text-sm text-black/40 mt-1">Create your first product and start earning</p>
          <button
            onClick={() => openModal("product")}
            className="mt-6 flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 mx-auto"
          >
            <Plus size={16} />
            Create your first product
          </button>
        </div>
      )}
    </motion.div>
  );
}
