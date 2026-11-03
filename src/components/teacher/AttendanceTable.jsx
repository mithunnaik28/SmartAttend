import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  Clock, 
  User, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDateTime, formatDate, formatTime } from '../../utils/formatters';
import { exportAttendanceToCsv } from '../../utils/exportCsv';

export default function AttendanceTable({ records = [], isLoading = false }) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('marked_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Extract distinct classes for dropdown filter
  const uniqueClasses = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.class_name) set.add(r.class_name);
    });
    return Array.from(set);
  }, [records]);

  // Filter & sort logic
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSearch =
          !search ||
          rec.student_name?.toLowerCase().includes(search.toLowerCase()) ||
          rec.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
          rec.subject?.toLowerCase().includes(search.toLowerCase());

        const matchesClass = classFilter === 'ALL' || rec.class_name === classFilter;
        const matchesStatus = statusFilter === 'ALL' || rec.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';

        if (sortField === 'marked_at') {
          return sortOrder === 'desc'
            ? new Date(valB) - new Date(valA)
            : new Date(valA) - new Date(valB);
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [records, search, classFilter, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    exportAttendanceToCsv(filteredRecords, `smartattend_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
      {/* Header & Controls Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Attendance Records</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredRecords.length} total attendance submissions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, roll #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Classes</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
            className="whitespace-nowrap"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
              <th 
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => toggleSort('student_name')}
              >
                <div className="flex items-center gap-1.5">
                  Student Name <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => toggleSort('roll_number')}
              >
                <div className="flex items-center gap-1.5">
                  Roll No <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Class & Section</th>
              <th className="py-3.5 px-4">Subject</th>
              <th 
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => toggleSort('marked_at')}
              >
                <div className="flex items-center gap-1.5">
                  Marked At <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                        {record.student_name ? record.student_name.charAt(0) : 'S'}
                      </div>
                      <span>{record.student_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                    #{record.roll_number}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {record.class_name} {record.section ? `(${record.section})` : ''}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {record.subject}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{formatDate(record.marked_at)}</span>
                      <span className="text-[10px] text-slate-400">{formatTime(record.marked_at)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        record.status === 'present'
                          ? 'success'
                          : record.status === 'late'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                      dot={true}
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
