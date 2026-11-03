import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AttendanceProvider } from './context/AttendanceContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateSessionPage from './pages/teacher/CreateSessionPage';
import LiveSessionPage from './pages/teacher/LiveSessionPage';
import AttendanceReportsPage from './pages/teacher/AttendanceReportsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import ScanQRPage from './pages/student/ScanQRPage';
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Direct Scan Route Wrapper (Handles external phone camera scans: /scan?token=...)
function DirectScanRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <ScanQRPage />;
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
              </Route>

              {/* Direct QR Link route from physical phone camera */}
              <Route path="/scan" element={<DirectScanRedirect />} />

              {/* Protected App Routes (Wrapped in Sidebar & Navbar) */}
              <Route element={<AppLayout />}>
                {/* Teacher Routes */}
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/create-session" element={<CreateSessionPage />} />
                <Route path="/teacher/live-session" element={<LiveSessionPage />} />
                <Route path="/teacher/attendance-reports" element={<AttendanceReportsPage />} />

                {/* Student Routes */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/scan" element={<ScanQRPage />} />
                <Route path="/student/history" element={<StudentHistoryPage />} />
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
