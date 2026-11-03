import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  QrCode,
  FileSpreadsheet,
  History,
  ScanLine,
  X,
  Users,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isTeacher, isStudent, loginAsDemo, demoStudents, demoTeacher } = useAuth();
  const { resetDemoData, activeSession } = useAttendance();
  const location = useLocation();

  const teacherLinks = [
    {
      to: '/teacher/dashboard',
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      to: '/teacher/create-session',
      label: 'New Session',
      icon: PlusCircle
    },
    {
      to: '/teacher/live-session',
      label: 'Active QR Session',
      icon: QrCode,
      badge: activeSession ? 'Live' : null
    },
    {
      to: '/teacher/attendance-reports',
      label: 'Attendance Records',
      icon: FileSpreadsheet
    }
  ];

  const studentLinks = [
    {
      to: '/student/dashboard',
      label: 'My Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/student/scan',
      label: 'Scan QR Attendance',
      icon: ScanLine,
      highlight: true
    },
    {
      to: '/student/history',
      label: 'Attendance History',
      icon: History
    }
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base">SmartAttend</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 -mt-1 tracking-wider">
                  {isTeacher ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-subtle font-semibold'
                      : link.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : ''}`} />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: Quick Role Switcher (Ideal for hackathon presentation!) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-600" /> Demo Switcher
              </span>
              <button
                onClick={resetDemoData}
                title="Reset demo data to defaults"
                className="text-[10px] text-slate-400 hover:text-brand-600 flex items-center gap-0.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-2 leading-tight">
              Test roles instantaneously:
            </p>

            <div className="space-y-1.5">
              <button
                onClick={() => loginAsDemo('teacher')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isTeacher ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Dr. Sarah (Teacher)</span>
                {isTeacher && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
              </button>

              <div className="pt-1 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block px-1 mb-1">Students:</span>
                <div className="grid grid-cols-2 gap-1">
                  {demoStudents.slice(0, 4).map((s) => {
                    const isCurr = user?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => loginAsDemo('student', s.id)}
                        className={`text-left px-2 py-1 rounded text-[11px] font-medium truncate transition-colors ${
                          isCurr ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        title={`${s.full_name} (${s.roll_number})`}
                      >
                        {s.full_name.split(' ')[0]} ({s.roll_number})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
