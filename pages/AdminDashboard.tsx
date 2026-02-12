
import React from 'react';
import { Link } from 'react-router-dom';
import { DisasterReport } from '../types';
import { SeverityBadge, StatusBadge } from './Dashboard';
import { DisasterMap } from '../components/DisasterMap';

interface AdminDashboardProps {
  reports: DisasterReport[];
  onDelete: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports, onDelete }) => {
  const pending = reports.filter(r => r.status === 'Pending').length;
  const approved = reports.filter(r => r.status === 'Approved').length;
  const rejected = reports.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Control Center</h2>
          <p className="text-slate-500">Verifying disaster evidence and releasing funds via Blockchain.</p>
        </div>
      </div>

      <DisasterMap reports={reports} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Reports</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Pending</p>
          <p className="text-4xl font-black text-amber-600 mt-2">{pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Verified</p>
          <p className="text-4xl font-black text-emerald-600 mt-2">{approved}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Released</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-4xl font-black text-indigo-600">
              {reports.filter(r => r.fundStatus === 'Released').length}
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded font-bold">ETH NETWORK</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Needs Review</h3>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Critical Priority</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">Evidence</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">AI Prediction</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.filter(r => r.status === 'Pending').map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={report.images[0]} alt="Evidence" className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{report.type}</div>
                    <div className="text-xs text-slate-500">{report.location.district}, {report.location.state}</div>
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={report.severityAI} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {report.userName}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDelete(report.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
                      title="Remove Duplicate/Invalid Report"
                    >
                      <svg className="w-5 h-5 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <Link
                      to={`/review/${report.id}`}
                      className="inline-flex items-center gap-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm"
                    >
                      Review
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
              {pending === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    All reports have been processed. Good job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default AdminDashboard;
