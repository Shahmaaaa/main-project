
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleManageKey = async () => {
  const w = window as any;
  if (w.aistudio && w.aistudio.openSelectKey) {
    await w.aistudio.openSelectKey();
  }
};


  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Hello,</span>
          <span className="text-slate-900 font-bold">
  {user.name || 'User'}
</span>

        </div>
        
        {/* Connection Status Button */}
        <button 
          onClick={handleManageKey}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          title="Manage AI Connection"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">AI Online</span>
          <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-slate-100 rounded-full h-8 w-8 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200">
          {user?.name?.charAt(0) || 'U'}
      </div>

        <div
  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
    user.role === 'Admin'
      ? 'bg-indigo-100 text-indigo-700'
      : user.role === 'Donor'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700'
  }`}
>
  {user.role}
</div>

      </div>
    </header>
  );
};

export default Header;
