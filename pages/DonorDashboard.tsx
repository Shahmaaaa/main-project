import React, { useState } from "react";
import { DisasterReport } from "../types";

interface DonorDashboardProps {
  reports: DisasterReport[];
}

interface Donation {
  reportId: string;
  amount: number;
  date: string;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ reports }) => {
  const approvedReports = reports.filter(
    (r) => r.status === "Approved"
  );

  const [selectedReport, setSelectedReport] =
    useState<DisasterReport | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [donations, setDonations] = useState<Donation[]>([]);

  // ---------------- METRICS ----------------
  const totalAffected = approvedReports.reduce(
    (sum, r) => sum + r.affectedPopulation,
    0
  );

  // ---------------- DONATE ----------------
  const handleDonate = () => {
    if (!selectedReport || amount <= 0) {
      alert("Enter a valid donation amount");
      return;
    }

    setDonations([
      ...donations,
      {
        reportId: selectedReport.id,
        amount,
        date: new Date().toLocaleString(),
      },
    ]);

    alert("Thank you for your donation ❤️");

    setSelectedReport(null);
    setAmount(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black">Donor Dashboard</h1>
        <p className="text-slate-500">
          Support verified disaster relief efforts transparently.
        </p>
      </div>

      {/* IMPACT STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Approved Disasters" value={approvedReports.length} />
        <StatCard
          label="People Affected"
          value={totalAffected.toLocaleString()}
        />
        <StatCard
          label="Your Donations"
          value={`₹${donations.reduce((s, d) => s + d.amount, 0)}`}
        />
      </div>

      {/* DISASTER LIST */}
      {approvedReports.length === 0 && (
        <p className="text-slate-400 mt-10">No approved disasters yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {approvedReports.map((report) => (
          <div
            key={report.id}
            className="bg-white border rounded-2xl p-6 shadow"
          >
            <img
              src={report.images[0]}
              className="h-48 w-full object-cover rounded-xl mb-4"
            />

            <h3 className="text-xl font-black">{report.type}</h3>
            <p className="text-sm text-slate-500">
              {report.location.area}, {report.location.district}
            </p>

            <p className="mt-2">
              <strong>Affected:</strong>{" "}
              {report.affectedPopulation.toLocaleString()}
            </p>

            <p className="mt-1">
              <strong>Severity:</strong>{" "}
              <span className="font-bold text-red-600">
                {report.severityFinal ?? report.severityAI}
              </span>
            </p>

            <button
              className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold"
              onClick={() => setSelectedReport(report)}
            >
              Donate Now
            </button>
          </div>
        ))}
      </div>

      {/* DONATION HISTORY */}
      {donations.length > 0 && (
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-black mb-4">Donation History</h2>
          <ul className="space-y-3">
            {donations.map((d, i) => (
              <li
                key={i}
                className="flex justify-between text-sm border-b pb-2"
              >
                <span>Report ID: {d.reportId}</span>
                <span>₹{d.amount}</span>
                <span className="text-slate-400">{d.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DONATE MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-4">
            <h2 className="text-xl font-black">Donate for Relief</h2>
            <p className="text-slate-500">
              {selectedReport.type} – {selectedReport.location.area}
            </p>

            <input
              type="number"
              placeholder="Enter amount (₹)"
              className="w-full border rounded-lg px-4 py-3"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <div className="flex gap-3">
              <button
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold"
                onClick={handleDonate}
              >
                Confirm Donation
              </button>
              <button
                className="flex-1 border py-3 rounded-xl"
                onClick={() => setSelectedReport(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- SMALL COMPONENT ---------- */
const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="bg-white border rounded-2xl p-6 shadow text-center">
    <p className="text-slate-500 text-sm">{label}</p>
    <p className="text-2xl font-black mt-2">{value}</p>
  </div>
);

export default DonorDashboard;
