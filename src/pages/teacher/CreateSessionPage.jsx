import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  PlusCircle, 
  Clock, 
  Calendar, 
  BookOpen, 
  Layers, 
  User, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import Button from '../../components/common/Button';

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNewSession } = useAttendance();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    className: 'B.Tech CS 3rd Year',
    subject: 'Data Structures & Algorithms',
    section: 'Section A',
    sessionDate: new Date().toISOString().split('T')[0],
    durationMinutes: 15,
    teacherName: user?.full_name || 'Dr. Sarah Jenkins',
    description: 'Lecture Attendance Session with Auto-Expiry QR'
  });

  const subjectOptions = [
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Web Technologies',
    'Software Engineering',
    'Artificial Intelligence'
  ];

  const classOptions = [
    'B.Tech CS 3rd Year',
    'B.Tech CS 2nd Year',
    'B.Tech CS 4th Year',
    'MCA 1st Year',
    'M.Tech Computer Science'
  ];

  const durationOptions = [
    { label: '5 Minutes (Quick Pulse Check)', value: 5 },
    { label: '10 Minutes (Standard Quiz/Lecture)', value: 10 },
    { label: '15 Minutes (Recommended)', value: 15 },
    { label: '30 Minutes (Full Class)', value: 30 },
    { label: '45 Minutes (Extended Lab)', value: 45 },
    { label: '60 Minutes (Examination)', value: 60 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await createNewSession(formData);
    setLoading(false);

    if (result.success) {
      navigate('/teacher/live-session');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Attendance Generator
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Attendance Session
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate an auto-expiring QR code with cryptographic token security.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Class Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                Class / Degree
              </label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              >
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                Section
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </div>
          </div>

          {/* Subject Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject Name
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            >
              {subjectOptions.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Session Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Session Date
              </label>
              <input
                type="date"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            {/* Session Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                QR Expiry Duration
              </label>
              <select
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              >
                {durationOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Name (Read-only or editable) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" />
              Instructor / Teacher Name
            </label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Session Notes / Topic (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Chapter 4 - Tree Traversals and Binary Search Trees"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Security Guarantee Note */}
          <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-start gap-3 text-xs text-brand-900">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Upon clicking generate, a <strong>cryptographically secure token</strong> will be created. The session will automatically expire in <strong>{formData.durationMinutes} minutes</strong> and reject all duplicate attendance submissions.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/teacher/dashboard')}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={ArrowRight}
            >
              Generate QR Code & Start Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
