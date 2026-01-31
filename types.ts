
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
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
