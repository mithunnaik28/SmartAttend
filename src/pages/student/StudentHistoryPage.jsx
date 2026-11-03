import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { 
  History, 
  ArrowLeft, 
  Search, 
  Download, 
  CheckCircle2, 
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDate, formatTime } from '../../utils/formatters';
import { exportAttendanceToCsv } from '../../utils/exportCsv';

export default function StudentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await attendanceService.getStudentAttendance(user.id, user.roll_number);
        setRecords(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter(r => 
      (r.subject && r.subject.toLowerCase().includes(q)) ||
      (r.class_name && r.class_name.toLowerCase().includes(q))
    );
  }, [records, search]);

  const handleExport = () => {
    exportAttendanceToCsv(filtered, `my_attendance_${user?.roll_number || 'student'}.csv`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Personal Log
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Attendance History
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            Export My CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/student/scan')}
          >
            Scan Next Class
          </Button>
        </div>
      </div>

      {/* Search & Records Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Logged: <span className="font-bold text-slate-900">{filtered.length}</span>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No matching attendance records found</p>
            </div>
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {record.subject || 'Class Lecture'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {record.class_name || user?.class_name} ({record.section || user?.section})
                      {record.teacher_name && ` • Prof: ${record.teacher_name}`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <Badge variant="success" size="sm" dot={true}>
                    Present
                  </Badge>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {formatDate(record.marked_at)} • {formatTime(record.marked_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
