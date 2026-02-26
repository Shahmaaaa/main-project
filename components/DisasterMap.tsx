
import React from 'react';
import { DisasterReport } from '../types';

interface DisasterMapProps {
    reports: DisasterReport[];
}

export const DisasterMap: React.FC<DisasterMapProps> = ({ reports }) => {
    // Simple deterministic "coordinate" mapper for demo locations
    const getCoords = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const x = 10 + (Math.abs(hash % 80));
        const y = 10 + (Math.abs((hash >> 8) % 80));
        return { x: `${x}%`, y: `${y}%` };
    };

    return (
        <div className="relative w-full h-[400px] bg-slate-900 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-[200%] animate-scanline pointer-events-none" />

            {/* Map Content */}
            <div className="absolute inset-0 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-white font-black text-xl uppercase tracking-tighter italic">Tactical View</h3>
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Global Disaster Surveillance System</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Active Case</span>
                        </div>
                    </div>
                </div>

                {/* Abstract "Map" Nodes */}
                <div className="relative w-full h-[280px]">
                    {reports?.map((report) => {
                        const area = report.location?.area || 'Unknown';
                        const district = report.location?.district || 'Unknown';
                        const { x, y } = getCoords(area + district);
                        const isHigh = (report.severityFinal || report.severityAI) === 'High';

                        return (
                            <div
                                key={report.id}
                                className="absolute group cursor-pointer transition-all hover:scale-125"
                                style={{ left: x, top: y }}
                            >
                                {/* Pulse Ring */}
                                <div className={`absolute -inset-4 rounded-full opacity-20 animate-ping ${isHigh ? 'bg-rose-500' : 'bg-blue-500'}`} />

                                {/* Core Node */}
                                <div className={`relative w-4 h-4 rounded-full border-2 border-white/50 shadow-lg ${isHigh ? 'bg-rose-600' : report.status === 'Approved' ? 'bg-emerald-500' : 'bg-blue-600'
                                    }`} />

                                {/* Label Tooltip */}
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl">
                                    <p className="text-[10px] font-black uppercase text-blue-400">{report.type || 'Incident'}</p>
                                    <p className="text-xs font-bold leading-none">{area}</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className="text-[8px] text-slate-400 font-bold uppercase">{report.status || 'Pending'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Data Strip */}
            <div className="absolute bottom-0 inset-x-0 bg-white/5 backdrop-blur-md border-t border-white/10 px-6 py-2 flex items-center justify-between">
                <div className="flex gap-6">
                    <div>
                        <span className="text-[8px] text-slate-500 font-black uppercase">Sat-Connect</span>
                        <p className="text-[10px] text-emerald-400 font-mono font-bold leading-none">STABLE</p>
                    </div>
                    <div>
                        <span className="text-[8px] text-slate-500 font-black uppercase">Nodes Active</span>
                        <p className="text-[10px] text-white font-mono font-bold leading-none">{reports.length}</p>
                    </div>
                </div>
                <div className="text-[8px] text-slate-500 font-mono italic">
                    COORDS: LAT_42.12 // LON_102.34
                </div>
            </div>
        </div>
    );
};
