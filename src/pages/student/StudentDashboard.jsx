import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { attendanceService } from '../../services/attendanceService';
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  BookOpen, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDate, formatTime, formatRelativeTime } from '../../utils/formatters';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, attendanceRecords } = useAttendance();

  const [studentHistory, setStudentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const records = await attendanceService.getStudentAttendance(user.id, user.roll_number);
        setStudentHistory(records);
      } catch (e) {
        console.error('Failed to fetch student attendance', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, attendanceRecords]);

  // Total eligible sessions count
  const totalClasses = Math.max(sessions.length, 5);
  const classesAttended = studentHistory.length;
  const classesMissed = Math.max(0, totalClasses - classesAttended);
  const overallPercentage = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Profile Card & Hero */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white font-extrabold text-2xl ring-4 ring-white/20">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Student Portal
                </span>
                <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-md">
                  Roll #{user?.roll_number || '101'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                {user?.class_name || 'B.Tech CS 3rd Year'} • {user?.section || 'Section A'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              icon={ScanLine}
              onClick={() => navigate('/student/scan')}
              className="w-full sm:w-auto bg-white text-brand-700 hover:bg-brand-50 shadow-lg font-bold"
            >
              Scan QR Code
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          subtitle="Eligibility target: 75%"
          icon={Percent}
          color={overallPercentage >= 75 ? 'emerald' : 'amber'}
          trend={overallPercentage >= 75 ? 'Eligible' : 'Low'}
          trendDirection={overallPercentage >= 75 ? 'up' : 'down'}
        />

        <StatCard
          title="Classes Attended"
          value={classesAttended}
          subtitle="Verified check-ins"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Classes Missed"
          value={classesMissed}
          subtitle="Unmarked sessions"
          icon={XCircle}
          color="rose"
        />

        <StatCard
          title="Total Conducted"
          value={totalClasses}
          subtitle="Curriculum sessions"
          icon={BookOpen}
          color="blue"
        />
      </div>

      {/* Recent Attendance Activity */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Attendance History</h3>
            <p className="text-xs text-slate-500">Your logged classroom check-ins</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/history')}
          >
            Full Log &rarr;
          </Button>
        </div>

        {studentHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No attendance records yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click the "Scan QR Code" button above to mark your first class.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {studentHistory.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {rec.subject || 'Class Lecture'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {rec.class_name} ({rec.section}) • {formatDate(rec.marked_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="success" size="sm" dot={true}>
                    Present
                  </Badge>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {formatTime(rec.marked_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
