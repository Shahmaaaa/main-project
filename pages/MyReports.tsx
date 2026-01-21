
import React from 'react';
import { DisasterReport, User } from '../types';
import { SeverityBadge, StatusBadge } from './Dashboard';

interface MyReportsProps {
  user: User;
  reports: DisasterReport[];
}

const MyReports: React.FC<MyReportsProps> = ({ user, reports }) => {
  const userReports = reports.filter(r => r.userId === user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">My Reports</h2>
        <div className="text-sm text-slate-500">Showing {userReports.length} records</div>
      </div>

      <div className="grid gap-4">
        {userReports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition group">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={report.images[0]} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{report.type}</h3>
                    <span className="text-slate-400 font-mono text-xs">{report.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <SeverityBadge severity={report.severityAI} />
                    <StatusBadge status={report.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Location</p>
                    <p className="font-medium text-slate-700">{report.location.district}, {report.location.state}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Date Reported</p>
                    <p className="font-medium text-slate-700">{new Date(report.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Fund Status</p>
                    <p className={`font-bold ${
                      report.fundStatus === 'Released' ? 'text-indigo-600' : 'text-slate-700'
                    }`}>{report.fundStatus}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Blockchain Hash</p>
                    <p className="font-mono text-xs text-slate-500 truncate max-w-[150px]">
                      {report.blockchainHash || 'Pending Verification'}
                    </p>
                  </div>
                </div>

                {report.status === 'Approved' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-emerald-700 font-medium">
                      Verification complete. Smart contract initiated for fund release.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {userReports.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
            <p className="text-slate-400">No disaster reports submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
