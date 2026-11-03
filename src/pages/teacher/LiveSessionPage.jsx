import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import QRCodeDisplay from '../../components/teacher/QRCodeDisplay';
import LiveAttendanceFeed from '../../components/teacher/LiveAttendanceFeed';
import EmptyState from '../../components/common/EmptyState';
import { QrCode, PlusCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';

export default function LiveSessionPage() {
  const navigate = useNavigate();
  const { activeSession, closeSession, sessions } = useAttendance();
  const { demoStudents } = useAuth();

  const [sessionAttendees, setSessionAttendees] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(activeSession || sessions[0] || null);

  // Sync selected session if activeSession changes
  useEffect(() => {
    if (activeSession) {
      setSelectedSession(activeSession);
    } else if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0]);
    }
  }, [activeSession, sessions]);

  // Load attendees for selected session
  const fetchAttendees = async () => {
    if (!selectedSession) return;
    try {
      const records = await attendanceService.getSessionAttendance(selectedSession.id);
      setSessionAttendees(records);
    } catch (e) {
      console.error('Error fetching live session attendance', e);
    }
  };

  useEffect(() => {
    fetchAttendees();
    // Poll every 3 seconds to update attendee list in real-time
    const interval = setInterval(fetchAttendees, 3000);
    return () => clearInterval(interval);
  }, [selectedSession]);

  const handleCloseSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to close this session? Students will no longer be able to mark attendance.')) {
      return;
    }
    setIsClosing(true);
    await closeSession(sessionId);
    setIsClosing(false);
    fetchAttendees();
  };

  if (!selectedSession) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in">
        <EmptyState
          icon={QrCode}
          title="No Active QR Session"
          description="You don't have an active attendance session right now. Create a new session to generate an auto-expiring QR code."
          actionLabel="Create New Session"
          onAction={() => navigate('/teacher/create-session')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Active Attendance Stream
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Classroom QR Display
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Session Switcher Dropdown (to inspect other created sessions) */}
          <select
            value={selectedSession.id}
            onChange={(e) => {
              const found = sessions.find(s => s.id === e.target.value);
              if (found) setSelectedSession(found);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject} ({s.is_active ? 'Active' : 'Ended'})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchAttendees}
            title="Refresh Attendee Feed"
          />

          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/teacher/create-session')}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Main Grid: QR Code on Left, Live Attendee Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: QR Display Card */}
        <div className="lg:col-span-7">
          <QRCodeDisplay
            session={selectedSession}
            onCloseSession={handleCloseSession}
            isClosing={isClosing}
          />
        </div>

        {/* Right: Live Attendee Stream */}
        <div className="lg:col-span-5">
          <LiveAttendanceFeed
            records={sessionAttendees}
            totalStudents={demoStudents.length || 5}
          />
        </div>
      </div>
    </div>
  );
}
