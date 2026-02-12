import React, { useState } from "react";
import { DisasterReport, Donation } from "../types";

interface Props {
    reports: DisasterReport[];
    donations: Donation[];
}

const DonorImpactJourney: React.FC<Props> = ({ reports, donations }) => {
    // Get unique report IDs the donor has supported
    const supportedReportIds = Array.from(new Set(donations.map(d => d.reportId)));

    // Get those specific reports
    const supportedReports = reports.filter(r => supportedReportIds.includes(r.id));

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-emerald-600 to-teal-800 p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mission Feedback Loop</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter italic leading-[0.9]">
                        The Impact <br /> <span className="text-emerald-300">Journey.</span>
                    </h1>
                    <p className="text-emerald-100 text-lg font-medium leading-relaxed opacity-90">
                        See how your contributions are transforming lives in real-time. Follow the recovery of the communities you've supported.
                    </p>
                </div>

                <div className="relative w-full md:w-[350px] flex items-center justify-center">
                    <div className="w-64 h-64 bg-white/10 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
                        <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                            <svg className="w-20 h-20 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                    {/* Orbs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {supportedReports.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px]">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm italic">Start a contribution to see the journey</p>
                    </div>
                ) : (
                    supportedReports.map(report => (
                        <div key={report.id} className="group bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                            <div className="p-8 space-y-6">
                                {/* Mission Header */}
                                <div className="flex items-center justify-between">
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                        {report.type} Recovery
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{report.location.area}</span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900 leading-none">Status: Recovery In Progress</h3>
                                    <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[60%] animate-pulse" />
                                    </div>
                                </div>

                                {/* Updates Feed */}
                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    {(!report.recoveryUpdates || report.recoveryUpdates.length === 0) ? (
                                        <div className="p-6 bg-slate-50 rounded-3xl text-center space-y-3">
                                            <p className="text-xs text-slate-400 font-bold italic">Field agents are preparing the first update...</p>
                                            <div className="w-12 h-1 border-t border-slate-200 mx-auto" />
                                        </div>
                                    ) : (
                                        report.recoveryUpdates.map((update, uIdx) => (
                                            <div key={uIdx} className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-600 w-1.5 h-8 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{update.date}</p>
                                                        <p className="text-sm font-bold text-slate-900">{update.message}</p>
                                                    </div>
                                                </div>
                                                {update.images?.[0] && (
                                                    <div className="relative h-40 rounded-3xl overflow-hidden shadow-lg">
                                                        <img src={update.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Update" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-8 pt-6">
                                    <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Your Contribution Impact</p>
                                        </div>
                                        <p className="text-xs font-medium leading-relaxed opacity-80 italic">Your support has helped this community move {report.recoveryUpdates?.length || 0} stages closer to full stability.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DonorImpactJourney;
