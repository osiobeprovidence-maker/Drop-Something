import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { Id } from '../../convex/_generated/dataModel';

export function Admin() {
  // Convex queries
  const kycList = useQuery(api.kyc.getAllKYC);
  const tips = useQuery(api.tips.getAllTips);
  const withdrawals = useQuery(api.withdrawals.getAllWithdrawals);

  const updateKYCStatus = useMutation(api.kyc.updateKYCStatus);

  const loading = kycList === undefined || tips === undefined || withdrawals === undefined;

  const handleKycAction = async (uid: string, status: 'approved' | 'rejected') => {
    try {
      await updateKYCStatus({ uid, status });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-xl font-black text-gray-400 italic">Accessing Admin Control...</p>
    </div>
  );

  return (
    <div className="space-y-16 pb-32 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 blur-xl" />
            <ShieldCheck size={32} className="relative z-10" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-none">Admin Panel</h1>
            <p className="text-xl text-gray-400 font-bold italic mt-2">Manage the hustle, one drop at a time.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-gray-100 rounded-full shadow-sm text-sm font-black flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Volume', value: formatCurrency((tips ?? []).reduce((a, b) => a + b.amount, 0)), icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending KYC', value: (kycList ?? []).filter(k => k.status === 'pending').length, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Pending Payouts', value: (withdrawals ?? []).filter(w => w.status === 'pending').length, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Total Drops', value: (tips ?? []).length, icon: CheckCircle2, color: 'text-gray-900', bg: 'bg-gray-100' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card-soft space-y-4 hover:scale-[1.02]"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <div className="space-y-1">
              <p className="label-mini">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* KYC Queue */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Users size={24} className="text-secondary" />
              KYC Queue
            </h2>
            <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-xs font-black rounded-full uppercase tracking-widest leading-none">
              {(kycList ?? []).filter(k => k.status === 'pending').length} Action Required
            </span>
          </div>
          
          <div className="premium-card-soft !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 label-mini">User</th>
                    <th className="px-8 py-6 label-mini">ID Type</th>
                    <th className="px-8 py-6 label-mini text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(kycList ?? []).map((kyc) => (
                    <tr key={kyc.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-gray-900">{kyc.fullName}</p>
                        <p className="text-xs text-gray-400 font-bold">{kyc.phoneNumber}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">{kyc.idType}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleKycAction(kyc.uid, 'approved')}
                            className="w-10 h-10 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100 group"
                            title="Approve"
                          >
                            <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleKycAction(kyc.uid, 'rejected')}
                            className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 group"
                            title="Reject"
                          >
                            <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-gray-50 rounded-xl transition-all">
                            <Eye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(kycList ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-gray-300">
                          <ShieldCheck size={48} className="opacity-20" />
                          <p className="font-bold italic">Queue is currently clear.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <CreditCard size={24} className="text-primary" />
              Live Feed
            </h2>
            <LinkIcon size={16} className="text-gray-300" />
          </div>
          
          <div className="premium-card-soft !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 label-mini">Supporter</th>
                    <th className="px-8 py-6 label-mini">Amount</th>
                    <th className="px-8 py-6 label-mini text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(tips ?? []).slice(0, 10).map((tip) => (
                    <tr key={tip._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-gray-900">{tip.supporterName}</p>
                        <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{tip.status}</p>
                      </td>
                      <td className="px-8 py-6 font-black text-gray-900">{formatCurrency(tip.amount)}</td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-gray-400">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(tips ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-gray-300">
                          <CreditCard size={48} className="opacity-20" />
                          <p className="font-bold italic">No transactions live yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
