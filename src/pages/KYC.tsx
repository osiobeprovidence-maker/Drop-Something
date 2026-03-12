import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'motion/react';
import { Shield, Camera, Upload, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
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

  const submitKYC = useMutation(api.kyc.submitKYC);

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await submitKYC({
        uid: user.uid,
        ...formData,
        idImageUrl: 'https://picsum.photos/seed/id/400/300', // Placeholder
        selfieUrl: 'https://picsum.photos/seed/selfie/400/400', // Placeholder
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card-soft overflow-hidden !p-0"
      >
        <div className="bg-gray-900 p-10 text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20" />
          
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center border-2 border-white/10 shadow-2xl relative z-10 shrink-0">
            <Shield size={40} />
          </div>
          <div className="text-center md:text-left relative z-10">
            <h1 className="text-4xl font-black tracking-tighter">Identity Verification</h1>
            <p className="text-gray-400 text-lg font-bold italic">Required to receive tips and withdraw funds safely.</p>
          </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="label-mini ml-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="premium-input text-lg"
                      placeholder="As shown on your ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-mini ml-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="premium-input text-lg"
                      placeholder="e.g. 08012345678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-mini ml-1">Government ID Type</label>
                  <select
                    value={formData.idType}
                    onChange={e => setFormData({ ...formData, idType: e.target.value as any })}
                    className="premium-input text-lg appearance-none"
                  >
                    <option value="NIN">National ID (NIN)</option>
                    <option value="DriversLicense">Driver's License</option>
                    <option value="Passport">International Passport</option>
                    <option value="VotersCard">Voter's Card</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label-mini ml-1">ID Number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                    className="premium-input text-lg"
                    placeholder="Enter ID number"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-6 bg-black text-white rounded-full font-black text-xl hover:scale-[1.02] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Next: Upload Documents
                <ArrowRight size={24} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="label-mini ml-1">ID Photo (Front)</p>
                  <div className="aspect-[4/3] bg-gray-50 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-300 gap-4 hover:border-primary/30 hover:bg-white transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Click to upload</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="label-mini ml-1">Selfie Verification</p>
                  <div className="aspect-[4/3] bg-gray-50 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-300 gap-4 hover:border-primary/30 hover:bg-white transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Take a selfie</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 bg-gray-50 text-gray-500 rounded-full font-black text-lg hover:bg-gray-100 transition-all active:scale-95"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-6 bg-primary text-white rounded-full font-black text-xl hover:scale-[1.02] shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                  Submit Verification
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-10">
              <div className="w-32 h-32 bg-primary/10 text-primary rounded-[3rem] flex items-center justify-center mx-auto shadow-inner relative">
                <CheckCircle2 size={64} />
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Verification Submitted!</h2>
                <p className="text-gray-500 font-bold text-lg italic max-w-sm mx-auto leading-relaxed">
                  Our team will review your identity documents within 24-48 hours. You'll receive an email once approved.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-16 py-6 bg-black text-white rounded-full font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-2xl"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
