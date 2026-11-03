import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  Lock,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loginAsDemo, isTeacher } = useAuth();

  const handleLaunch = (role, studentId = null) => {
    loginAsDemo(role, studentId);
    if (role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">SmartAttend</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-600 -mt-1">
              QR Attendance Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-700 text-xs font-semibold mb-6 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Next-Gen School & College Attendance Management
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Frictionless Attendance with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
            Dynamic QR Codes
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Empower instructors to create auto-expiring QR sessions in seconds. 
          Students scan via their smartphone cameras with instant cryptographic validation and duplicate rejection.
        </p>

        {/* Quick Launch Buttons for Hackathon Jury */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => handleLaunch('teacher')}
            className="w-full sm:w-auto shadow-lg shadow-brand-500/25"
          >
            Launch as Faculty (Teacher)
          </Button>

          <Button
            variant="outline"
            size="lg"
            icon={Smartphone}
            onClick={() => handleLaunch('student')}
            className="w-full sm:w-auto bg-white"
          >
            Launch as Student
          </Button>
        </div>

        {/* Live Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Anti-Duplicate Enforcement
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Auto-Expiring QR Countdown
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-brand-500" /> Supabase RLS Protected
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-500" /> CSV Reports & Analytics
          </span>
        </div>
      </section>

      {/* Interactive Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Modern Educational Institutions
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Everything teachers and students need for tamper-proof classroom attendance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Cryptographic QR Generator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates secure, randomized tokens tied to classroom sections and teacher IDs with configurable countdown durations.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">In-Browser Camera Scanner</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by html5-qrcode. Works seamlessly across iOS, Android, and laptop webcams without installing native apps.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Strict Server-Side Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Guarantees zero duplicate entries via PostgreSQL unique constraints and rejects expired or terminated attendance sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SmartAttend</span>
            <span>• Hackathon Prototype</span>
          </div>
          <div>
            Built with React.js, Tailwind CSS, Vite & Supabase PostgreSQL
          </div>
        </div>
      </footer>
    </div>
  );
}
