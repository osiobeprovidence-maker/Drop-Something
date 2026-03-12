import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoicePlayerProps {
  url: string;
  className?: string;
}

export function VoicePlayer({ url, className }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        audioRef.current.play().catch(err => {
          console.error("Playback error:", err);
          setIsLoading(false);
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (isLoading) setIsLoading(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "flex items-center gap-3 bg-white p-2 pr-4 rounded-full border-2 border-ink shadow-[2px_2px_0_0_#111111] w-fit min-w-[180px]",
      className
    )}>
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} className="ml-0.5" fill="currentColor" />
        )}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center text-[10px] font-black uppercase text-ink/40 tracking-widest leading-none">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
