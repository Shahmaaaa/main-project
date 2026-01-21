
import { User, DisasterReport } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Initial Mock Data for Demo Mode
const INITIAL_USERS = [
  { id: 'user1', name: 'Shahma CT', email: 'shahma@example.com', password: 'password', role: 'User' },
  { id: 'admin1', name: 'Relief Admin', email: 'admin@blockaid.gov', password: 'admin', role: 'Admin' }
];

const INITIAL_REPORTS: DisasterReport[] = [
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
  }
];

// Internal helper for localStorage fallback
const getStorage = (key: string) => {
  const data = localStorage.getItem(key);
  if (!data) {
    // Seed the data if it's the first time
    if (key === 'mock_users') return INITIAL_USERS;
    if (key === 'mock_reports') return INITIAL_REPORTS;
    return [];
  }
  return JSON.parse(data);
};

const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

/**
 * Generic request helper with automatic fallback to local storage
 */
async function request<T>(path: string, options?: RequestInit, fallbackAction?: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || 'API Request failed');
    }
    
    return await res.json();
  } catch (error) {
    console.warn(`Backend unreachable at ${path}. Using fallback storage.`, error);
    if (fallbackAction) return fallbackAction();
    throw error;
  }
}

export const db = {
  users: {
    create: async (user: User & { password?: string }): Promise<User> => {
      return request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(user)
      }, () => {
        const users = getStorage('mock_users');
        if (users.find((u: any) => u.email === user.email)) throw new Error('User already exists (Local)');
        users.push(user);
        setStorage('mock_users', users);
        return user;
      });
    },
    findByEmail: async (email: string): Promise<User | undefined> => {
      const users = getStorage('mock_users');
      return users.find((u: any) => u.email === email);
    }
  },

  reports: {
    all: async (): Promise<DisasterReport[]> => {
      return request<DisasterReport[]>('/reports', {}, () => getStorage('mock_reports'));
    },
    create: async (report: DisasterReport): Promise<void> => {
      return request<void>('/reports', {
        method: 'POST',
        body: JSON.stringify(report)
      }, () => {
        const reports = getStorage('mock_reports');
        reports.unshift(report);
        setStorage('mock_reports', reports);
      });
    },
    update: async (id: string, updates: Partial<DisasterReport>): Promise<void> => {
      return request<void>(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }, () => {
        const reports = getStorage('mock_reports');
        const idx = reports.findIndex((r: any) => r.id === id);
        if (idx !== -1) {
          reports[idx] = { ...reports[idx], ...updates };
          setStorage('mock_reports', reports);
        }
      });
    },
    byUserId: async (userId: string): Promise<DisasterReport[]> => {
      return request<DisasterReport[]>(`/reports?userId=${userId}`, {}, () => {
        return getStorage('mock_reports').filter((r: any) => r.userId === userId);
      });
    }
  },

  auth: {
    login: async (email: string, password: string): Promise<User> => {
      return request<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }, () => {
        const users = getStorage('mock_users');
        const user = users.find((u: any) => u.email === email && u.password === password);
        if (!user) throw new Error('Invalid credentials. For Demo Mode, use: shahma@example.com / password');
        return user;
      });
    },
    setSession: (user: User) => {
      localStorage.setItem('blockaid_session', JSON.stringify(user));
    },
    getSession: (): User | null => {
      const data = localStorage.getItem('blockaid_session');
      return data ? JSON.parse(data) : null;
    },
    logout: () => {
      localStorage.removeItem('blockaid_session');
    }
  }
};
