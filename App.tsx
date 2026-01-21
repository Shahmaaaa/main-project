import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, DisasterReport } from './types';
import { db } from './services/db';

// Pages
import Landing from './pages/Landing';
import UserDashboard from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import AdminReview from './pages/AdminReview';
import AIAnalyzer from './pages/AIAnalyzer';

// Shared Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const session = db.auth.getSession();
      if (session) {
        setUser(session);
      }

      try {
        const allReports = await db.reports.all();
        setReports(allReports);
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

  const handleUpdateReport = async (
    id: string,
    updates: Partial<DisasterReport>
  ) => {
    await db.reports.update(id, updates);
    const updated = await db.reports.all();
    setReports(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → Landing
  if (!user) {
    return <Landing onLogin={handleLogin} />;
  }

  const renderRoutes = () => {
    if (user.role === 'User') {
      return (
        <Routes>
          <Route
            path="/"
            element={<UserDashboard user={user} reports={reports} />}
          />
          <Route
            path="/report"
            element={<ReportDisaster user={user} onAddReport={handleAddReport} />}
          />

          {/* ✅ AI ANALYSIS ROUTE */}
          <Route path="/ai-analysis" element={<AIAnalyzer />} />

          <Route
            path="/my-reports"
            element={<MyReports user={user} reports={reports} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    // Admin Routes
    return (
      <Routes>
        <Route path="/" element={<AdminDashboard reports={reports} />} />
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
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role={user.role} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <Header user={user} />
          <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {renderRoutes()}
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
