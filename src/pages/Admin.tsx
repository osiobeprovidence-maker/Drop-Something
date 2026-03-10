import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { KYCData, Tip, Withdrawal } from '../types';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Eye
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export function Admin() {
  const [kycList, setKycList] = useState<KYCData[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeKyc = onSnapshot(query(collection(db, 'kyc'), orderBy('submittedAt', 'desc')), (snap) => {
      setKycList(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as KYCData)));
    });

    const unsubscribeTips = onSnapshot(query(collection(db, 'tips'), orderBy('createdAt', 'desc')), (snap) => {
      setTips(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Tip)));
    });

    const unsubscribeWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Withdrawal)));
      setLoading(false);
    });

    return () => {
      unsubscribeKyc();
      unsubscribeTips();
      unsubscribeWithdrawals();
    };
  }, []);

  const handleKycAction = async (uid: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'kyc', uid), { 
        status, 
        reviewedAt: Date.now() 
      });
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', uid), { isVerified: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-black text-primary animate-pulse">Loading Admin Panel...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-ink text-white rounded-2xl flex items-center justify-center border-2 border-white shadow-[2px_2px_0_0_#FF4D8D]">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-ink">Admin Control Panel</h1>
          <p className="text-ink/60 font-black">Manage KYC, transactions, and platform health.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: formatCurrency(tips.reduce((a, b) => a + b.amount, 0)), icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10', shadow: 'shadow-[4px_4px_0_0_#FF4D8D]' },
          { label: 'Pending KYC', value: kycList.filter(k => k.status === 'pending').length, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10', shadow: 'shadow-[4px_4px_0_0_#6B3CF6]' },
          { label: 'Pending Payouts', value: withdrawals.filter(w => w.status === 'pending').length, icon: Clock, color: 'text-accent', bg: 'bg-accent/10', shadow: 'shadow-[4px_4px_0_0_#FF7A00]' },
          { label: 'Total Tips', value: tips.length, icon: CheckCircle2, color: 'text-ink', bg: 'bg-ink/10', shadow: 'shadow-[4px_4px_0_0_#111111]' },
        ].map((stat, i) => (
          <div key={i} className={cn("bg-white p-6 rounded-3xl border-4 border-ink space-y-2", stat.shadow)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-2 border-ink", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs font-black text-ink/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* KYC Queue */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Users size={20} className="text-secondary" />
            KYC Verification Queue
          </h2>
          <div className="bg-white rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#111111] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cream border-b-4 border-ink">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">ID Type</th>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-ink/5">
                {kycList.map((kyc) => (
                  <tr key={kyc.uid} className="hover:bg-cream/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-ink">{kyc.fullName}</p>
                      <p className="text-xs text-ink/40 font-black">{kyc.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink/60 font-black">{kyc.idType}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-black uppercase border-2 border-ink",
                        kyc.status === 'approved' ? "bg-primary/10 text-primary border-primary" :
                        kyc.status === 'pending' ? "bg-secondary/10 text-secondary border-secondary" :
                        "bg-red-100 text-red-700 border-red-500"
                      )}>
                        {kyc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleKycAction(kyc.uid, 'approved')}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border-2 border-transparent hover:border-primary"
                          title="Approve"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleKycAction(kyc.uid, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-500"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                        <button className="p-2 text-ink/40 hover:bg-cream rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {kycList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-ink/40 font-black italic">No KYC submissions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Recent Transactions
          </h2>
          <div className="bg-white rounded-[2rem] border-4 border-ink shadow-[8px_8px_0_0_#6B3CF6] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cream border-b-4 border-ink">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">Supporter</th>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-ink/40 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-ink/5">
                {tips.slice(0, 10).map((tip) => (
                  <tr key={tip.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-6 py-4 font-black text-ink">{tip.supporterName}</td>
                    <td className="px-6 py-4 font-black text-primary">{formatCurrency(tip.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-black uppercase border-2 border-ink",
                        tip.status === 'success' ? "bg-primary/10 text-primary border-primary" : "bg-red-100 text-red-700 border-red-500"
                      )}>
                        {tip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink/40 font-black">
                      {new Date(tip.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
