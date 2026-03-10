export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
  isVerified: boolean;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  bankDetails?: BankDetails;
  createdAt: number;
  role?: 'user' | 'admin';
}

export interface KYCData {
  uid: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  idType: 'NIN' | 'DriversLicense' | 'Passport' | 'VotersCard';
  idNumber: string;
  idImageUrl: string;
  selfieUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  rejectionReason?: string;
}

export interface Tip {
  id: string;
  creatorId: string;
  supporterName: string;
  amount: number;
  message: string;
  isAnonymous: boolean;
  paymentReference: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: number;
}

export interface Withdrawal {
  id: string;
  creatorId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: number;
  processedAt?: number;
}

export interface PlatformStats {
  totalTips: number;
  totalCreators: number;
  totalSupporters: number;
}
