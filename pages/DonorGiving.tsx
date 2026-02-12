import React, { useState } from "react";
import { DisasterReport, Donation } from "../types";

interface Props {
    reports: DisasterReport[];
    donations: Donation[];
}

const DonorGiving: React.FC<Props> = ({ reports, donations }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = donations.filter(d => {
        const report = reports.find(r => r.id === d.reportId);
        return report?.location.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report?.type.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalINR = donations.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER SECTION */}
            <div className="relative overflow-hidden bg-indigo-700 rounded-[40px] p-10 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            My Giving Ledger
                        </h1>
                        <p className="text-indigo-100 font-medium max-w-md">
                            Your personal history of global impact. Every transaction is signed and permanently recorded on the blockchain.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Total Contributed</p>
                            <p className="text-3xl font-black">₹{totalINR.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Visual Decoration */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* SEARCH */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search missions you've supported..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all shadow-inner text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* TABLE/LIST */}
            {filtered.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] py-32 text-center">
                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-sm">No transaction records found</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Target</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount (INR)</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Blockchain Hash</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((d, idx) => {
                                const report = reports.find(r => r.id === d.reportId);
                                return (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-900">{new Date(d.date).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(d.date).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3m0 0c0 1.657 1.343 3 3 3m0-6c1.657 0 3 1.343 3 3m-3-6V4m0 16v-4m8-4h-4m-8 0H4" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{report?.type || "General Relief"}</p>
                                                    <p className="text-xs text-slate-500">{report?.location.area}, {report?.location.district}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-lg font-black text-slate-900">₹{d.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                                                <p className="text-[10px] font-mono text-blue-600 truncate bg-blue-50 px-2 py-1 rounded-md" title={d.blockchainHash}>
                                                    {d.blockchainHash || "0xae3...8fd2"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-701 text-[10px] font-black uppercase rounded-full">
                                                Finalized
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DonorGiving;
