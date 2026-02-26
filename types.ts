
export type DisasterType = 'Flood' | 'Cyclone' | 'Earthquake' | 'Landslide';
export type Severity = 'Low' | 'Medium' | 'High';
export type ReportStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
export type FundStatus = 'Pending' | 'Approved' | 'Released';
export type UserRole = 'User' | 'Admin' | 'Donor';


export interface DisasterReport {
  id: string;
  type: DisasterType;
  location: {
    state: string;
    district: string;
    area: string;
    coords?: { lat: number; lng: number };
  };
  date: string;
  affectedPopulation: number;
  infrastructureDamage?: string;
  images: string[]; // Base64 strings for demo
  severityAI: Severity;
  severityFinal?: Severity;
  status: ReportStatus;
  fundStatus: FundStatus;
  blockchainHash?: string;
  timestamp: string;
  details: Record<string, any>;
  evidenceUrls?: {
    news?: string;
    video?: string;
    other?: string;
  };
  recoveryUpdates?: {
    date: string;
    message: string;
    images: string[];
  }[];
  userWallet?: string;
  targetAmount?: number; // In ETH
  raisedAmount?: number; // In ETH
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Donation {
  id: string;
  reportId: string;
  amount: number;
  date: string;
  blockchainHash?: string;
  donorId: string;
  recipientWallet?: string;
}
