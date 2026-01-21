
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout }) => {
  // Citizen Links
  const userLinks = [
    { 
      to: '/', 
      label: 'Home Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a11 11 0 0011-11H5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21V9.184a3 3 0 01.74-1.995l1.01-1.185a.75.75 0 011.15.066l.06.09a3 3 0 01.39 2.423V21" />
        </svg>
      )
    },
    { 
      to: '/report', 
      label: 'Report Disaster', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      to: '/my-reports', 
      label: 'My Submissions', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
  ];

  // Admin/Authority Links
  const adminLinks = [
    { 
      to: '/', 
      label: 'Admin Control', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
  ];

  const links = role === 'User' ? userLinks : adminLinks;
  const themeClass = role === 'Admin' ? 'hover:bg-indigo-500/10 hover:text-indigo-400' : 'hover:bg-teal-500/10 hover:text-teal-400';
  const activeClass = role === 'Admin' ? 'bg-indigo-600 text-white shadow-indigo-900/40' : 'bg-teal-600 text-white shadow-teal-900/40';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`${role === 'Admin' ? 'bg-indigo-500' : 'bg-teal-500'} p-2.5 rounded-xl shadow-lg transform -rotate-3`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tight leading-none">Block-Aid</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              {role === 'Admin' ? 'Authority Portal' : 'Citizen Node'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? `${activeClass} shadow-lg scale-[1.02]`
                  : `text-slate-400 font-medium ${themeClass}`
              }`
            }
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              {link.icon}
            </div>
            <span className="text-sm tracking-tight">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Network Status</p>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs text-slate-300 font-medium">Mainnet Online</span>
           </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-slate-400 font-bold text-sm hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
