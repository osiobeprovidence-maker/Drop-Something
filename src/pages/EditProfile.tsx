import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'motion/react';
import { User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function EditProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [suggested, setSuggested] = useState('500,1000,5000');

  // Goal fields
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState<number | ''>('');
  const [goalCurrent, setGoalCurrent] = useState<number | ''>('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate('/');
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoURL(profile.photoURL || '');
      setTwitter(profile.socialLinks?.twitter || '');
      setInstagram(profile.socialLinks?.instagram || '');
      setWebsite(profile.socialLinks?.website || '');
      setSupportMessage(profile.supportMessage || '');
      setSuggested((profile.suggestedAmounts || [500, 1000, 5000]).join(','));
      if (profile.goal) {
        setGoalTitle(profile.goal.title);
        setGoalTarget(profile.goal.target);
        setGoalCurrent(profile.goal.current);
      }
    }
  }, [profile, user, navigate]);

  const updateUser = useMutation(api.users.updateUser);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const suggestedAmounts = suggested
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const goal = goalTitle && goalTarget ? {
      title: goalTitle,
      target: Number(goalTarget),
      current: Number(goalCurrent || 0),
      createdAt: Date.now(),
    } : undefined;

    try {
      await updateUser({
        uid: user.uid,
        displayName,
        bio,
        photoURL,
        socialLinks: { twitter: twitter || undefined, instagram: instagram || undefined, website: website || undefined },
        supportMessage: supportMessage || undefined,
        suggestedAmounts: suggestedAmounts.length ? suggestedAmounts : undefined,
        goal,
      });
      navigate(`/${profile?.username || 'setup'}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveGoal = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUser({ uid: user.uid, goal: undefined });
      setGoalTitle(''); setGoalTarget(''); setGoalCurrent('');
    } catch (err) {
      console.error(err);
      alert('Failed to remove goal.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12">
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary border-2 border-ink rounded-2xl flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <h2 className="text-2xl font-black mt-2">Edit Profile</h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Profile photo URL</label>
          <input value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter" className="px-3 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className="px-3 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" className="px-3 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Support message</label>
          <input value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Message shown on your page" className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Suggested tip amounts (comma separated)</label>
          <input value={suggested} onChange={(e) => setSuggested(e.target.value)} className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
        </div>

        <div className="pt-4 border-t-2 space-y-3">
          <h4 className="text-sm font-black uppercase text-ink/60">Support Goal</h4>
          <input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="Goal title (e.g. Buy a new camera)" className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
          <div className="grid grid-cols-2 gap-3">
            <input value={goalTarget as any} onChange={(e) => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="Target (₦)" className="px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
            <input value={goalCurrent as any} onChange={(e) => setGoalCurrent(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="Current (₦)" className="px-4 py-3 bg-cream border-2 border-ink rounded-2xl font-black" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-primary text-white rounded-2xl font-black">{isSaving ? <Loader2 className="animate-spin" /> : 'Save Profile'}</button>
            <button type="button" onClick={handleRemoveGoal} disabled={isSaving} className="py-3 px-4 bg-cream border-2 border-ink rounded-2xl font-black">Remove Goal</button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
