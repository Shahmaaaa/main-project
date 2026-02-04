
import React, { useEffect, useState } from 'react';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    timestamp: Date;
}

export const NotificationToast: React.FC<{ notification: Notification; onClose: (id: string) => void }> = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(notification.id), 5000);
        return () => clearTimeout(timer);
    }, [notification, onClose]);

    return (
        <div className="animate-in slide-in-from-right-10 fade-in duration-300 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 flex items-start gap-4 max-w-md w-full backdrop-blur-xl">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-black text-sm uppercase tracking-widest text-blue-400">Emergency Alert</p>
                <p className="text-slate-200 mt-1 font-bold leading-tight">{notification.message}</p>
                <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase">Just Now • Blockchain Verified</p>
            </div>
            <button
                onClick={() => onClose(notification.id)}
                className="text-slate-500 hover:text-white transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const NotificationContainer: React.FC<{ notifications: Notification[]; removeNotification: (id: string) => void }> = ({ notifications, removeNotification }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[9999] space-y-4 flex flex-col items-end pointer-events-none">
            {notifications.map(n => (
                <div key={n.id} className="pointer-events-auto">
                    <NotificationToast notification={n} onClose={removeNotification} />
                </div>
            ))}
        </div>
    );
};
