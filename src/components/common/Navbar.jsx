import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, QrCode, Shield, User, Menu, Sparkles, Database } from 'lucide-react';
import Badge from './Badge';

export default function Navbar({ onMenuToggle }) {
  const { user, logout, isTeacher, isSupabaseReady } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                SmartAttend
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-200/60">
                  v1.0
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Status and Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mode Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
            <Database className="w-3.5 h-3.5 text-brand-600" />
            <span>{isSupabaseReady ? 'Supabase Connected' : 'Demo State Mode'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* User profile dropdown info */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-slate-900 leading-tight">
                  {user.full_name}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <Badge
                    size="sm"
                    variant={isTeacher ? 'brand' : 'purple'}
                    className="capitalize"
                  >
                    {user.role} {user.roll_number ? `(${user.roll_number})` : ''}
                  </Badge>
                </div>
              </div>

              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200/80"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
              )}

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
