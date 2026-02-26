import React, { useState } from "react";
import { DisasterMap } from "../components/DisasterMap";
import { DisasterReport, Donation } from "../types";

interface DonorDashboardProps {
  reports: DisasterReport[];
  donations: Donation[];
  onDonate: (d: Donation) => void;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ reports, donations, onDonate }) => {
  const approvedReports = reports.filter(
    (r) => r.status === "Approved"
  );

  const [selectedReport, setSelectedReport] =
    useState<DisasterReport | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // ---------------- CONNECT WALLET ----------------
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error("User denied wallet connection");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // ---------------- METRICS ----------------
  const totalAffected = approvedReports.reduce(
    (sum, r) => sum + r.affectedPopulation,
    0
  );

  const totalFundsDistributed = reports
    .filter(r => r.fundStatus === 'Released')
    .length * 0.5; // Average estimation for demo

  // ---------------- DONATE ----------------
  // ---------------- DONATE (METAMASK) ----------------
  const handleDonate = async () => {
    if (!selectedReport || amount <= 0) {
      alert("Enter a valid donation amount");
      return;
    }

    setLoading(true);
    try {
      const { blockchainService } = await import("../services/blockchainService");

      // If amount is small (like 0.1), assume it's ETH. If large (like 5000), it's INR.
      // This is a helper for the demo.
      const ethAmount = amount < 5 ? amount.toString() : (amount / 250000).toFixed(6);

      if (parseFloat(ethAmount) <= 0) {
        throw new Error("Amount too small for conversion.");
      }

      alert(`Connecting to MetaMask to send ${ethAmount} ETH...`);
      const txHash = await blockchainService.donate(ethAmount);

      onDonate({
        id: Math.random().toString(),
        reportId: selectedReport.id,
        amount: amount < 5 ? amount * 250000 : amount, // Store as INR for history
        date: new Date().toLocaleString(),
        blockchainHash: txHash,
        donorId: 'anonymous' // For demo
      });

      alert(`Success! Transaction Hash: ${txHash}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Donation failed");
    } finally {
      setLoading(false);
      setSelectedReport(null);
      setAmount(0);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* 🌟 HERO SECTION: THE IMPACT HUB */}
      <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900 p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Philanthropy Level: Silver Savior</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic leading-[0.9]">
            Change The <br /> <span className="text-blue-300">World</span> Today.
          </h1>
          <p className="text-blue-100 text-lg font-medium leading-relaxed opacity-90">
            You are directly connected to {approvedReports.length} high-priority missions.
            Every contribution is locked on-chain and sent directly to the field.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                className="bg-white text-indigo-900 px-8 py-4 rounded-3xl font-black hover:scale-105 transition shadow-2xl shadow-white/20"
              >
                Secure Connect Wallet
              </button>
            ) : (
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-6 py-4 rounded-3xl flex items-center gap-3">
                <div className="bg-emerald-400 p-1.5 rounded-full">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-300">Connected & Optimized</p>
                  <p className="font-mono text-sm">{walletAddress.slice(0, 10)}...{walletAddress.slice(-4)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-[400px] h-[300px] flex items-center justify-center">
          {/* 📈 REAL-TIME IMPACT COUNTER */}
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-10 rounded-[60px] shadow-2xl space-y-8 w-full">
            <div className="text-center">
              <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-1">Your Life Impact</p>
              <p className="text-6xl font-black tabular-nums tracking-tighter">{totalAffected.toLocaleString()}</p>
              <p className="text-blue-300 text-[10px] font-bold mt-2 italic">Lives influenced through your node</p>
            </div>
            <div className="h-px bg-white/10 w-full" />
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-blue-200 text-[10px] font-black uppercase">Contribution</p>
                <p className="text-xl font-black">₹{donations.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center flex-1">
                <p className="text-blue-200 text-[10px] font-black uppercase">Chain Proofs</p>
                <p className="text-xl font-black">{donations.length}</p>
              </div>
            </div>
          </div>

          {/* Background Orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-[60px] animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-[60px] animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Live Rescue Network</h2>
            <p className="text-slate-500 text-sm font-medium">Sat-verified disaster zones requiring immediate philanthropy.</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Nodes Active: {reports.length}</span>
          </div>
        </div>
        <DisasterMap reports={reports} />
      </div>

      {/* IMPACT STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT: MISSION CARDS */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {approvedReports.map((report) => (
              <div
                key={report.id}
                className="group relative bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(30,58,138,0.15)] transition-all duration-700 hover:-translate-y-2"
              >
                {/* Image & Badges */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={report.images[0]}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt="Mission"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-xl ${report.severityFinal === 'High' ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                      }`}>
                      {report.severityFinal} Alert
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Mission</p>
                    <h3 className="text-2xl font-black text-white italic">{report.location.area}</h3>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Category</p>
                      <p className="text-lg font-black text-slate-900 mt-1">{report.type} Relief</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Target Pool</p>
                      <p className="text-lg font-black text-indigo-600 mt-1">2.0 ETH</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Funding Progress</span>
                      <span className="text-slate-900">45% Funded</span>
                    </div>
                    <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[45%] shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
                    </div>
                    <p className="text-[9px] text-slate-400 italic">Targeting aid for {report.affectedPopulation} affected citizens.</p>
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                  >
                    Process Contribution
                  </button>
                </div>

                {/* Proof Tags */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  {report.evidenceUrls?.news && (
                    <a href={report.evidenceUrls.news} target="_blank" className="bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg border border-white hover:bg-white transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: LIVE ACTIVITY FEED */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3m0 0c0 1.657 1.343 3 3 3m0-6c1.657 0 3 1.343 3 3m-3-6V4m0 16v-4m8-4h-4m-8 0H4" /></svg>
              </div>
              <h3 className="text-xl font-black tracking-tight leading-none">Live History</h3>
            </div>

            <div className="flex-1 space-y-6">
              {donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 lowercase italic">Your Support History will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {donations.map((d, i) => (
                    <div key={i} className="group p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-indigo-600 font-black text-sm">₹{d.amount.toLocaleString()}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{new Date(d.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[10px] text-slate-900 font-bold leading-tight">Supported {reports.find(r => r.id === d.reportId)?.location.area}</p>
                      {d.blockchainHash && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                          <span className="text-[8px] font-mono text-slate-400 truncate">{d.blockchainHash.slice(0, 20)}...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-600 mb-1">Philanthropy Status</p>
                <p className="text-xs text-indigo-900 font-bold italic">"Your actions are securing the future."</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 IMPACT JOURNEY: RECOVERY UPDATES */}
      {approvedReports.some(r => r.recoveryUpdates && r.recoveryUpdates.length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none">Impact Journey</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Live Recovery Updates from the Field</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReports.filter(r => r.recoveryUpdates && r.recoveryUpdates.length > 0).map(report => (
              <div key={report.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-500 transition-colors group">
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={report.recoveryUpdates?.[0].images[0]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    alt="Recovery"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase">
                    Recovery in Progress
                  </div>
                </div>
                <h4 className="font-black text-lg text-slate-900">{report.location.area} Update</h4>
                <p className="text-slate-500 text-sm mt-2 italic">"{report.recoveryUpdates?.[0].message}"</p>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>{report.recoveryUpdates?.[0].date}</span>
                  <span className="text-slate-900">{report.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONATE MODAL: THE PHILANTHROPY PORTAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="space-y-2">
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">Mission Contribution</p>
              <h2 className="text-4xl font-black italic">Support {selectedReport.location.area}</h2>
              <p className="text-slate-500 text-sm font-medium">Relief for {selectedReport.type} victims in the region.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {[5000, 10000, 25000].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`px-6 py-4 rounded-3xl text-sm font-black transition-all border-2 ${amount === val ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-100'}`}
                  >
                    ₹{val.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                  {amount > 0 && amount < 5 ? "Ξ" : "₹"}
                </span>
                <input
                  type="number"
                  placeholder="Custom Mission Amount"
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 hover:border-slate-200 outline-none rounded-[32px] px-12 py-6 font-black text-2xl transition-all"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              {/* IMPACT ESTIMATOR */}
              {amount > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Impact Projection</p>
                    <p className="text-sm font-bold text-emerald-900">
                      This donation will provide relief kits for approx. <span className="text-emerald-600">
                        {amount < 5 ? (amount * 500).toFixed(0) : (amount / 500).toFixed(0)} families
                      </span>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                className="flex-[2] bg-slate-900 hover:bg-black text-white py-6 rounded-[32px] font-black text-lg transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                onClick={handleDonate}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {loading ? "Syncing to Chain..." : "Authorize Donation"}
              </button>
              <button
                className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[32px] font-black hover:bg-slate-200 transition-all"
                onClick={() => setSelectedReport(null)}
              >
                Go Back
              </button>
            </div>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transacted via Ethereum Mainnet Layer</p>
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
  color = "text-slate-900"
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{label}</p>
    <p className={`text-3xl font-black mt-3 ${color}`}>{value}</p>
  </div>
);

export default DonorDashboard;
