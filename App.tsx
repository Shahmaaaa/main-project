import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, DisasterReport, Donation } from './types';
import { db } from './services/db';

// Pages
import Landing from './pages/Landing';
import UserDashboard from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import AdminVerifiedReports from './pages/AdminVerifiedReports';
import AdminRejectedReports from './pages/AdminRejectedReports';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import AdminReview from './pages/AdminReview';
import AIAnalyzer from './pages/AIAnalyzer';
import DonorDashboard from './pages/DonorDashboard';
import DonorGiving from './pages/DonorGiving';
import DonorImpactJourney from './pages/DonorImpactJourney';

// Shared Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { NotificationContainer } from './components/NotificationSystem';

interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [prevApprovedCount, setPrevApprovedCount] = useState<number | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const init = async () => {
      const session = db.auth.getSession();
      if (session) setUser(session);

      try {
        const allReports = await db.reports.all();
        setReports(allReports);

        // Initialize the approved count
        const approvedCount = allReports.filter(r => r.status === 'Approved').length;
        setPrevApprovedCount(approvedCount);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    db.reports.all().then(setReports);
  };

  const handleLogout = () => {
    db.auth.logout();
    setUser(null);
  };

  const handleAddReport = async (report: DisasterReport) => {
    await db.reports.create(report);
    const updated = await db.reports.all();
    setReports(updated);
  };

  const handleUpdateReport = async (id: string, updates: Partial<DisasterReport>) => {
    try {
      const updated = await db.reports.update(id, updates);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleNewDonation = (donation: Donation) => {
    setDonations(prev => [donation, ...prev]);
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this report?')) return;
    try {
      await db.reports.delete(id);
      const updated = await db.reports.all();
      setReports(updated);
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report');
    }
  };

  // 🚨 NOTIFICATION LISTENER
  useEffect(() => {
    if (!user || user.role !== 'Donor' || prevApprovedCount === null) return;

    const currentApproved = reports.filter(r => r.status === 'Approved');

    if (currentApproved.length > prevApprovedCount) {
      const latest = currentApproved[0];

      const newNotif: NotificationItem = {
        id: Math.random().toString(),
        message: `🚨 Emergency Alert: A ${latest.type} in ${latest.location.area} has been verified. Support is needed!`,
        type: 'success',
        timestamp: new Date()
      };

      setNotifications(prev => [newNotif, ...prev]);
    }

    setPrevApprovedCount(currentApproved.length);
  }, [reports, user, prevApprovedCount]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Landing onLogin={handleLogin} />;
  }

  const renderRoutes = () => {
    // USER
    if (user.role === 'User') {
      return (
        <Routes>
          <Route path="/" element={<UserDashboard user={user} reports={reports} />} />
          <Route
            path="/report"
            element={<ReportDisaster user={user} onAddReport={handleAddReport} />}
          />
          <Route path="/ai-analysis" element={<AIAnalyzer />} />
          <Route
            path="/my-reports"
            element={<MyReports user={user} reports={reports} onUpdate={handleUpdateReport} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    // DONOR
    if (user.role === 'Donor') {
      return (
        <Routes>
          <Route path="/" element={<DonorDashboard reports={reports} donations={donations} onDonate={handleNewDonation} />} />
          <Route path="/my-giving" element={<DonorGiving reports={reports} donations={donations} />} />
          <Route path="/impact-journey" element={<DonorImpactJourney reports={reports} donations={donations} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    // ADMIN
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard reports={reports} onDelete={handleDeleteReport} />} />
        <Route
          path="/verified"
          element={<AdminVerifiedReports reports={reports} />}
        />
        <Route
          path="/rejected"
          element={<AdminRejectedReports reports={reports} />}
        />
        <Route
          path="/review/:id"
          element={
            <AdminReview
              reports={reports}
              onUpdate={handleUpdateReport}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 relative">
        <Sidebar role={user.role} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <Header user={user} />
          <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {renderRoutes()}
          </main>
        </div>
        <NotificationContainer
          notifications={notifications}
          removeNotification={removeNotification}
        />
      </div>
    </Router>
  );
};

export default App;
