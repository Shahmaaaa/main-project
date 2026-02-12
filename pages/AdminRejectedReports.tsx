import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DisasterReport } from "../types";

interface Props {
  reports: DisasterReport[];
}

const AdminRejectedReports: React.FC<Props> = ({ reports }) => {
  const rejected = reports.filter(r => r.status === "Rejected");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = rejected.filter(r =>
    r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Archive & Rejected
            </h1>
            <p className="text-slate-400 font-medium max-w-md">
              Filtered reports that did not meet our intelligence criteria or contained inconsistent evidence.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filtered Out</p>
              <p className="text-3xl font-black text-rose-500">{rejected.length}</p>
            </div>
          </div>
        </div>

        {/* Visual Decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by location or disaster type..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-rose-500 outline-none transition-all shadow-inner text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* GRIDS */}
      {filtered.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] py-32 text-center">
          <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3l-6.928-12c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold italic uppercase tracking-widest text-sm">No Rejected Records Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(report => (
            <div
              key={report.id}
              className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 grayscale opacity-80 hover:grayscale-0 hover:opacity-100"
            >
              <div className="relative h-48">
                <img
                  src={report.images[0]}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                  Verification Failed
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <Link
                    to={`/review/${report.id}`}
                    className="w-full bg-white text-rose-600 py-3 rounded-2xl font-black text-xs text-center shadow-2xl"
                  >
                    View Rejection Reason
                  </Link>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">{report.type}</h3>
                  <p className="text-slate-500 text-sm mt-2 flex items-center gap-1 font-medium italic">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {report.location.area}, {report.location.district}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex flex-col space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rejection Status</p>
                  <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold w-fit">
                    Evidence Inconsistent
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-2 italic">
                    Archived: {new Date(report.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRejectedReports;
