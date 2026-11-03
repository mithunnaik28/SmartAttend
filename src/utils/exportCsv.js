/**
 * Exports an array of attendance records to a downloadable CSV file.
 */
export function exportAttendanceToCsv(records, filename = 'attendance_report.csv') {
  if (!records || !records.length) {
    alert('No records available to export.');
    return;
  }

  const headers = [
    'Record ID',
    'Student Name',
    'Roll Number',
    'Class',
    'Section',
    'Subject',
    'Teacher',
    'Date & Time',
    'Status'
  ];

  const rows = records.map(record => [
    record.id || '',
    record.student_name || record.student?.full_name || '',
    record.roll_number || record.student?.roll_number || '',
    record.class_name || record.session?.class_name || '',
    record.section || record.session?.section || '',
    record.subject || record.session?.subject || '',
    record.teacher_name || record.session?.teacher_name || '',
    record.marked_at ? new Date(record.marked_at).toLocaleString() : '',
    (record.status || 'present').toUpperCase()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const str = String(cell).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
