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
    <div className="max-w-xl mx-auto py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card-soft space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <User size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Setup your profile</h1>
            <p className="text-xl text-gray-500 font-bold">Choose a unique username to get started.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <label className="label-mini ml-1">Username</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                <AtSign size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="username"
                className={cn(
                  "premium-input !pl-14 text-xl",
                  isAvailable === true && "border-primary bg-primary/5",
                  isAvailable === false && "border-red-400 bg-red-50"
                )}
                required
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {isChecking ? (
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                ) : isAvailable === true ? (
                  <CheckCircle2 size={18} className="text-primary" />
                ) : isAvailable === false ? (
                  <AlertCircle size={18} className="text-red-500" />
                ) : null}
              </div>
            </div>
            {isAvailable === false && (
              <p className="text-sm text-red-500 font-bold ml-1">This username is already taken.</p>
            )}
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black ml-1">
              Your link: dropsomething.ng/{username || 'username'}
            </p>
          </div>

          <div className="space-y-4">
            <label className="label-mini ml-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="premium-input text-xl"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="label-mini ml-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your fans what you're creating..."
              rows={4}
              className="premium-input resize-none"
            />
          </div>

          {error && (
            <div className="p-5 bg-red-50 text-red-600 border border-red-100 rounded-3xl text-sm font-bold flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={!isAvailable || isSubmitting}
              className="w-full py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
              Complete Setup
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
