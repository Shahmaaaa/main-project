import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DisasterReport, Severity } from '../types';

interface AdminReviewProps {
  reports: DisasterReport[];
  onUpdate: (id: string, updates: Partial<DisasterReport>) => void;
}

const AdminReview: React.FC<AdminReviewProps> = ({ reports, onUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = reports.find(r => r.id === id);

  const [loading, setLoading] = useState(false);
  const [finalSeverity, setFinalSeverity] = useState<Severity | undefined>(
    report?.severityAI
  );
  const [remarks, setRemarks] = useState('');

  if (!report) {
    return (
      <div className="p-8 text-slate-500 text-center font-bold">
        Report not found.
      </div>
    );
  }

  const handleAction = (status: 'Approved' | 'Rejected') => {
    setLoading(true);

    setTimeout(() => {
      const updates: Partial<DisasterReport> = {
        status,
        severityFinal: finalSeverity,
        fundStatus: status === 'Approved' ? 'Approved' : 'Pending',
        blockchainHash:
          status === 'Approved'
            ? `0x${Math.random().toString(16).slice(2, 42)}`
            : undefined,
      };

      onUpdate(report.id, updates);
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold"
        >
          ← Audit Workspace
        </button>
        <span className="text-xs font-mono text-slate-400">
          ID: {report.id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border p-6">
            <img
              src={report.images[0]}
              alt="Evidence"
              className="w-full rounded-xl object-contain max-h-[400px]"
            />
          </div>

          <div className="bg-white rounded-3xl border p-10 space-y-6">
            <h3 className="text-2xl font-black">Incident Dossier</h3>

            <DetailItem label="Disaster Type" value={report.type} isTitle />
            <DetailItem
              label="Location"
              value={`${report.location.area}, ${report.location.district}`}
            />
            <DetailItem
              label="Affected Population"
              value={report.affectedPopulation.toLocaleString()}
            />
            <DetailItem
              label="Infrastructure Damage"
              value={report.infrastructureDamage || 'N/A'}
            />

            {/* ✅ FLOOD-SPECIFIC DETAILS */}
            {report.type === 'Flood' && (
              <>
                <DetailItem
                  label="Flood Duration (Days)"
                  value={
                    report.details?.floodDays
                      ? `${report.details.floodDays} days`
                      : 'Not specified'
                  }
                />
                <DetailItem
                  label="Flood Start Date"
                  value={
                    report.details?.floodStartDate
                      ? new Date(
                          report.details.floodStartDate
                        ).toLocaleDateString()
                      : 'Not specified'
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-10">
            <p className="text-xs uppercase text-slate-400">AI Severity</p>
            <p className="text-6xl font-black mt-2">{report.severityAI}</p>
          </div>

          <div className="bg-white rounded-3xl p-10 border space-y-8">
            <h4 className="font-black text-xl">Override Severity</h4>

            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as Severity[]).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFinalSeverity(sev)}
                  className={`flex-1 py-4 rounded-xl font-black ${
                    finalSeverity === sev
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Admin remarks..."
              className="w-full border rounded-xl p-4 h-28"
            />

            <button
              onClick={() => handleAction('Approved')}
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-black"
            >
              Approve Relief
            </button>

            <button
              onClick={() => handleAction('Rejected')}
              disabled={loading}
              className="w-full py-4 border text-rose-600 rounded-xl font-black"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  isTitle,
}: {
  label: string;
  value: string;
  isTitle?: boolean;
}) => (
  <div>
    <p className="text-xs uppercase text-slate-400">{label}</p>
    <p className={isTitle ? 'text-3xl font-black' : 'font-semibold'}>
      {value}
    </p>
  </div>
);

export default AdminReview;
