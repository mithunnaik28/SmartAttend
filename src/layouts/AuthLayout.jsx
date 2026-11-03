import React from 'react';
import { Outlet } from 'react-router-dom';
import { QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-lg shadow-brand-500/25 mb-3">
          <QrCode className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          SmartAttend
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          QR-Based School & College Attendance Management System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card sm:rounded-3xl border border-slate-200/80">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
