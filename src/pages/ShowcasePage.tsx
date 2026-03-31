import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/src/context/AuthContext";
import ShowcaseDisplay from "@/src/components/ShowcaseDisplay";
import { useState } from "react";
import ShowcaseEditor from "@/src/components/ShowcaseEditor";
import { useMutation } from "convex/react";

export default function ShowcasePage() {
  const { username } = useParams();
  const { convexUserId } = useAuth();
  const [showEditor, setShowEditor] = useState(false);

  // Get creator by username
  const creator = useQuery(api.creators.getCreatorByUsername, {
    username: username || ""
  });

  // Get showcase with content
  const showcaseWithContent = useQuery(api.showcases.getShowcaseWithContent, {
    creatorId: creator?._id as Id<"creators"> | undefined
  });

  // Get current user's showcase for editing
  const currentUserShowcase = useQuery(api.showcases.getShowcase, {
    creatorId: creator?._id as Id<"creators"> | undefined
  });

  // Get slates for editor
  const slates = useQuery(api.slates.getSlatesByCreator, {
    creatorId: creator?._id as Id<"creators"> | undefined
  });

  // Mutations
  const upsertShowcase = useMutation(api.showcases.upsertShowcase);
  const generateShowcase = useMutation(api.showcases.generateShowcase);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const isOwner = creator?.userId === convexUserId;

  const handleSaveShowcase = async (data: any) => {
    if (!creator) return;
    setIsSaving(true);
    try {
      await upsertShowcase({
        creatorId: creator._id,
        tokenIdentifier: undefined, // Auth handled by Convex
        role: data.role,
        location: data.location,
        about: data.about,
        hireLink: data.hireLink,
        messageLink: data.messageLink,
        skills: data.skills,
        featuredSlateIds: data.featuredSlateIds,
        projects: data.projects,
        sectionOrder: data.sectionOrder,
        hiddenSections: data.hiddenSections,
      });
      setShowEditor(false);
    } catch (err) {
      console.error("Failed to save showcase:", err);
      alert("Failed to save showcase. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateShowcase = async () => {
    if (!creator) return;
    setIsGenerating(true);
    try {
      await generateShowcase({
        creatorId: creator._id,
        tokenIdentifier: undefined,
      });
    } catch (err) {
      console.error("Failed to generate showcase:", err);
      alert("Failed to generate showcase. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading state
  if (creator === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  // Creator not found
  if (!creator) {
    return <Navigate to="/" replace />;
  }

  // No showcase yet - redirect to creator page or show generate option
  if (!showcaseWithContent) {
    if (isOwner) {
      // Owner viewing their own showcase - show generate option
      return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-black mb-2">Create Your Showcase</h1>
            <p className="text-black/60 mb-6">
              Build a beautiful portfolio automatically from your work on DropSomething.
            </p>
            <button
              onClick={handleGenerateShowcase}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              {isGenerating ? "Generating..." : "Generate My Showcase"}
            </button>
            <a
              href={`/${username}`}
              className="mt-4 inline-block text-sm font-bold text-black/60 hover:text-black"
            >
              Back to Profile
            </a>
          </div>
        </div>
      );
    } else {
      // Visitor viewing non-existent showcase - redirect to creator page
      return <Navigate to={`/${username}`} replace />;
    }
  }

  return (
    <>
      <ShowcaseDisplay
        creator={creator}
        showcase={showcaseWithContent}
        isOwner={isOwner}
        onEdit={() => setShowEditor(true)}
      />

      {/* Editor Modal for Owner */}
      {showEditor && isOwner && (
        <ShowcaseEditor
          convexCreator={creator}
          slates={slates || []}
          showcase={currentUserShowcase}
          onSave={handleSaveShowcase}
          onGenerate={handleGenerateShowcase}
          isGenerating={isGenerating}
          isSaving={isSaving}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
}
