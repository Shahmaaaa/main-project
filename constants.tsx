
import { DisasterReport, User } from './types';

export const MOCK_REPORTS: DisasterReport[] = [
  {
    id: 'REP-10245',
    type: 'Flood',
    location: { state: 'Kerala', district: 'Wayanad', area: 'Meppadi' },
    date: '2025-05-12',
    affectedPopulation: 1200,
    severityAI: 'High',
    severityFinal: 'High',
    status: 'Approved',
    fundStatus: 'Released',
    blockchainHash: '0x8f2c...e4a1',
    timestamp: '2025-05-12T10:30:00Z',
    images: ['https://picsum.photos/seed/flood1/800/600'],
    details: { waterLevel: 'High', duration: '3 days' },
    userId: 'user1',
    userName: 'Shahma CT'
  },
  {
    id: 'REP-10246',
    type: 'Landslide',
    location: { state: 'Himachal', district: 'Mandi', area: 'Pandoh' },
    date: '2025-06-01',
    affectedPopulation: 450,
    severityAI: 'Medium',
    status: 'Pending',
    fundStatus: 'Pending',
    timestamp: '2025-06-01T14:15:00Z',
    images: ['https://picsum.photos/seed/landslide1/800/600'],
    details: { areaType: 'Road', roadBlocked: 'Yes' },
    userId: 'user1',
    userName: 'Shahma CT'
  }
];

export const CURRENT_USER: User = {
  id: 'user1',
  name: 'Shahma CT',
  email: 'shahma@example.com',
  role: 'User'
};

export const ADMIN_USER: User = {
  id: 'admin1',
  name: 'Relief Admin',
  email: 'admin@blockaid.gov',
  role: 'Admin'
};
