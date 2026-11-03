import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  GraduationCap, 
  School, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    loginAsDemo,
    requestPasswordReset,
    demoStudents,
    demoTeacher,
    isSupabaseReady,
    isDemoMode
  } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState('teacher'); // 'teacher' or 'student'
  const [email, setEmail] = useState(isDemoMode ? 'teacher@smartattend.edu' : '');
  const [password, setPassword] = useState(isDemoMode ? 'password123' : '');
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (isDemoMode && newRole === 'teacher') {
      setEmail(demoTeacher.email);
      setPassword('password123');
    } else if (isDemoMode) {
      setEmail(demoStudents[0].email);
      setPassword('student123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome!', `Logged in as ${result.user?.full_name || 'User'}`);
      const routes = {
        admin: '/admin/users',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard'
      };
      navigate(routes[result.user?.role] || '/login');
    } else {
      toast.error('Authentication Error', result.error || 'Invalid credentials');
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast.warning('Email required', 'Enter your account email first.');
      return;
    }
    setResettingPassword(true);
    try {
      await requestPasswordReset(email);
      toast.success('Reset email sent', 'Check your inbox for the password reset link.');
    } catch (error) {
      toast.error('Could not send reset email', error.message);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleQuickDemoSelect = (type, studentId = null) => {
    try {
      const user = loginAsDemo(type, studentId);
      toast.success('Demo Profile Loaded', `Switched to ${user.full_name}`);
      navigate(type === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error('Demo login unavailable', error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Toggle Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => handleRoleChange('teacher')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            role === 'teacher'
              ? 'bg-white text-brand-700 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <School className="w-4 h-4 text-brand-600" />
          Staff / Teacher
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('student')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            role === 'student'
              ? 'bg-white text-purple-700 shadow-subtle'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          Student Portal
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {role === 'teacher' ? 'Staff / Administrator Email' : 'Student Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'teacher' ? 'teacher@school.edu' : 'student@school.edu'}
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            {isDemoMode && <span className="text-[11px] text-slate-400">Demo password shown below</span>}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          icon={ArrowRight}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      {isSupabaseReady && (
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={resettingPassword}
          className="w-full text-xs font-semibold text-brand-700 hover:text-brand-900 disabled:opacity-50"
        >
          {resettingPassword ? 'Sending reset email…' : 'Forgot your password?'}
        </button>
      )}

      {/* 1-Click Demo Profiles for Evaluators */}
      {isDemoMode && <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" /> 1-Click Evaluation Logins
          </span>
          <Badge size="sm" variant={isSupabaseReady ? 'brand' : 'default'}>
            Demo Engine
          </Badge>
        </div>

        {role === 'teacher' ? (
          <button
            type="button"
            onClick={() => handleQuickDemoSelect('teacher')}
            className="w-full p-2.5 rounded-xl border border-brand-200 bg-brand-50/50 hover:bg-brand-50 flex items-center justify-between text-left text-xs transition-colors"
          >
            <div>
              <div className="font-bold text-brand-900">{demoTeacher.full_name}</div>
              <div className="text-[11px] text-brand-600">{demoTeacher.department}</div>
            </div>
            <span className="text-xs font-semibold text-brand-700 bg-white px-2 py-1 rounded-lg border border-brand-200 shadow-subtle">
              Instant Login &rarr;
            </span>
          </button>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-500 mb-1">Select from required sample students:</p>
            <div className="grid grid-cols-1 gap-1.5">
              {demoStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickDemoSelect('student', s.id)}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 flex items-center justify-between text-left text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      #{s.roll_number}
                    </span>
                    <span className="font-semibold text-slate-900">{s.full_name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-purple-600 hover:underline">
                    Login &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      }

      {!isSupabaseReady && !isDemoMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          Database connection is required. Ask your administrator to configure Supabase before signing in.
        </div>
      )}
    </div>
  );
}
