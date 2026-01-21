
import React from 'react';
import { Link } from 'react-router-dom';
import { User, DisasterReport } from '../types';

interface DashboardProps {
  user: User;
  reports: DisasterReport[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, reports }) => {
  const userReports = reports.filter(r => r.userId === user.id);
  const pending = userReports.filter(r => r.status === 'Pending').length;
  const approved = userReports.filter(r => r.status === 'Approved').length;
  const fundsReleased = userReports.filter(r => r.fundStatus === 'Released').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <svg className="w-64 h-64 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
             </svg>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Secure • Node 0.4.2</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Welcome back,<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                  {user.name}
                </span>
              </h1>
              
              <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
                Your humanitarian node is active. You have <span className="text-slate-900 font-bold">{pending} pending reports</span> requiring attention from the validation network.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/report"
                className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                <svg className="w-5 h-5 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Incident Report
              </Link>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Free tier active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Submissions" value={userReports.length} icon="📋" label="Total Filed" />
        <StatCard title="In Review" value={pending} icon="⏳" label="Pending AI/Human" color="text-amber-500" />
        <StatCard title="Verified" value={approved} icon="✅" label="On-Chain Confirmed" color="text-emerald-500" />
        <StatCard title="Disbursed" value={`$${(fundsReleased * 1250).toLocaleString()}`} icon="💰" label="Relief Payouts" color="text-indigo-600" />
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="space-y-1">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">Active Ledger</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">LIVE TRANSACTION LOG</p>
          </div>
          <Link to="/my-reports" className="group flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 transition">
            See All Transactions
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">TXN Hash</th>
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Jurisdiction</th>
                <th className="px-8 py-5">Severity</th>
                <th className="px-8 py-5 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userReports.slice(0, 5).map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6 font-mono text-[10px] text-slate-400 uppercase">{report.id.replace('REP-', '0x')}...</td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{report.type}</div>
                    <div className="text-[10px] text-slate-400 font-medium">FILED {new Date(report.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-semibold">{report.location.district}</td>
                  <td className="px-8 py-6">
                    <SeverityBadge severity={report.severityAI} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <StatusBadge status={report.status} />
                  </td>
                </tr>
              ))}
              {userReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                       <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">🛰️</div>
                       <div className="space-y-1">
                         <p className="text-slate-900 font-black tracking-tight">No Reports Logged</p>
                         <p className="text-slate-400 text-xs font-medium">Your activity will appear here once you file your first disaster report.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, label, color = "text-slate-900" }: { title: string; value: number | string; icon: string; label: string; color?: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
    <div className="flex items-start justify-between mb-6">
      <div className="text-3xl bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
        {icon}
      </div>
      <div className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Live
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
      <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
      <p className="text-slate-400 text-[10px] font-bold mt-2">{label}</p>
    </div>
  </div>
);

export const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors = {
    High: 'bg-rose-50 text-rose-600 border-rose-100',
    Medium: 'bg-amber-50 text-amber-600 border-amber-100',
    Low: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors[severity as keyof typeof colors] || 'bg-slate-100 text-slate-400'}`}>
      {severity}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    Approved: 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-200',
    Rejected: 'bg-rose-500 text-white border-rose-600 shadow-rose-200',
    Pending: 'bg-slate-100 text-slate-600 border-slate-200',
    'Under Review': 'bg-blue-600 text-white border-blue-700 shadow-blue-200',
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${colors[status as keyof typeof colors] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
};

export default Dashboard;
