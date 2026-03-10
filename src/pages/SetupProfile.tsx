import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'motion/react';
import { User, AtSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function SetupProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Check username availability via Convex
  const usernameCheck = useQuery(
    api.users.checkUsername,
    username.length >= 3 ? { username } : 'skip'
  );

  const isChecking = username.length >= 3 && usernameCheck === undefined;
  const isAvailable = username.length < 3 ? null : usernameCheck?.available ?? null;

  const createUser = useMutation(api.users.createUser);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    setUsername(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAvailable || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      await createUser({
        uid: user.uid,
        username,
        displayName,
        bio,
        photoURL: user.photoURL || '',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary border-2 border-ink rounded-2xl flex items-center justify-center mx-auto">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-black text-ink">Setup your profile</h1>
          <p className="text-ink/60 font-black">Choose a unique username to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
                <AtSign size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="username"
                className={cn(
                  "w-full pl-11 pr-12 py-4 bg-cream border-4 rounded-2xl focus:outline-none transition-all font-black",
                  isAvailable === true ? "border-primary shadow-[2px_2px_0_0_#FF4D8D]" :
                    isAvailable === false ? "border-red-500 shadow-[2px_2px_0_0_#ef4444]" :
                      "border-ink focus:border-primary"
                )}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isChecking ? (
                  <Loader2 size={18} className="animate-spin text-ink/40" />
                ) : isAvailable === true ? (
                  <CheckCircle2 size={18} className="text-primary" />
                ) : isAvailable === false ? (
                  <AlertCircle size={18} className="text-red-500" />
                ) : null}
              </div>
            </div>
            {isAvailable === false && (
              <p className="text-xs text-red-500 font-black ml-1">This username is already taken.</p>
            )}
            <p className="text-[10px] text-ink/40 uppercase tracking-wider font-black ml-1">
              Your page: dropsomething.ng/{username || 'username'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-4 bg-cream border-2 border-ink rounded-2xl focus:outline-none focus:border-primary transition-all font-black"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your fans what you're creating..."
              rows={3}
              className="w-full px-4 py-4 bg-cream border-2 border-ink rounded-2xl focus:outline-none focus:border-primary transition-all font-black resize-none"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl text-sm font-black flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isAvailable || isSubmitting}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={20} className="animate-spin" />}
            Complete Setup
          </button>
        </form>
      </motion.div>
    </div>
  );
}
