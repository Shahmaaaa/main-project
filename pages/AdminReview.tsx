import React, { useState, useEffect } from 'react';
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
  const [verifying, setVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<{
    verified: boolean;
    reasoning: string;
    visualSeverity: string;
    fraudRisk: string;
    confidence: number;
  } | null>(null);

  const [finalSeverity, setFinalSeverity] = useState<Severity | undefined>(
    report?.severityAI
  );
  const [remarks, setRemarks] = useState('');
  const [fundAmount, setFundAmount] = useState<number>(0.1);
  const [activeImage, setActiveImage] = useState(report?.images[0] || '');

  // Update fund amount suggestion when severity changes
  useEffect(() => {
    if (finalSeverity === 'Low') setFundAmount(0.1);
    else if (finalSeverity === 'Medium') setFundAmount(0.5);
    else if (finalSeverity === 'High') setFundAmount(1.0);
  }, [finalSeverity]);

  const handleAIVerify = async () => {
    if (!report) return;
    setVerifying(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${report.id}/verify`);
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        if (data.visualSeverity) setFinalSeverity(data.visualSeverity as Severity);
      } else {
        alert(`${data.error}: ${data.details || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reach AI service");
    } finally {
      setVerifying(false);
    }
  };

  if (!report) {
    return (
      <div className="p-8 text-slate-500 text-center font-bold">
        Report not found.
      </div>
    );
  }

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    setLoading(true);

    try {
      // 🔗 CALL BACKEND: The backend will trigger the Blockchain transaction if status is 'Approved'
      await onUpdate(report.id, {
        status,
        severityFinal: finalSeverity,
        fundStatus: status === 'Approved' ? 'Pending' : 'N/A',
        amount: status === 'Approved' ? fundAmount : undefined
      });

      setLoading(false);
      navigate('/');
    } catch (err) {
      console.error("Action failed", err);
      alert("Verification failed. Make sure Ganache and Backend are running.");
      setLoading(false);
    }
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
          <div className="bg-white rounded-3xl border p-6 space-y-4">
            <img
              src={activeImage || report.images[0]}
              alt="Evidence"
              className="w-full rounded-xl object-contain max-h-[400px] bg-slate-50"
            />
            {report.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {report.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${activeImage === img ? 'border-blue-500 scale-105' : 'border-transparent hover:border-slate-300'}`}
                  />
                ))}
              </div>
            )}
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

            {/* ✅ ADDITIONAL EVIDENCE LINKS */}
            {(report.evidenceUrls?.news || report.evidenceUrls?.video) && (
              <div className="pt-6 border-t space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">External Verification</h4>
                <div className="flex flex-wrap gap-4">
                  {report.evidenceUrls.news && (
                    <a
                      href={report.evidenceUrls.news}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v4a2 2 0 002 2h4" />
                      </svg>
                      News Report
                    </a>
                  )}
                  {report.evidenceUrls.video && (
                    <a
                      href={report.evidenceUrls.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Video Evidence
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* ✅ GEMINI AI AUDIT SECTION */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <span className="text-xl">✨</span> Gemini AI Audit
              </h4>
              {aiResult && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${aiResult.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                  {aiResult.verified ? 'Verified' : 'Flagged'}
                </span>
              )}
            </div>

            {!aiResult ? (
              <button
                onClick={handleAIVerify}
                disabled={verifying}
                className="w-full py-4 bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-700 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Analyzing Evidence...
                  </>
                ) : (
                  "Run Gemini Verification"
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 bg-white rounded-2xl border text-sm text-slate-600 italic">
                  "{aiResult.reasoning}"
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Confidence</p>
                    <p className="font-black text-blue-600">{aiResult.confidence}%</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Visual Sev.</p>
                    <p className="font-black text-amber-600">{aiResult.visualSeverity}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${aiResult.fraudRisk === 'High' ? 'bg-rose-50 border-rose-200' :
                      aiResult.fraudRisk === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                    }`}>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Fraud Risk</p>
                    <p className={`font-black ${aiResult.fraudRisk === 'High' ? 'text-rose-600' :
                        aiResult.fraudRisk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>{aiResult.fraudRisk}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiResult(null)}
                  className="w-full text-xs text-slate-400 underline"
                >
                  Re-analyze
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-10">
            <p className="text-xs uppercase text-slate-400">Initial ML Severity</p>
            <p className="text-6xl font-black mt-2">{report.severityAI}</p>
          </div>

          <div className="bg-white rounded-3xl p-10 border space-y-8">
            <h4 className="font-black text-xl">Final Determination</h4>

            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as Severity[]).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFinalSeverity(sev)}
                  className={`flex-1 py-4 rounded-xl font-black transition-all ${finalSeverity === sev
                    ? 'bg-slate-900 text-white scale-105'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-blue-400">Suggested Fund</span>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">ETH</span>
              </div>
              <div className="flex items-end gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(parseFloat(e.target.value))}
                  className="bg-transparent text-3xl font-black text-blue-700 w-full outline-none"
                />
              </div>
              <p className="text-[10px] text-blue-400 italic font-medium">
                Default: Low=0.1, Med=0.5, High=1.0 ETH
              </p>
            </div>

            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add verification notes or flags..."
              className="w-full border rounded-xl p-4 h-28 focus:ring-2 ring-blue-500 outline-none"
            />

            <div className="space-y-3">
              <button
                onClick={() => handleAction('Approved')}
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Recording to Blockchain..." : "Approve Relief Fund"}
              </button>

              <button
                onClick={() => handleAction('Rejected')}
                disabled={loading}
                className="w-full py-4 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all"
              >
                Reject Report
              </button>
            </div>
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
