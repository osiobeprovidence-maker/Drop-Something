import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Shield, Camera, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function KYC() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    idType: 'NIN' as const,
    idNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await setDoc(doc(db, 'kyc', user.uid), {
        uid: user.uid,
        ...formData,
        idImageUrl: 'https://picsum.photos/seed/id/400/300', // Placeholder
        selfieUrl: 'https://picsum.photos/seed/selfie/400/400', // Placeholder
        status: 'pending',
        submittedAt: Date.now()
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-[2.5rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] overflow-hidden">
        <div className="bg-ink p-8 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center border-2 border-white shadow-[2px_2px_0_0_#ffffff]">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Identity Verification</h1>
            <p className="text-white/60 text-sm font-black">Required to receive tips and withdraw funds.</p>
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-xl focus:outline-none focus:border-primary transition-all font-black"
                      placeholder="As on your ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-xl focus:outline-none focus:border-primary transition-all font-black"
                      placeholder="080..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">ID Type</label>
                  <select
                    value={formData.idType}
                    onChange={e => setFormData({...formData, idType: e.target.value as any})}
                    className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-xl focus:outline-none focus:border-primary transition-all font-black"
                  >
                    <option value="NIN">National ID (NIN)</option>
                    <option value="DriversLicense">Driver's License</option>
                    <option value="Passport">International Passport</option>
                    <option value="VotersCard">Voter's Card</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">ID Number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={e => setFormData({...formData, idNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-cream border-2 border-ink rounded-xl focus:outline-none focus:border-primary transition-all font-black"
                    placeholder="Enter ID number"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1"
              >
                Next: Upload Documents
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Government ID Photo</p>
                  <div className="aspect-video bg-cream border-4 border-dashed border-ink rounded-2xl flex flex-col items-center justify-center text-ink/40 gap-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload size={32} />
                    <span className="text-xs font-black">Click to upload</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-black text-ink/70 uppercase tracking-widest ml-1">Selfie Verification</p>
                  <div className="aspect-video bg-cream border-4 border-dashed border-ink rounded-2xl flex flex-col items-center justify-center text-ink/40 gap-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <Camera size={32} />
                    <span className="text-xs font-black">Take a selfie</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-white border-2 border-ink text-ink rounded-2xl font-black hover:bg-cream transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Submit Verification
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-primary/10 text-primary border-2 border-ink rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-ink">Verification Submitted!</h2>
                <p className="text-ink/60 font-black max-w-xs mx-auto">
                  Our team will review your identity documents within 24-48 hours. You'll receive a notification once approved.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
