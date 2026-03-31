import { useState } from "react";
import { motion } from "motion/react";
import {
  Heart, Users, Target, ShoppingBag, ExternalLink, MapPin,
  Mail, MessageCircle, DollarSign, Star, Share2, Copy, Check,
  Image as ImageIcon, Video, Music, FileText, Link as LinkIcon,
  Twitter, Facebook, Instagram, Linkedin, Youtube, Globe, Edit2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface Slate {
  _id: Id<"slates">;
  title?: string;
  description?: string;
  type: "text" | "image" | "video" | "audio";
  content?: string;
  mediaUrl?: string;
  thumbnailImage?: string;
}

interface Project {
  id: string;
  title: string;
  story: string;
  timeframe?: string;
}

interface ShowcaseData {
  role?: string;
  location?: string;
  about?: string;
  hireLink?: string;
  messageLink?: string;
  skills: string[];
  featuredSlateIds: Id<"slates">[];
  projects: Project[];
  sectionOrder: string[];
  hiddenSections: string[];
}

interface ShowcaseDisplayProps {
  creator: any;
  showcase: ShowcaseData & { featuredSlates?: Slate[] };
  isOwner?: boolean;
  onEdit?: () => void;
}

export default function ShowcaseDisplay({
  creator,
  showcase,
  isOwner = false,
  onEdit,
}: ShowcaseDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isSectionHidden = (sectionId: string) =>
    showcase.hiddenSections?.includes(sectionId);

  const handleShare = async () => {
    const url = `${window.location.origin}/${creator.username}/showcase`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator.name} - Showcase`,
          text: `Check out ${creator.name}'s portfolio on DropSomething`,
          url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${creator.username}/showcase`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const getSlateIcon = (slate: Slate) => {
    if (slate.type === "video") return Video;
    if (slate.type === "audio") return Music;
    if (slate.type === "image") return ImageIcon;
    return FileText;
  };

  const getSlateThumbnail = (slate: Slate) => {
    if (slate.thumbnailImage) return slate.thumbnailImage;
    if (slate.type === "image" && slate.mediaUrl) return slate.mediaUrl;
    if (slate.type === "video" && slate.mediaUrl) return slate.mediaUrl;
    return null;
  };

  const renderSection = (sectionId: string) => {
    if (isSectionHidden(sectionId)) return null;

    switch (sectionId) {
      case "header":
        return (
          <section className="relative">
            <div className="flex flex-col items-center text-center py-12 px-4">
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-32 h-32 sm:w-40 sm:h-40 mb-6"
              >
                <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Name & Role */}
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl font-black text-black"
              >
                {creator.name}
              </motion.h1>
              {showcase.role && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg text-black/60 mt-2 font-medium"
                >
                  {showcase.role}
                </motion.p>
              )}
              {showcase.location && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5 text-black/40 mt-2"
                >
                  <MapPin size={16} />
                  <span className="text-sm">{showcase.location}</span>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center justify-center gap-3 mt-6"
              >
                {showcase.hireLink && (
                  <a
                    href={showcase.hireLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-sm hover:bg-gray-900 transition-colors"
                  >
                    <Heart size={16} fill="currentColor" />
                    Hire Me
                  </a>
                )}
                {showcase.messageLink && (
                  <a
                    href={showcase.messageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-black/10 bg-white text-black font-bold text-sm hover:bg-black/5 transition-colors"
                  >
                    <MessageCircle size={16} />
                    Message
                  </a>
                )}
                <a
                  href={`/${creator.username}#support-section`}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-black/10 bg-white text-black font-bold text-sm hover:bg-black/5 transition-colors"
                >
                  <DollarSign size={16} />
                  Support
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-3 rounded-full border-2 border-black/10 bg-white text-black font-bold text-sm hover:bg-black/5 transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </motion.div>

              {/* Edit Button (Owner Only) */}
              {isOwner && onEdit && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onEdit}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-black font-bold text-xs hover:bg-black/10 transition-colors"
                >
                  <Edit2 size={14} />
                  Edit Showcase
                </motion.button>
              )}
            </div>
          </section>
        );

      case "featured":
        if (!showcase.featuredSlates?.length) return null;
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              Featured Work
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {showcase.featuredSlates.map((slate, index) => {
                const thumbnail = getSlateThumbnail(slate);
                const Icon = getSlateIcon(slate);

                return (
                  <motion.div
                    key={slate._id}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5 cursor-pointer"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={slate.title || "Work"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon size={32} className="text-black/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        {slate.title && (
                          <p className="text-white text-sm font-bold truncate">
                            {slate.title}
                          </p>
                        )}
                        {slate.description && (
                          <p className="text-white/70 text-xs truncate">
                            {slate.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );

      case "skills":
        if (!showcase.skills?.length) return null;
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              Skills
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {showcase.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (!showcase.projects?.length) return null;
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              Projects & Experience
            </motion.h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {showcase.projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black">
                        {project.title}
                      </h3>
                      {project.timeframe && (
                        <p className="text-xs text-black/40 mt-1">
                          {project.timeframe}
                        </p>
                      )}
                      <p className="text-sm text-black/60 mt-3 leading-relaxed">
                        {project.story}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );

      case "proof":
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              Proof
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-center"
              >
                <DollarSign size={24} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-2xl font-black text-black">
                  ₦{(creator.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-black/50 mt-1">Total Support</p>
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-center"
              >
                <Users size={24} className="mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-black text-black">
                  {creator.supporterCount || 0}
                </p>
                <p className="text-xs text-black/50 mt-1">Supporters</p>
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 text-center"
              >
                <Heart size={24} className="mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-black text-black">
                  {creator.tips?.length || 0}
                </p>
                <p className="text-xs text-black/50 mt-1">Messages</p>
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 text-center"
              >
                <Star size={24} className="mx-auto text-amber-600 mb-2" />
                <p className="text-2xl font-black text-black">
                  {showcase.featuredSlates?.length || 0}
                </p>
                <p className="text-xs text-black/50 mt-1">Works</p>
              </motion.div>
            </div>

            {/* Recent Supporter Messages */}
            {creator.tips && creator.tips.length > 0 && (
              <div className="mt-8 max-w-3xl mx-auto">
                <h3 className="text-sm font-bold text-black/60 mb-4 text-center">
                  Recent Support
                </h3>
                <div className="space-y-3">
                  {creator.tips.slice(0, 3).map((tip: any, index: number) => (
                    <motion.div
                      key={tip._id}
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-white border border-black/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                            {tip.supporterName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">
                              {tip.supporterName}
                            </p>
                            {tip.message && (
                              <p className="text-xs text-black/50 mt-0.5">
                                "{tip.message}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">
                          ₦{tip.amount.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );

      case "shop":
        if (!creator.products?.length) return null;
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              Shop
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {creator.products.slice(0, 6).map((product: any, index: number) => (
                <motion.a
                  key={product._id}
                  href={`/${creator.username}?tab=shop`}
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-2xl overflow-hidden border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-black/5 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={32} className="text-black/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-black truncate">
                      {product.title}
                    </h3>
                    <p className="text-xs text-black/50 mt-1 truncate">
                      {product.description}
                    </p>
                    <p className="text-sm font-black text-black mt-2">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
            {creator.products.length > 6 && (
              <div className="text-center mt-6">
                <a
                  href={`/${creator.username}?tab=shop`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black"
                >
                  View all products
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </section>
        );

      case "about":
        if (!showcase.about) return null;
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              About
            </motion.h2>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto p-6 rounded-2xl bg-white border border-black/5"
            >
              <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                {showcase.about}
              </p>
            </motion.div>
          </section>
        );

      case "links":
        if (!creator.links?.length) return null;
        return (
          <section className="px-4 py-8">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-black text-black mb-6 text-center"
            >
              Links
            </motion.h2>
            <div className="space-y-2 max-w-md mx-auto">
              {creator.links.map((link: any, index: number) => (
                <motion.a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-black/5 bg-white hover:bg-black/5 transition-colors group"
                >
                  <LinkIcon size={18} className="text-black/40 group-hover:text-black" />
                  <span className="flex-1 text-sm font-bold text-black">
                    {link.title}
                  </span>
                  <ExternalLink size={14} className="text-black/20 group-hover:text-black" />
                </motion.a>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Render sections in order */}
      {showcase.sectionOrder?.map((sectionId) => (
        <div key={sectionId}>{renderSection(sectionId)}</div>
      ))}

      {/* Sticky Bottom CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-black/5"
      >
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          {showcase.hireLink && (
            <a
              href={showcase.hireLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-sm hover:bg-gray-900 transition-colors"
            >
              <Heart size={16} fill="currentColor" />
              Hire Me
            </a>
          )}
          <a
            href={`/${creator.username}#support-section`}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-black/10 bg-white text-black font-bold text-sm hover:bg-black/5 transition-colors"
          >
            <DollarSign size={16} />
            Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
