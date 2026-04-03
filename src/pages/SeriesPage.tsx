import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/src/lib/utils";
import { buildCreatorPath } from "@/src/lib/creatorRoutes";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, PlayCircle } from "lucide-react";

type SeriesEntry = {
  _id: Id<"slates">;
  title?: string;
  description?: string;
  type: "text" | "image" | "video" | "audio";
  content?: string;
  mediaUrl?: string;
  playbackId?: string;
  thumbnailImage?: string;
  visibility: "public" | "followers" | "supporters" | "members";
  entryType?: "episode" | "chapter";
  sequence?: number;
};

const getLockMessage = (visibility: SeriesEntry["visibility"]) => {
  if (visibility === "followers") return "Follow to unlock this entry";
  if (visibility === "supporters") return "Support to unlock this entry";
  return "Become a member to unlock this entry";
};

export default function SeriesPage() {
  const { username, seriesId } = useParams();
  const creator = useQuery(api.creators.getCreatorByUsername, { username: username || "" });
  const series = useQuery(
    api.slates.getPublicSeriesById,
    seriesId ? { seriesId: seriesId as Id<"slateSeries"> } : "skip",
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);

  const progressKey = useMemo(
    () => (seriesId ? `dropsomething.series.progress.${seriesId}` : ""),
    [seriesId],
  );

  useEffect(() => {
    if (!series?.entries?.length || !progressKey) {
      setCurrentIndex(0);
      setResumeIndex(null);
      return;
    }

    const savedEntryId = localStorage.getItem(progressKey);
    const savedIndex = savedEntryId
      ? series.entries.findIndex((entry: SeriesEntry) => entry._id === savedEntryId)
      : -1;

    setCurrentIndex(0);
    setResumeIndex(savedIndex > 0 ? savedIndex : null);
  }, [progressKey, series]);

  useEffect(() => {
    if (!series?.entries?.length || !progressKey) return;
    const currentEntry = series.entries[currentIndex];
    if (!currentEntry) return;
    localStorage.setItem(progressKey, currentEntry._id);
    if (currentIndex > 0) {
      setResumeIndex(currentIndex);
    }
  }, [currentIndex, progressKey, series]);

  if (creator === undefined || series === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!creator || !series || creator._id !== series.creatorId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 text-center">
        <h1 className="text-2xl font-black text-black">Series not found</h1>
        <p className="mt-2 text-sm text-black/50">This series does not exist or is no longer available.</p>
        <Link
          to={buildCreatorPath(username)}
          className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-bold text-white"
        >
          Back
        </Link>
      </div>
    );
  }

  const entries = series.entries as SeriesEntry[];
  const currentEntry = entries[currentIndex];
  const isLocked = currentEntry?.visibility !== "public";

  const renderEntryContent = (entry: SeriesEntry) => {
    if (entry.type === "text" && entry.content) {
      return <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80">{entry.content}</p>;
    }

    if (entry.type === "image" && entry.mediaUrl) {
      return (
        <div className="space-y-4">
          <img src={entry.mediaUrl} alt="" className="max-h-[34rem] w-full rounded-3xl object-cover" />
          {entry.content ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80">{entry.content}</p> : null}
        </div>
      );
    }

    if (entry.type === "video" && (entry.playbackId || entry.mediaUrl)) {
      return (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl bg-black">
            <video controls className="max-h-[34rem] w-full object-cover">
              <source
                src={entry.playbackId ? `https://stream.mux.com/${entry.playbackId}.m3u8` : entry.mediaUrl}
                type={entry.playbackId ? "application/x-mpegURL" : "video/mp4"}
              />
              Your browser does not support the video tag.
            </video>
          </div>
          {entry.content ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80">{entry.content}</p> : null}
        </div>
      );
    }

    if (entry.type === "audio" && (entry.playbackId || entry.mediaUrl)) {
      return (
        <div className="space-y-4">
          {entry.thumbnailImage ? (
            <img src={entry.thumbnailImage} alt="" className="h-72 w-full rounded-3xl object-cover" />
          ) : null}
          <div className="rounded-3xl border border-black/10 bg-black/[0.03] p-5">
            <audio controls className="w-full">
              <source src={entry.mediaUrl || `https://stream.mux.com/${entry.playbackId}.m3u8`} />
              Your browser does not support the audio tag.
            </audio>
          </div>
          {entry.content ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80">{entry.content}</p> : null}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            to={buildCreatorPath(creator.username)}
            className="inline-flex items-center gap-2 text-sm font-bold text-black/50 transition-colors hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to @{creator.username}
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-end">
            <div className="overflow-hidden rounded-[2rem] bg-black/5">
              {series.coverImage ? (
                <img src={series.coverImage} alt={series.title} className="h-72 w-full object-cover" />
              ) : (
                <div className="flex h-72 items-center justify-center text-sm font-bold uppercase tracking-[0.3em] text-black/30">
                  Series
                </div>
              )}
            </div>
            <div>
              <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                Slate Series
              </span>
              <h1 className="mt-4 text-3xl font-black text-black sm:text-4xl">{series.title}</h1>
              {series.description ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">{series.description}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white"
                >
                  <PlayCircle size={16} />
                  Start from {entries[0]?.entryType === "chapter" ? "Chapter" : "Episode"} 1
                </button>
                {resumeIndex !== null ? (
                  <button
                    onClick={() => setCurrentIndex(resumeIndex)}
                    className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black"
                  >
                    Continue where you stopped
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          {currentEntry ? (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black/60">
                  {currentEntry.entryType} {currentEntry.sequence}
                </span>
                <span className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                  currentEntry.type === "text" ? "bg-blue-50 text-blue-600" :
                  currentEntry.type === "image" ? "bg-purple-50 text-purple-600" :
                  currentEntry.type === "video" ? "bg-pink-50 text-pink-600" :
                  "bg-emerald-50 text-emerald-600"
                )}>
                  {currentEntry.type}
                </span>
              </div>

              <h2 className="text-2xl font-black text-black">{currentEntry.title || `${currentEntry.entryType} ${currentEntry.sequence}`}</h2>
              {currentEntry.description ? (
                <p className="mt-2 text-sm text-black/50">{currentEntry.description}</p>
              ) : null}

              <div className="mt-8">
                {isLocked ? (
                  <div className="flex flex-col items-center justify-center rounded-[2rem] border border-black/5 bg-black/[0.02] py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/5 text-black/40">
                      <Lock size={30} />
                    </div>
                    <p className="text-sm font-bold text-black">{getLockMessage(currentEntry.visibility)}</p>
                    <p className="mt-1 text-xs text-black/40">Support or follow this creator to keep going.</p>
                  </div>
                ) : (
                  renderEntryContent(currentEntry)
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-black disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(entries.length - 1, prev + 1))}
                  disabled={currentIndex === entries.length - 1}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : null}
        </div>

        <aside className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-black/40">Entries</h3>
            <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black/50">
              {entries.length}
            </span>
          </div>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <button
                key={entry._id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  index === currentIndex
                    ? "border-black bg-black/[0.03]"
                    : "border-black/10 bg-white hover:border-black/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black/60">
                    {entry.entryType} {entry.sequence}
                  </span>
                  {resumeIndex === index ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Continue
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-bold text-black">
                  {entry.title || `${entry.entryType} ${entry.sequence}`}
                </p>
                {entry.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-black/45">{entry.description}</p>
                ) : null}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
