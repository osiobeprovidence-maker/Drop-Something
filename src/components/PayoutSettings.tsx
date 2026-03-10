import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../AuthContext';
import { Building2, CreditCard, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const NIGERIAN_BANKS = [
  "Access Bank",
  "Zenith Bank",
  "Guaranty Trust Bank (GTB)",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Fidelity Bank",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Union Bank of Nigeria",
  "Wema Bank",
  "Kuda Bank",
  "Moniepoint MFB",
  "OPay",
  "Palmpay",
  "VFD Microfinance Bank",
  "FairMoney MFB"
].sort();

export function PayoutSettings() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Convex query + mutation
  const existingDetails = useQuery(
    api.bankDetails.getBankDetails,
    user ? { userId: user.uid } : 'skip'
  );
  const saveBankDetails = useMutation(api.bankDetails.saveBankDetails);

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Pre-fill when existing data arrives
  React.useEffect(() => {
    if (existingDetails) {
      setBankName(existingDetails.bankName);
      setAccountNumber(existingDetails.accountNumber);
      setAccountName(existingDetails.accountName);
    }
  }, [existingDetails]);

  const loading = existingDetails === undefined && user !== null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!bankName) {
      setError('Please select a bank');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await saveBankDetails({
        userId: user.uid,
        bankName,
        accountNumber,
        accountName,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving bank details:', err);
      setError('Failed to save bank details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border-4 border-ink shadow-[12px_12px_0_0_#111111] space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 text-secondary border-2 border-ink rounded-2xl flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-ink">Payout Settings</h2>
            <p className="text-ink/60 font-bold">Manage where you receive your earnings.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-ink/40 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} />
                Select Bank
              </label>
              <select
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-4 bg-cream/50 border-2 border-ink rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black appearance-none"
              >
                <option value="">Choose your bank...</option>
                {NIGERIAN_BANKS.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-ink/40 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} />
                Account Number
              </label>
              <input
                type="text"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit account number"
                className="w-full px-4 py-4 bg-cream/50 border-2 border-ink rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-ink/40 uppercase tracking-widest flex items-center gap-2">
                <User size={14} />
                Account Name
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Name as it appears on your bank account"
                className="w-full px-4 py-4 bg-cream/50 border-2 border-ink rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-black"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_0_0_#111111] active:shadow-none active:translate-y-1"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <>
                <CheckCircle2 size={20} />
                Saved Successfully
              </>
            ) : (
              'Save Payout Details'
            )}
          </button>
        </form>

        <div className="p-6 bg-cream rounded-3xl border-2 border-ink/10">
          <p className="text-xs text-ink/50 font-bold leading-relaxed">
            <span className="font-black text-ink block mb-1 uppercase tracking-widest">Security Note:</span>
            Your bank details are stored securely in Convex and are only used to process your withdrawal requests. We never share this information with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
