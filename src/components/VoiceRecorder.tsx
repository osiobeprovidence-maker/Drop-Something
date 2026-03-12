import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob | null) => void;
  isUploading?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, isUploading }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record a voice message.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    onRecordingComplete(null);
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-cream rounded-2xl p-4 border-2 border-ink/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isRecording ? "bg-red-500 animate-pulse text-white" : "bg-ink/5 text-ink"
          )}>
            <Mic size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-ink/40">Voice Message</p>
            <p className="text-sm font-black text-ink">
              {isRecording ? `Recording... ${formatTime(recordingTime)}` : audioUrl ? "Voice message recorded" : "Add a voice message (optional)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-black hover:bg-ink/90 transition-all shadow-[2px_2px_0_0_#FF4D8D]"
            >
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <Square size={14} fill="currentColor" />
              Stop
            </button>
          )}

          {audioUrl && !isRecording && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-10 h-10 bg-primary/10 text-primary border-2 border-ink rounded-full flex items-center justify-center hover:bg-primary/20 transition-all"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
              <button
                type="button"
                onClick={deleteRecording}
                className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-all"
              >
                <Trash2 size={18} />
              </button>
              <audio 
                ref={audioPlayerRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden" 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Waveform Visualization Placeholder */}
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-end justify-center gap-1 mt-4 pt-2 h-8"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 20, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                className="w-1 bg-primary rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
