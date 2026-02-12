
import React from 'react';
import { DisasterReport, User } from '../types';
import { SeverityBadge, StatusBadge } from './Dashboard';

interface MyReportsProps {
  user: User;
  reports: DisasterReport[];
  onUpdate: (id: string, updates: Partial<DisasterReport>) => void;
}

const MyReports: React.FC<MyReportsProps> = ({ user, reports, onUpdate }) => {
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = React.useState('');
  const [updateImage, setUpdateImage] = React.useState('');
  const [posting, setPosting] = React.useState(false);

  const handleUpdateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUpdateImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submitUpdate = async () => {
    if (!selectedReportId || !updateMessage || !updateImage) return;
    setPosting(true);

    const report = reports.find(r => r.id === selectedReportId);
    const existingUpdates = report?.recoveryUpdates || [];

    const newUpdate = {
      date: new Date().toLocaleDateString(),
      message: updateMessage,
      images: [updateImage]
    };

    await onUpdate(selectedReportId, {
      recoveryUpdates: [newUpdate, ...existingUpdates]
    });

    setPosting(false);
    setSelectedReportId(null);
    setUpdateMessage('');
    setUpdateImage('');
    alert("Recovery update posted! This will be visible on the Donor Journey.");
  };
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
                    <p className={`font-bold ${report.fundStatus === 'Released' ? 'text-indigo-600' : 'text-slate-700'
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
                  <div className="flex flex-col gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-emerald-700 font-medium">
                        Verification complete. Smart contract initiated for fund release.
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReportId(report.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition w-fit"
                    >
                      Post Recovery Update 📂
                    </button>
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

      {/* RECOVERY MODAL */}
      {selectedReportId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6 mx-4">
            <h3 className="text-xl font-black italic">Recovery Impact Update</h3>
            <p className="text-sm text-slate-500">Upload progress photos and a message to show donors how your area is recovering.</p>

            <div className="space-y-4">
              <textarea
                className="w-full border-2 border-slate-100 p-4 rounded-xl focus:ring-2 ring-indigo-500 outline-none h-24 text-sm"
                placeholder="Share progress: e.g. Community kitchen started, water levels receding..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
              />
              <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center bg-slate-50">
                <input type="file" onChange={handleUpdateImage} className="hidden" id="rec-img" />
                <label htmlFor="rec-img" className="text-indigo-600 font-bold text-sm cursor-pointer hover:underline italic">
                  {updateImage ? "Photo Ready ✓" : "Drop Recovery Photo Here"}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitUpdate}
                disabled={posting}
                className="flex-grow bg-indigo-600 text-white py-3 rounded-xl font-black hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {posting ? "Publishing..." : "Sync to Blockchain & Donor Dashboard"}
              </button>
              <button
                onClick={() => setSelectedReportId(null)}
                className="px-6 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
