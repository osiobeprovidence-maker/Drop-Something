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
    <div className="max-w-2xl mx-auto py-20 px-6">
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card-soft space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <User size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Edit Profile</h2>
            <p className="text-lg text-gray-500 font-bold italic">Customize how you look to your supporters.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="label-mini ml-1">Display Name</label>
            <input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Your full name or stage name"
              className="premium-input text-lg" 
            />
          </div>

          <div className="space-y-2">
            <label className="label-mini ml-1">Profile Photo URL</label>
            <input 
              value={photoURL} 
              onChange={(e) => setPhotoURL(e.target.value)} 
              placeholder="https://example.com/photo.jpg"
              className="premium-input text-lg" 
            />
          </div>

          <div className="space-y-2">
            <label className="label-mini ml-1">Bio</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              rows={4} 
              placeholder="Tell your fans who you are..."
              className="premium-input text-lg resize-none" 
            />
          </div>

          <div className="space-y-4">
             <label className="label-mini ml-1 text-gray-400">Social Links</label>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter @handle" className="premium-input !py-4" />
              <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram @handle" className="premium-input !py-4" />
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" className="premium-input !py-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-mini ml-1">Direct Support Message</label>
            <input 
              value={supportMessage} 
              onChange={(e) => setSupportMessage(e.target.value)} 
              placeholder="What do you want to say to your supporters?" 
              className="premium-input text-lg" 
            />
          </div>

          <div className="space-y-2">
            <label className="label-mini ml-1">Suggested Tip Amounts</label>
            <input 
              value={suggested} 
              onChange={(e) => setSuggested(e.target.value)} 
              placeholder="500,1000,5000"
              className="premium-input text-lg font-black tracking-widest" 
            />
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black ml-1 pt-2">Comma separated values in Naira</p>
          </div>

          <div className="pt-10 border-t border-gray-50 space-y-6">
            <div className="flex items-center gap-3">
               <h4 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Support Goal</h4>
               <div className="h-px flex-1 bg-gray-50" />
            </div>
            
            <div className="space-y-4">
              <input 
                value={goalTitle} 
                onChange={(e) => setGoalTitle(e.target.value)} 
                placeholder="Goal title (e.g. Buy a new camera)" 
                className="premium-input text-lg" 
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-300 ml-1">Target (₦)</span>
                  <input value={goalTarget as any} onChange={(e) => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="50,000" className="premium-input" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-300 ml-1">Current (₦)</span>
                  <input value={goalCurrent as any} onChange={(e) => setGoalCurrent(e.target.value === '' ? '' : Number(e.target.value))} type="number" placeholder="0" className="premium-input" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={isSaving} 
                className="flex-1 py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : 'Save Profile'}
              </button>
              <button 
                type="button" 
                onClick={handleRemoveGoal} 
                disabled={isSaving} 
                className="py-6 px-10 bg-gray-50 text-gray-600 rounded-full font-black text-lg hover:bg-gray-100 transition-all active:scale-95"
              >
                Remove Goal
              </button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
