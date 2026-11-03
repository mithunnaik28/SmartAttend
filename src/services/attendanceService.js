import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  DEMO_TEACHER, 
  DEMO_STUDENTS, 
  DEMO_SESSIONS, 
  DEMO_ATTENDANCE 
} from './mockData';
import { generateSessionToken } from '../utils/tokenGenerator';
import { isBefore } from 'date-fns';

const STORAGE_KEYS = {
  SESSIONS: 'smartattend_sessions',
  ATTENDANCE: 'smartattend_attendance',
  STUDENTS: 'smartattend_students'
};

// Initialize localStorage with demo data if empty
function getLocalData(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error('Error reading localStorage', err);
    return defaultData;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error writing localStorage', err);
  }
}

// Ensure initial demo records are present
export function initDemoStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEMO_SESSIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEMO_ATTENDANCE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEMO_STUDENTS));
  }
}

export const attendanceService = {
  /**
   * Reset local demo data to initial state for testing
   */
  resetDemoData: () => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEMO_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEMO_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEMO_STUDENTS));
    window.location.reload();
  },

  /**
   * Fetch all sessions created by teacher
   */
  getTeacherSessions: async (teacherId) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    const sessions = getLocalData(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
    return sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Fetch a single session by session_token
   */
  getSessionByToken: async (token) => {
    const cleanToken = token.trim();
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_token', cleanToken)
        .single();
      if (error) return null;
      return data;
    }

    const sessions = getLocalData(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
    return sessions.find(s => s.session_token.toLowerCase() === cleanToken.toLowerCase()) || null;
  },

  /**
   * Fetch a single session by ID
   */
  getSessionById: async (sessionId) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error) return null;
      return data;
    }

    const sessions = getLocalData(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
    return sessions.find(s => s.id === sessionId) || null;
  },

  /**
   * Create a new attendance session
   */
  createSession: async ({
    className,
    subject,
    section,
    durationMinutes = 15,
    teacherId = DEMO_TEACHER.id,
    teacherName = DEMO_TEACHER.full_name,
    description = ''
  }) => {
    const token = generateSessionToken(subject.replace(/[^a-zA-Z]/g, '').slice(0, 4) || 'SESS');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60000).toISOString();

    const newSession = {
      id: isSupabaseConfigured() ? undefined : `sess-${Date.now()}`,
      session_token: token,
      class_name: className,
      subject,
      section,
      teacher_id: teacherId,
      teacher_name: teacherName,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      duration_minutes: durationMinutes,
      is_active: true,
      description
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .insert([newSession])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const sessions = getLocalData(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
    sessions.unshift(newSession);
    setLocalData(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  },

  /**
   * Close/deactivate a session
   */
  closeSession: async (sessionId) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const sessions = getLocalData(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
    const updated = sessions.map(s => s.id === sessionId ? { ...s, is_active: false } : s);
    setLocalData(STORAGE_KEYS.SESSIONS, updated);
    return updated.find(s => s.id === sessionId);
  },

  /**
   * Mark attendance via QR Code Token
   * Strict validation:
   * 1. Validate session token exists
   * 2. Check if session is deactivated
   * 3. Check if session QR is expired
   * 4. Check for duplicate attendance submission
   */
  markAttendance: async ({ sessionToken, student, deviceInfo = 'Web Scanner' }) => {
    if (!student || !student.id) {
      return {
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'You must be logged in as a registered student to mark attendance.'
      };
    }

    // If Supabase is configured with stored procedure
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.rpc('mark_qr_attendance', {
        p_session_token: sessionToken.trim(),
        p_student_id: student.id,
        p_device_info: deviceInfo
      });

      if (error) {
        return {
          success: false,
          code: 'DATABASE_ERROR',
          message: error.message || 'An error occurred while communicating with database.'
        };
      }
      return data;
    }

    // Local / Offline / Demo Mode Execution with real business rules
    const sessions = getLocalData(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
    const session = sessions.find(
      s => s.session_token.trim().toLowerCase() === sessionToken.trim().toLowerCase()
    );

    // Rule 1: Session existence
    if (!session) {
      return {
        success: false,
        code: 'INVALID_QR',
        message: 'Invalid QR code. No attendance session found for this token.'
      };
    }

    // Rule 2: Inactive / closed session
    if (!session.is_active) {
      return {
        success: false,
        code: 'SESSION_CLOSED',
        message: 'This attendance session has already been closed by the instructor.'
      };
    }

    // Rule 3: Expired QR code
    const isExpired = isBefore(new Date(session.expires_at), new Date());
    if (isExpired) {
      return {
        success: false,
        code: 'SESSION_EXPIRED',
        message: `This QR code expired at ${new Date(session.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Expired submissions are strictly rejected.`
      };
    }

    // Rule 4: Duplicate attendance prevention
    const attendanceRecords = getLocalData(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
    const existing = attendanceRecords.find(
      a => a.session_id === session.id && (a.student_id === student.id || a.roll_number === student.roll_number)
    );

    if (existing) {
      const markedTime = new Date(existing.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        success: false,
        code: 'DUPLICATE_ATTENDANCE',
        message: `Duplicate submission rejected! Your attendance for "${session.subject}" was already recorded at ${markedTime}.`
      };
    }

    // Save attendance record
    const newRecord = {
      id: `att-${Date.now()}`,
      student_id: student.id,
      session_id: session.id,
      student_name: student.full_name,
      roll_number: student.roll_number,
      class_name: session.class_name,
      section: session.section,
      subject: session.subject,
      marked_at: new Date().toISOString(),
      status: 'present',
      device_info: deviceInfo
    };

    attendanceRecords.unshift(newRecord);
    setLocalData(STORAGE_KEYS.ATTENDANCE, attendanceRecords);

    return {
      success: true,
      code: 'ATTENDANCE_RECORDED',
      message: `Attendance marked successfully for ${session.subject}!`,
      record: newRecord,
      session
    };
  },

  /**
   * Get attendance records for a specific session (Teacher view)
   */
  getSessionAttendance: async (sessionId) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          marked_at,
          status,
          device_info,
          student:students (
            id,
            full_name,
            roll_number,
            class_name,
            section
          )
        `)
        .eq('session_id', sessionId)
        .order('marked_at', { ascending: false });
      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        student_id: item.student?.id,
        student_name: item.student?.full_name,
        roll_number: item.student?.roll_number,
        class_name: item.student?.class_name,
        section: item.student?.section,
        marked_at: item.marked_at,
        status: item.status,
        device_info: item.device_info
      }));
    }

    const records = getLocalData(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
    return records.filter(r => r.session_id === sessionId);
  },

  /**
   * Get all attendance records (with filters for search, class, date, status)
   */
  getAllAttendance: async (filters = {}) => {
    let records = [];

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          marked_at,
          status,
          device_info,
          student:students (
            id,
            full_name,
            roll_number,
            class_name,
            section
          ),
          session:sessions (
            id,
            subject,
            class_name,
            section,
            teacher_name
          )
        `)
        .order('marked_at', { ascending: false });

      if (error) throw error;
      records = data.map(item => ({
        id: item.id,
        student_id: item.student?.id,
        student_name: item.student?.full_name,
        roll_number: item.student?.roll_number,
        class_name: item.student?.class_name || item.session?.class_name,
        section: item.student?.section || item.session?.section,
        subject: item.session?.subject,
        teacher_name: item.session?.teacher_name,
        marked_at: item.marked_at,
        status: item.status,
        device_info: item.device_info
      }));
    } else {
      records = getLocalData(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
    }

    // Apply filters
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(r => 
        (r.student_name && r.student_name.toLowerCase().includes(q)) ||
        (r.roll_number && r.roll_number.toLowerCase().includes(q)) ||
        (r.subject && r.subject.toLowerCase().includes(q))
      );
    }

    if (filters.className && filters.className !== 'ALL') {
      records = records.filter(r => r.class_name === filters.className);
    }

    if (filters.status && filters.status !== 'ALL') {
      records = records.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
    }

    return records;
  },

  /**
   * Get attendance history for a student
   */
  getStudentAttendance: async (studentId, rollNumber) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          marked_at,
          status,
          device_info,
          session:sessions (
            id,
            subject,
            class_name,
            section,
            teacher_name
          )
        `)
        .eq('student_id', studentId)
        .order('marked_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        marked_at: item.marked_at,
        status: item.status,
        device_info: item.device_info,
        subject: item.session?.subject,
        class_name: item.session?.class_name,
        section: item.session?.section,
        teacher_name: item.session?.teacher_name
      }));
    }

    const records = getLocalData(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
    return records.filter(
      r => r.student_id === studentId || (rollNumber && r.roll_number === rollNumber)
    );
  },

  /**
   * Get list of all registered students
   */
  getStudents: async () => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('roll_number', { ascending: true });
      if (error) throw error;
      return data;
    }

    return getLocalData(STORAGE_KEYS.STUDENTS, DEMO_STUDENTS);
  }
};
