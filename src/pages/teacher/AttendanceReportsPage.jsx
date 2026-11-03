import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import AttendanceTable from '../../components/teacher/AttendanceTable';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { exportAttendanceToCsv } from '../../utils/exportCsv';

export default function AttendanceReportsPage() {
  const { attendanceRecords, refresh, loading } = useAttendance();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Attendance Central
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Attendance Reports & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, analyze, and export student attendance across all classroom sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refresh}
            title="Refresh database records"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => exportAttendanceToCsv(attendanceRecords, `smartattend_master_export.csv`)}
          >
            Export All to CSV
          </Button>
        </div>
      </div>

      {/* Main Table Component */}
      <AttendanceTable records={attendanceRecords} isLoading={loading} />
    </div>
  );
}
