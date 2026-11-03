import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Users, 
  BookOpen, 
  CalendarCheck, 
  UserCheck, 
  UserX, 
  Percent, 
  PlusCircle, 
  QrCode, 
  ArrowRight, 
  Clock, 
  Radio
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import AttendanceChart from '../../components/teacher/AttendanceChart';
import { formatTime, formatDate, formatRelativeTime } from '../../utils/formatters';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, attendanceRecords, activeSession } = useAttendance();
  const toast = useToast();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    attendanceService.getStudents()
      .then(setStudents)
      .catch(error => toast.error('Student roster could not be loaded', error.message));
  }, [toast]);

  const totalStudents = students.length;
  const totalClasses = sessions.length;

  // Filter today's attendance records
  const todayRecords = useMemo(() => {
    const today = new Date().toDateString();
    return attendanceRecords.filter(r => new Date(r.marked_at).toDateString() === today);
  }, [attendanceRecords]);

  // Unique present students today
  const presentStudentsCount = useMemo(() => {
    const set = new Set();
    todayRecords.forEach(r => {
      if (r.roll_number) set.add(r.roll_number);
      else if (r.student_id) set.add(r.student_id);
    });
    return set.size;
  }, [todayRecords]);

  const absentStudentsCount = Math.max(0, totalStudents - presentStudentsCount);
  const attendanceRate = totalStudents > 0 ? Math.round((presentStudentsCount / totalStudents) * 100) : 0;

  const analytics = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date;
    });

    const weeklyData = dates.map(date => {
      const daySessions = sessions.filter(session =>
        new Date(session.created_at).toDateString() === date.toDateString()
      );
      const expected = daySessions.reduce((total, session) => total + students.filter(student =>
        student.class_name === session.class_name && student.section === session.section
      ).length, 0);
      const sessionIds = new Set(daySessions.map(session => session.id));
      const present = attendanceRecords.filter(record => sessionIds.has(record.session_id)).length;
      return {
        day: date.toLocaleDateString(undefined, { weekday: 'short' }),
        attendanceRate: expected ? Math.round((present / expected) * 100) : 0,
        hasSessions: expected > 0
      };
    }).filter(day => day.hasSessions);

    const subjects = new Map();
    sessions.forEach(session => {
      const expected = students.filter(student =>
        student.class_name === session.class_name && student.section === session.section
      ).length;
      if (!expected) return;
      const current = subjects.get(session.subject) || { subject: session.subject, present: 0, expected: 0 };
      current.expected += expected;
      current.present += attendanceRecords.filter(record => record.session_id === session.id).length;
      subjects.set(session.subject, current);
    });
    const subjectData = Array.from(subjects.values()).map(subject => ({
      subject: subject.subject,
      attendance: Math.round((subject.present / subject.expected) * 100)
    }));
    return { weeklyData, subjectData };
  }, [sessions, students, attendanceRecords]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Instructor Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Teacher'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department of {user?.department || 'Computer Science & Engineering'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSession && (
            <Button
              variant="outline"
              size="md"
              icon={Radio}
              onClick={() => navigate('/teacher/live-session')}
              className="text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
            >
              View Active QR
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/teacher/create-session')}
          >
            Create Session
          </Button>
        </div>
      </div>

      {/* Active Session Alert Banner (if a session is live) */}
      {activeSession && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Live QR Active
                </span>
                <span className="text-xs text-white/80 font-mono">
                  Token: {activeSession.session_token}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeSession.subject} — {activeSession.class_name} ({activeSession.section})
              </h3>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/teacher/live-session')}
            className="bg-white text-brand-700 hover:bg-brand-50 shrink-0 font-bold"
          >
            Open Live QR Screen &rarr;
          </Button>
        </div>
      )}

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Students in your classes"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Total Classes"
          value={totalClasses}
          subtitle="Sessions you created"
          icon={BookOpen}
          color="indigo"
        />

        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          subtitle="Average turnout"
          icon={Percent}
          color="emerald"
        />

        <StatCard
          title="Present Today"
          value={presentStudentsCount}
          subtitle="Checked in via QR"
          icon={UserCheck}
          color="emerald"
        />

        <StatCard
          title="Absent Today"
          value={absentStudentsCount}
          subtitle="Yet to record"
          icon={UserX}
          color="rose"
        />

        <StatCard
          title="Active Status"
          value={activeSession ? 'Live' : 'Idle'}
          subtitle={activeSession ? 'QR Accepting' : 'No Active Session'}
          icon={CalendarCheck}
          color={activeSession ? 'emerald' : 'blue'}
        />
      </div>

      {/* Attendance Analytics Charts */}
      <div>
        <AttendanceChart weeklyData={analytics.weeklyData} subjectData={analytics.subjectData} />
      </div>

      {/* Bottom Grid: Recent Activity & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Activity */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Attendance Activity</h3>
              <p className="text-xs text-slate-500">Latest student QR check-ins</p>
            </div>
            <button
              onClick={() => navigate('/teacher/attendance-reports')}
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {attendanceRecords.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  {rec.avatar ? (
                    <img src={rec.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                      {rec.student_name ? rec.student_name.charAt(0) : 'S'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{rec.student_name}</div>
                    <div className="text-[11px] text-slate-500">
                      Roll #{rec.roll_number} • {rec.subject}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="success" size="sm" dot={true}>
                    Present
                  </Badge>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {formatRelativeTime(rec.marked_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Class Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Class Sessions</h3>
              <p className="text-xs text-slate-500">Created attendance sessions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate('/teacher/create-session')}
            >
              New
            </Button>
          </div>

          <div className="space-y-3">
            {sessions.slice(0, 5).map((sess) => {
              const isExpired = new Date(sess.expires_at) < new Date();
              const isLive = sess.is_active && !isExpired;

              return (
                <div
                  key={sess.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{sess.subject}</div>
                    <div className="text-[11px] text-slate-500">
                      {sess.class_name} ({sess.section}) • {formatDate(sess.created_at)}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    {isLive ? (
                      <Badge variant="success" size="sm" dot={true}>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        Concluded
                      </Badge>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1">
                      {sess.duration_minutes} mins
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
