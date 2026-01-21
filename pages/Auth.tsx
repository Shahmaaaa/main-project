
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthProps {
  onLogin: (user: User) => void;
  initialRole?: UserRole;
}

const Auth: React.FC<AuthProps> = ({ onLogin, initialRole = 'User' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<{ message: string; isWarning?: boolean } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole
  });

  useEffect(() => {
    if (initialRole === 'Admin') {
      setFormData(prev => ({ 
        ...prev, 
        role: 'Admin', 
        email: 'admin@blockaid.gov', 
        password: 'admin' 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        role: 'User', 
        email: 'shahma@example.com', 
        password: 'password' 
      }));
    }
  }, [initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let authenticatedUser: User;
      if (isLogin) {
        authenticatedUser = await db.auth.login(formData.email, formData.password);
      } else {
        const newUser: User = {
          id: `usr_${Math.random().toString(36).substr(2, 9)}`,
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        authenticatedUser = await db.users.create({ ...newUser, password: formData.password });
      }
      
      db.auth.setSession(authenticatedUser);
      onLogin(authenticatedUser);
    } catch (err: any) {
      console.error(err);
      setError({ message: err.message || 'Authentication failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-[#111827] rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-white/5 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/20 transform hover:rotate-12 transition">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Block-Aid</h1>
          <p className="text-slate-400 mt-2 font-medium">
            {isLogin ? 'Log in to your disaster relief dashboard.' : 'Register to join the verification network.'}
          </p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl text-sm font-bold border animate-shake flex items-center gap-3 ${
            error.isWarning ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="leading-tight">{error.message}</span>
          </div>
        )}

        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Demo Credentials</p>
           <p className="text-xs text-slate-500">
             {formData.role === 'Admin' ? 'admin@blockaid.gov / admin' : 'shahma@example.com / password'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white"
                placeholder="Ex: Shahma CT"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
            <input
              type="email"
              required
              className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white"
              placeholder="name@organization.gov"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Access Role</label>
              <div className="flex p-1 bg-[#0b0f1a] rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'User' })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                    formData.role === 'User' ? 'bg-[#1f2937] text-teal-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Admin' })}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                    formData.role === 'Admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Authority
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white shadow-2xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${
              formData.role === 'Admin' && !isLogin ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-600 to-teal-500 shadow-blue-500/20'
            }`}
          >
            {isLogin ? 'Enter Dashboard' : 'Finalize Account'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-slate-400 text-sm font-semibold hover:text-white transition"
          >
            {isLogin ? "New here? Create credentials" : "Already registered? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
