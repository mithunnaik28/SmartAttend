import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AttendanceProvider } from './context/AttendanceContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateSessionPage from './pages/teacher/CreateSessionPage';
import LiveSessionPage from './pages/teacher/LiveSessionPage';
import AttendanceReportsPage from './pages/teacher/AttendanceReportsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import ScanQRPage from './pages/student/ScanQRPage';
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';

// Direct Scan Route Wrapper (Handles external phone camera scans: /scan?token=...)
function DirectScanRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'student') {
    return <Navigate to={homeForRole(user.role)} replace />;
  }
  return <ScanQRPage />;
}

function homeForRole(role) {
  if (role === 'admin') return '/admin/users';
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'student') return '/student/dashboard';
  return '/login';
}

function RequireRole({ roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text="Loading your workspace..." /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AttendanceProvider>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Authentication */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Direct QR Link route from physical phone camera */}
              <Route path="/scan" element={<DirectScanRedirect />} />

              <Route element={<RequireRole roles={['teacher']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/create-session" element={<CreateSessionPage />} />
                  <Route path="/teacher/live-session" element={<LiveSessionPage />} />
                  <Route path="/teacher/attendance-reports" element={<AttendanceReportsPage />} />
                </Route>
              </Route>

              <Route element={<RequireRole roles={['student']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/scan" element={<ScanQRPage />} />
                  <Route path="/student/history" element={<StudentHistoryPage />} />
                </Route>
              </Route>

              <Route element={<RequireRole roles={['admin']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
              </Route>

              {/* 404 Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AttendanceProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
