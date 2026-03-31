import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Plus, Trash2, Edit2, Save, Image as ImageIcon, Video, FileText,
  Music, MapPin, Link as LinkIcon, Sparkles, GripVertical, Eye, EyeOff,
  Check, AlertCircle, Upload, ExternalLink, User, Image, ShoppingBag
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useScrollLock } from "@/src/hooks/useScrollLock";
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

interface ShowcaseEditorProps {
  convexCreator: any;
  slates: Slate[];
  showcase: ShowcaseData | null;
  onSave: (data: Partial<ShowcaseData>) => Promise<void>;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  isSaving: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: "header", label: "Header", icon: User },
  { id: "featured", label: "Featured Work", icon: Image },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "proof", label: "Proof", icon: Check },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "about", label: "About", icon: User },
  { id: "links", label: "Links", icon: LinkIcon },
];

export default function ShowcaseEditor({
  convexCreator,
  slates,
  showcase,
  onSave,
  onGenerate,
  isGenerating,
  isSaving,
  onClose,
}: ShowcaseEditorProps) {
  const [localShowcase, setLocalShowcase] = useState<ShowcaseData>({
    role: "",
    location: "",
    about: "",
    hireLink: "",
    messageLink: "",
    skills: [],
    featuredSlateIds: [],
    projects: [],
    sectionOrder: SECTIONS.map((s) => s.id),
    hiddenSections: [],
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: "",
    story: "",
    timeframe: "",
  });
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useScrollLock(true);

  useEffect(() => {
    if (showcase) {
      setLocalShowcase({
        role: showcase.role || "",
        location: showcase.location || "",
        about: showcase.about || "",
        hireLink: showcase.hireLink || "",
        messageLink: showcase.messageLink || "",
        skills: showcase.skills || [],
        featuredSlateIds: showcase.featuredSlateIds || [],
        projects: showcase.projects || [],
        sectionOrder: showcase.sectionOrder || SECTIONS.map((s) => s.id),
        hiddenSections: showcase.hiddenSections || [],
      });
    }
  }, [showcase]);

  const handleSave = async () => {
    await onSave(localShowcase);
  };

  const handleGenerate = async () => {
    await onGenerate();
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setLocalShowcase((prev) => ({
      ...prev,
      hiddenSections: prev.hiddenSections.includes(sectionId)
        ? prev.hiddenSections.filter((id) => id !== sectionId)
        : [...prev.hiddenSections, sectionId],
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localShowcase.sectionOrder.length) return;

    const newOrder = [...localShowcase.sectionOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setLocalShowcase((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (localShowcase.skills.includes(newSkill.trim())) {
      setNewSkill("");
      return;
    }
    setLocalShowcase((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setLocalShowcase((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const toggleFeaturedSlate = (slateId: Id<"slates">) => {
    setLocalShowcase((prev) => ({
      ...prev,
      featuredSlateIds: prev.featuredSlateIds.includes(slateId)
        ? prev.featuredSlateIds.filter((id) => id !== slateId)
        : [...prev.featuredSlateIds, slateId],
    }));
  };

  const addProject = () => {
    if (!newProject.title || !newProject.story) return;
    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      story: newProject.story,
      timeframe: newProject.timeframe,
    };
    setLocalShowcase((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
    setNewProject({ title: "", story: "", timeframe: "" });
    setIsProjectModalOpen(false);
  };

  const removeProject = (projectId: string) => {
    setLocalShowcase((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
    }));
  };

  const getSlateThumbnail = (slate: Slate) => {
    if (slate.thumbnailImage) return slate.thumbnailImage;
    if (slate.type === "image" && slate.mediaUrl) return slate.mediaUrl;
    if (slate.type === "video" && slate.mediaUrl) return slate.mediaUrl;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div>
            <h2 className="text-2xl font-black text-black">Edit Showcase</h2>
            <p className="text-sm text-black/40 mt-1">
              Build your portfolio from your work
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {isGenerating ? "Generating..." : "Auto-Generate"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-900 disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Section Order & Visibility */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl border border-black/5 p-4">
                <h3 className="text-sm font-bold text-black mb-3">Section Order</h3>
                <div className="space-y-2">
                  {localShowcase.sectionOrder.map((sectionId, index) => {
                    const section = SECTIONS.find((s) => s.id === sectionId);
                    const isHidden = localShowcase.hiddenSections.includes(sectionId);
                    if (!section) return null;

                    return (
                      <div
                        key={sectionId}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all",
                          isHidden ? "bg-black/5 border-black/5" : "bg-white border-black/10"
                        )}
                      >
                        <GripVertical size={14} className="text-black/20" />
                        <section.icon size={16} className="text-black/60" />
                        <span className="flex-1 text-sm font-medium">{section.label}</span>
                        <button
                          onClick={() => toggleSectionVisibility(sectionId)}
                          className="p-1 rounded hover:bg-black/5"
                          title={isHidden ? "Show section" : "Hide section"}
                        >
                          {isHidden ? (
                            <EyeOff size={14} className="text-black/40" />
                          ) : (
                            <Eye size={14} className="text-black/40" />
                          )}
                        </button>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveSection(index, "up")}
                            disabled={index === 0}
                            className="p-0.5 rounded hover:bg-black/5 disabled:opacity-20"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M6 3L2 7h8L6 3z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveSection(index, "down")}
                            disabled={index === localShowcase.sectionOrder.length - 1}
                            className="p-0.5 rounded hover:bg-black/5 disabled:opacity-20"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M6 9L2 5h8L6 9z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Section Editors */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header Section */}
              <div className="rounded-2xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-black/60" />
                  <h3 className="font-bold text-black">Header</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={localShowcase.role}
                      onChange={(e) =>
                        setLocalShowcase((prev) => ({ ...prev, role: e.target.value }))
                      }
                      placeholder="e.g. Graphic Designer, Video Editor"
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                      Location (Optional)
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="text"
                        value={localShowcase.location}
                        onChange={(e) =>
                          setLocalShowcase((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                        Hire Me Link
                      </label>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                        <input
                          type="url"
                          value={localShowcase.hireLink}
                          onChange={(e) =>
                            setLocalShowcase((prev) => ({ ...prev, hireLink: e.target.value }))
                          }
                          placeholder="Calendly, Typeform, etc."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                        Message Link
                      </label>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                        <input
                          type="url"
                          value={localShowcase.messageLink}
                          onChange={(e) =>
                            setLocalShowcase((prev) => ({ ...prev, messageLink: e.target.value }))
                          }
                          placeholder="WhatsApp, Telegram, etc."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="rounded-2xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-black/60" />
                  <h3 className="font-bold text-black">Skills</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-900"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localShowcase.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/5 text-sm font-medium"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="p-0.5 rounded-full hover:bg-black/10"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Work Section */}
              <div className="rounded-2xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={18} className="text-black/60" />
                  <h3 className="font-bold text-black">Featured Work</h3>
                  <span className="text-xs text-black/40 ml-auto">
                    {localShowcase.featuredSlateIds.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slates.map((slate) => {
                    const isSelected = localShowcase.featuredSlateIds.includes(slate._id);
                    const thumbnail = getSlateThumbnail(slate);

                    return (
                      <button
                        key={slate._id}
                        onClick={() => toggleFeaturedSlate(slate._id)}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                          isSelected
                            ? "border-black ring-2 ring-black/20"
                            : "border-black/10 hover:border-black/30"
                        )}
                      >
                        {thumbnail ? (
                          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/5">
                            {slate.type === "video" ? (
                              <Video size={24} className="text-black/20" />
                            ) : slate.type === "audio" ? (
                              <Music size={24} className="text-black/20" />
                            ) : (
                              <FileText size={24} className="text-black/20" />
                            )}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {slates.length === 0 && (
                  <div className="text-center py-8 text-black/40">
                    <AlertCircle size={32} className="mx-auto mb-2" />
                    <p className="text-sm">No posts yet. Create some content first!</p>
                  </div>
                )}
              </div>

              {/* Projects Section */}
              <div className="rounded-2xl border border-black/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-black/60" />
                    <h3 className="font-bold text-black">Projects</h3>
                  </div>
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/5 text-xs font-bold hover:bg-black/10"
                  >
                    <Plus size={14} />
                    Add Project
                  </button>
                </div>
                <div className="space-y-3">
                  {localShowcase.projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-black/10 bg-black/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-black">{project.title}</h4>
                          {project.timeframe && (
                            <p className="text-xs text-black/40 mt-1">{project.timeframe}</p>
                          )}
                          <p className="text-sm text-black/60 mt-2">{project.story}</p>
                        </div>
                        <button
                          onClick={() => removeProject(project.id)}
                          className="p-1.5 rounded-lg hover:bg-black/10"
                        >
                          <Trash2 size={14} className="text-black/40" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {localShowcase.projects.length === 0 && (
                    <div className="text-center py-6 text-black/40 text-sm">
                      No projects yet. Add your work experience or case studies.
                    </div>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="rounded-2xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-black/60" />
                  <h3 className="font-bold text-black">About</h3>
                </div>
                <textarea
                  value={localShowcase.about}
                  onChange={(e) =>
                    setLocalShowcase((prev) => ({ ...prev, about: e.target.value }))
                  }
                  placeholder="Tell your story..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsProjectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-black mb-4">Add Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Brand Identity for Tech Startup"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                    Timeframe (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProject.timeframe}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, timeframe: e.target.value }))}
                    placeholder="e.g. Jan 2024 - Mar 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-black/60 uppercase mb-1 block">
                    Story
                  </label>
                  <textarea
                    value={newProject.story}
                    onChange={(e) => setNewProject((prev) => ({ ...prev, story: e.target.value }))}
                    placeholder="Tell the story of this project..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black focus:outline-none text-sm resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsProjectModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-bold hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addProject}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-900"
                  >
                    Add Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
