// SmartAttend Sample & Demonstration Data
// Specifically includes required fictional students:
// 1. Rahul – 101
// 2. Arjun – 102
// 3. Priya – 103
// 4. Sneha – 104
// 5. Kiran – 105

export const DEMO_TEACHER = {
  id: '11111111-1111-1111-1111-111111111111',
  full_name: 'Dr. Sarah Jenkins',
  email: 'teacher@smartattend.edu',
  department: 'Computer Science & Engineering',
  role: 'teacher',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
};

export const DEMO_STUDENTS = [
  {
    id: '22222222-2222-2222-2222-000000000101',
    full_name: 'Rahul Sharma',
    roll_number: '101',
    email: 'rahul@student.edu',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '22222222-2222-2222-2222-000000000102',
    full_name: 'Arjun Verma',
    roll_number: '102',
    email: 'arjun@student.edu',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '22222222-2222-2222-2222-000000000103',
    full_name: 'Priya Patel',
    roll_number: '103',
    email: 'priya@student.edu',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '22222222-2222-2222-2222-000000000104',
    full_name: 'Sneha Reddy',
    roll_number: '104',
    email: 'sneha@student.edu',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '22222222-2222-2222-2222-000000000105',
    full_name: 'Kiran Nair',
    roll_number: '105',
    email: 'kiran@student.edu',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// Helper to get future or past timestamps
const now = new Date();
const minutesFromNow = (mins) => new Date(now.getTime() + mins * 60000).toISOString();
const minutesAgo = (mins) => new Date(now.getTime() - mins * 60000).toISOString();
const daysAgo = (days, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

export const DEMO_SESSIONS = [
  {
    id: 'session-live-01',
    session_token: 'SMART-CS301-ACTIVE-QR',
    class_name: 'B.Tech CS 3rd Year',
    subject: 'Data Structures & Algorithms',
    section: 'Section A',
    teacher_id: DEMO_TEACHER.id,
    teacher_name: DEMO_TEACHER.full_name,
    created_at: minutesAgo(5),
    expires_at: minutesFromNow(25), // Active for 25 more minutes
    duration_minutes: 30,
    is_active: true,
    description: 'Lecture 14: Balanced Trees and Heaps'
  },
  {
    id: 'session-expired-02',
    session_token: 'SMART-DBMS-EXPIRED-TOKEN',
    class_name: 'B.Tech CS 3rd Year',
    subject: 'Database Management Systems',
    section: 'Section A',
    teacher_id: DEMO_TEACHER.id,
    teacher_name: DEMO_TEACHER.full_name,
    created_at: minutesAgo(90),
    expires_at: minutesAgo(45), // Expired 45 mins ago
    duration_minutes: 45,
    is_active: true,
    description: 'Lecture 12: SQL Query Optimization (EXPIRED DEMO)'
  },
  {
    id: 'session-closed-03',
    session_token: 'SMART-CNET-CLOSED-TOKEN',
    class_name: 'B.Tech CS 3rd Year',
    subject: 'Computer Networks',
    section: 'Section A',
    teacher_id: DEMO_TEACHER.id,
    teacher_name: DEMO_TEACHER.full_name,
    created_at: minutesAgo(120),
    expires_at: minutesFromNow(10),
    duration_minutes: 30,
    is_active: false, // Closed manually by teacher
    description: 'Lecture 09: TCP Flow & Congestion Control'
  },
  {
    id: 'session-prev-04',
    session_token: 'SMART-OS-PAST-TOKEN-01',
    class_name: 'B.Tech CS 3rd Year',
    subject: 'Operating Systems',
    section: 'Section A',
    teacher_id: DEMO_TEACHER.id,
    teacher_name: DEMO_TEACHER.full_name,
    created_at: daysAgo(1, 11),
    expires_at: daysAgo(1, 12),
    duration_minutes: 60,
    is_active: false,
    description: 'Lecture 18: Virtual Memory & Page Replacement'
  },
  {
    id: 'session-prev-05',
    session_token: 'SMART-WEB-PAST-TOKEN-02',
    class_name: 'B.Tech CS 3rd Year',
    subject: 'Web Technologies',
    section: 'Section A',
    teacher_id: DEMO_TEACHER.id,
    teacher_name: DEMO_TEACHER.full_name,
    created_at: daysAgo(2, 9),
    expires_at: daysAgo(2, 10),
    duration_minutes: 60,
    is_active: false,
    description: 'Lecture 07: RESTful APIs & Supabase Integration'
  }
];

export const DEMO_ATTENDANCE = [
  // Active session records (Rahul & Priya already scanned - useful for duplicate rejection demo!)
  {
    id: 'att-live-01',
    student_id: '22222222-2222-2222-2222-000000000101', // Rahul (101)
    session_id: 'session-live-01',
    student_name: 'Rahul Sharma',
    roll_number: '101',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Data Structures & Algorithms',
    marked_at: minutesAgo(4),
    status: 'present',
    device_info: 'Chrome on Android 14'
  },
  {
    id: 'att-live-02',
    student_id: '22222222-2222-2222-2222-000000000103', // Priya (103)
    session_id: 'session-live-01',
    student_name: 'Priya Patel',
    roll_number: '103',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Data Structures & Algorithms',
    marked_at: minutesAgo(2),
    status: 'present',
    device_info: 'Safari on iPhone 15'
  },

  // Past session attendance records for statistics
  {
    id: 'att-hist-01',
    student_id: '22222222-2222-2222-2222-000000000101',
    session_id: 'session-prev-04',
    student_name: 'Rahul Sharma',
    roll_number: '101',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Operating Systems',
    marked_at: daysAgo(1, 11),
    status: 'present',
    device_info: 'Chrome Mobile'
  },
  {
    id: 'att-hist-02',
    student_id: '22222222-2222-2222-2222-000000000102',
    session_id: 'session-prev-04',
    student_name: 'Arjun Verma',
    roll_number: '102',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Operating Systems',
    marked_at: daysAgo(1, 11),
    status: 'present',
    device_info: 'Chrome Mobile'
  },
  {
    id: 'att-hist-03',
    student_id: '22222222-2222-2222-2222-000000000103',
    session_id: 'session-prev-04',
    student_name: 'Priya Patel',
    roll_number: '103',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Operating Systems',
    marked_at: daysAgo(1, 11),
    status: 'present',
    device_info: 'Safari iOS'
  },
  {
    id: 'att-hist-04',
    student_id: '22222222-2222-2222-2222-000000000104',
    session_id: 'session-prev-04',
    student_name: 'Sneha Reddy',
    roll_number: '104',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Operating Systems',
    marked_at: daysAgo(1, 11),
    status: 'present',
    device_info: 'Firefox Mobile'
  },
  {
    id: 'att-hist-05',
    student_id: '22222222-2222-2222-2222-000000000101',
    session_id: 'session-prev-05',
    student_name: 'Rahul Sharma',
    roll_number: '101',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Web Technologies',
    marked_at: daysAgo(2, 9),
    status: 'present',
    device_info: 'Chrome Mobile'
  },
  {
    id: 'att-hist-06',
    student_id: '22222222-2222-2222-2222-000000000102',
    session_id: 'session-prev-05',
    student_name: 'Arjun Verma',
    roll_number: '102',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Web Technologies',
    marked_at: daysAgo(2, 9),
    status: 'present',
    device_info: 'Chrome Mobile'
  },
  {
    id: 'att-hist-07',
    student_id: '22222222-2222-2222-2222-000000000105',
    session_id: 'session-prev-05',
    student_name: 'Kiran Nair',
    roll_number: '105',
    class_name: 'B.Tech CS 3rd Year',
    section: 'Section A',
    subject: 'Web Technologies',
    marked_at: daysAgo(2, 9),
    status: 'present',
    device_info: 'Chrome Mobile'
  }
];

export const DEMO_ANALYTICS = {
  weeklyTrends: [
    { day: 'Mon', attendanceRate: 88, present: 44, absent: 6 },
    { day: 'Tue', attendanceRate: 92, present: 46, absent: 4 },
    { day: 'Wed', attendanceRate: 84, present: 42, absent: 8 },
    { day: 'Thu', attendanceRate: 96, present: 48, absent: 2 },
    { day: 'Fri', attendanceRate: 90, present: 45, absent: 5 },
    { day: 'Sat', attendanceRate: 78, present: 39, absent: 11 }
  ],
  subjectBreakdown: [
    { subject: 'Data Structures', attendance: 92, sessions: 18 },
    { subject: 'Database Systems', attendance: 86, sessions: 16 },
    { subject: 'Operating Systems', attendance: 89, sessions: 15 },
    { subject: 'Computer Networks', attendance: 82, sessions: 14 },
    { subject: 'Web Technologies', attendance: 95, sessions: 12 }
  ]
};
