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
  const [coverURL, setCoverURL] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [suggested, setSuggested] = useState('500,1000,5000');

  // Hub Content States
  const [voiceUrl, setVoiceUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tiers, setTiers] = useState<{ title: string; price: number; benefits: string[] }[]>([]);
  const [products, setProducts] = useState<{ title: string; price: number; description: string; imageUrl: string }[]>([]);

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
      setCoverURL(profile.coverURL || '');
      setTwitter(profile.socialLinks?.twitter || '');
      setInstagram(profile.socialLinks?.instagram || '');
      setWebsite(profile.socialLinks?.website || '');
      setSupportMessage(profile.supportMessage || '');
      setSuggested((profile.suggestedAmounts || [500, 1000, 5000]).join(','));
      
      setVoiceUrl(profile.mediaIntros?.voiceUrl || '');
      setVideoUrl(profile.mediaIntros?.videoUrl || '');
      setTiers(profile.membershipTiers || []);
      setProducts(profile.products || []);

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
        coverURL: coverURL || undefined,
        socialLinks: { twitter: twitter || undefined, instagram: instagram || undefined, website: website || undefined },
        supportMessage: supportMessage || undefined,
        suggestedAmounts: suggestedAmounts.length ? suggestedAmounts : undefined,
        goal,
        mediaIntros: { voiceUrl: voiceUrl || undefined, videoUrl: videoUrl || undefined },
        membershipTiers: tiers.length ? tiers : undefined,
        products: products.length ? products : undefined,
      });
      navigate(`/${profile?.username || 'setup'}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const addTier = () => setTiers([...tiers, { title: 'New Tier', price: 2000, benefits: ['Exclusive content'] }]);
  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));
  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    (newTiers[index] as any)[field] = value;
    setTiers(newTiers);
  };

  const addProduct = () => setProducts([...products, { title: 'New Product', price: 5000, description: 'Awesome merch', imageUrl: '' }]);
  const removeProduct = (index: number) => setProducts(products.filter((_, i) => i !== index));
  const updateProduct = (index: number, field: string, value: any) => {
    const newProducts = [...products];
    (newProducts[index] as any)[field] = value;
    setProducts(newProducts);
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
    <div className="max-w-4xl mx-auto py-20 px-6">
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
            <User size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Customize Your Hub</h2>
            <p className="text-lg text-gray-500 font-bold italic">This is how your fans will see you.</p>
          </div>
        </div>

        {/* 1. Profile & Cover */}
        <div className="premium-card-soft space-y-10">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Visual Identity</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="label-mini ml-1">Profile Photo URL</label>
              <input value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://..." className="premium-input" />
            </div>
            <div className="space-y-2">
              <label className="label-mini ml-1">Cover Photo URL</label>
              <input value={coverURL} onChange={(e) => setCoverURL(e.target.value)} placeholder="https://..." className="premium-input" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="label-mini ml-1">Display Name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name" className="premium-input text-lg font-black" />
          </div>
          <div className="space-y-2">
            <label className="label-mini ml-1">Bio / Story</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Your story..." className="premium-input resize-none" />
          </div>
        </div>

        {/* 2. Media Intros */}
        <div className="premium-card-soft space-y-10">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Media Previews</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="label-mini ml-1">Intro Voice Memo URL</label>
              <input value={voiceUrl} onChange={(e) => setVoiceUrl(e.target.value)} placeholder="URL to audio file" className="premium-input" />
            </div>
            <div className="space-y-2">
              <label className="label-mini ml-1">Intro Video URL</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="URL to video file" className="premium-input" />
            </div>
          </div>
        </div>

        {/* 3. Membership Tiers */}
        <div className="premium-card-soft space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Membership Tiers</h3>
            <button type="button" onClick={addTier} className="text-primary font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">+ Add Tier</button>
          </div>
          <div className="space-y-6">
            {tiers.map((tier, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                <button type="button" onClick={() => removeTier(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">✕</button>
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={tier.title} onChange={(e) => updateTier(idx, 'title', e.target.value)} placeholder="Tier Title" className="premium-input border-white bg-white" />
                  <input type="number" value={tier.price} onChange={(e) => updateTier(idx, 'price', Number(e.target.value))} placeholder="Price" className="premium-input border-white bg-white" />
                </div>
                <input 
                  value={tier.benefits.join(', ')} 
                  onChange={(e) => updateTier(idx, 'benefits', e.target.value.split(',').map(b => b.trim()))} 
                  placeholder="Benefits (comma separated)" 
                  className="premium-input border-white bg-white" 
                />
              </div>
            ))}
            {tiers.length === 0 && <p className="text-center text-gray-400 font-bold italic py-4">No tiers added yet.</p>}
          </div>
        </div>

        {/* 4. Products */}
        <div className="premium-card-soft space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">featured Products</h3>
            <button type="button" onClick={addProduct} className="text-secondary font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">+ Add Product</button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {products.map((product, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative">
                 <button type="button" onClick={() => removeProduct(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">✕</button>
                 <input value={product.title} onChange={(e) => updateProduct(idx, 'title', e.target.value)} placeholder="Product Name" className="premium-input border-white bg-white font-black" />
                 <input type="number" value={product.price} onChange={(e) => updateProduct(idx, 'price', Number(e.target.value))} placeholder="Price" className="premium-input border-white bg-white" />
                 <input value={product.imageUrl} onChange={(e) => updateProduct(idx, 'imageUrl', e.target.value)} placeholder="Image URL" className="premium-input border-white bg-white text-xs" />
                 <textarea value={product.description} onChange={(e) => updateProduct(idx, 'description', e.target.value)} placeholder="Description" rows={2} className="premium-input border-white bg-white text-sm resize-none" />
              </div>
            ))}
          </div>
          {products.length === 0 && <p className="text-center text-gray-400 font-bold italic py-4">No products added yet.</p>}
        </div>

        {/* 5. Support Goal & Links */}
        <div className="premium-card-soft space-y-10">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Support Details</h3>
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="label-mini ml-1">Twitter</label>
                <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" className="premium-input" />
              </div>
              <div className="space-y-2">
                <label className="label-mini ml-1">Instagram</label>
                <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" className="premium-input" />
              </div>
              <div className="space-y-2">
                <label className="label-mini ml-1">Website</label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="premium-input" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-mini ml-1">Suggested Tip Amounts</label>
              <input value={suggested} onChange={(e) => setSuggested(e.target.value)} placeholder="500,1000,5000" className="premium-input font-black tracking-widest" />
            </div>

            <div className="pt-10 border-t border-gray-50 space-y-6">
              <div className="flex items-center gap-3">
                 <h4 className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Active Goal</h4>
                 <div className="h-px flex-1 bg-gray-50" />
              </div>
              <input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="Goal title (e.g. New Camera)" className="premium-input text-lg" />
              <div className="grid grid-cols-2 gap-4">
                <input value={goalTarget as any} onChange={(e) => setGoalTarget(Number(e.target.value))} type="number" placeholder="Target ₦" className="premium-input" />
                <input value={goalCurrent as any} onChange={(e) => setGoalCurrent(Number(e.target.value))} type="number" placeholder="Current ₦" className="premium-input" />
              </div>
              <button type="button" onClick={handleRemoveGoal} className="text-[10px] text-red-400 uppercase font-black tracking-widest hover:text-red-600 transition-colors">Clear Goal</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-10">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="flex-1 py-8 bg-black text-white rounded-full font-black text-2xl hover:scale-[1.02] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={32} /> : 'Publish Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/${profile?.username}`)}
            className="py-8 px-12 bg-gray-50 text-gray-600 rounded-full font-black text-xl hover:bg-gray-100 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  );
}
