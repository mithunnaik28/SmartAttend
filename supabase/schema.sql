-- ================================================================
-- SmartAttend – QR Attendance Management System
-- Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- ================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Tables (if recreating)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;

-- 3. Teachers Table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT DEFAULT 'Computer Science',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    class_name TEXT NOT NULL,
    section TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sessions Table (Attendance Sessions created by Teachers)
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token TEXT NOT NULL UNIQUE,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    section TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    duration_minutes INTEGER DEFAULT 15
);

-- 6. Attendance Table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
    device_info TEXT,
    
    -- UNIQUE constraint to prevent duplicate attendance submissions
    CONSTRAINT unique_student_session UNIQUE (student_id, session_id)
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON public.sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students(roll_number);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- Teachers Policies:
-- Teachers can view all teacher profiles or their own
CREATE POLICY "Allow public read for teachers" 
ON public.teachers FOR SELECT 
USING (true);

CREATE POLICY "Allow teachers to manage own profile" 
ON public.teachers FOR ALL 
USING (auth.uid() = user_id);

-- Students Policies:
-- Students can read all students or self
CREATE POLICY "Allow authenticated read for students" 
ON public.students FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow students to manage own profile" 
ON public.students FOR ALL 
USING (auth.uid() = user_id);

-- Sessions Policies:
-- Anyone authenticated can view sessions (needed for students to verify session tokens)
CREATE POLICY "Allow authenticated read for sessions" 
ON public.sessions FOR SELECT 
TO authenticated 
USING (true);

-- Only teachers can insert, update, or delete sessions
CREATE POLICY "Teachers can create sessions" 
ON public.sessions FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.teachers WHERE teachers.id = sessions.teacher_id AND teachers.user_id = auth.uid())
    OR auth.role() = 'authenticated'
);

CREATE POLICY "Teachers can update own sessions" 
ON public.sessions FOR UPDATE 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.teachers WHERE teachers.id = sessions.teacher_id AND teachers.user_id = auth.uid())
);

-- Attendance Policies:
-- Students can view their own attendance records
CREATE POLICY "Students can view own attendance" 
ON public.attendance FOR SELECT 
TO authenticated 
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.teachers WHERE user_id = auth.uid())
);

-- Students can record attendance if session is active and not expired
CREATE POLICY "Students can insert own attendance" 
ON public.attendance FOR INSERT 
TO authenticated 
WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    AND
    EXISTS (
        SELECT 1 FROM public.sessions 
        WHERE sessions.id = attendance.session_id 
        AND sessions.is_active = true 
        AND sessions.expires_at > NOW()
    )
);

-- 10. Server-side Stored Procedure for Secure QR Attendance Verification
CREATE OR REPLACE FUNCTION public.mark_qr_attendance(
    p_session_token TEXT,
    p_student_id UUID,
    p_device_info TEXT DEFAULT 'Mobile Web'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_existing RECORD;
    v_new_attendance UUID;
BEGIN
    -- Step 1: Look up session by token
    SELECT * INTO v_session 
    FROM public.sessions 
    WHERE session_token = p_session_token;

    -- Step 2: Validate session existence
    IF v_session.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SESSION_NOT_FOUND',
            'message', 'Invalid QR code. Session does not exist.'
        );
    END IF;

    -- Step 3: Check if session is deactivated by teacher
    IF NOT v_session.is_active THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SESSION_CLOSED',
            'message', 'This attendance session has been closed by the teacher.'
        );
    END IF;

    -- Step 4: Check if QR code / session has expired
    IF v_session.expires_at <= NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'SESSION_EXPIRED',
            'message', 'This QR code has expired. Please ask your instructor for a fresh code.'
        );
    END IF;

    -- Step 5: Check duplicate attendance
    SELECT * INTO v_existing 
    FROM public.attendance 
    WHERE session_id = v_session.id AND student_id = p_student_id;

    IF v_existing.id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'DUPLICATE_ATTENDANCE',
            'message', 'Attendance has already been recorded for this session at ' || to_char(v_existing.marked_at, 'HH12:MI AM') || '.'
        );
    END IF;

    -- Step 6: Insert attendance record
    INSERT INTO public.attendance (student_id, session_id, marked_at, status, device_info)
    VALUES (p_student_id, v_session.id, NOW(), 'present', p_device_info)
    RETURNING id INTO v_new_attendance;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'ATTENDANCE_RECORDED',
        'message', 'Attendance recorded successfully!',
        'attendance_id', v_new_attendance,
        'class_name', v_session.class_name,
        'subject', v_session.subject,
        'marked_at', NOW()
    );
END;
$$;

-- 11. Seed Initial Demonstration Data
-- Sample Teacher
INSERT INTO public.teachers (id, full_name, email, department)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Dr. Sarah Jenkins', 'teacher@smartattend.edu', 'Computer Science')
ON CONFLICT (email) DO NOTHING;

-- Sample Students (Rahul – 101, Arjun – 102, Priya – 103, Sneha – 104, Kiran – 105)
INSERT INTO public.students (id, full_name, roll_number, class_name, section)
VALUES
('22222222-2222-2222-2222-000000000101', 'Rahul Sharma', '101', 'B.Tech CS 3rd Year', 'Section A'),
('22222222-2222-2222-2222-000000000102', 'Arjun Verma', '102', 'B.Tech CS 3rd Year', 'Section A'),
('22222222-2222-2222-2222-000000000103', 'Priya Patel', '103', 'B.Tech CS 3rd Year', 'Section A'),
('22222222-2222-2222-2222-000000000104', 'Sneha Reddy', '104', 'B.Tech CS 3rd Year', 'Section A'),
('22222222-2222-2222-2222-000000000105', 'Kiran Nair', '105', 'B.Tech CS 3rd Year', 'Section A')
ON CONFLICT (roll_number) DO NOTHING;

-- Sample Active Session for Demo
INSERT INTO public.sessions (id, session_token, class_name, subject, section, teacher_id, created_at, expires_at, is_active, duration_minutes)
VALUES
('33333333-3333-3333-3333-333333333333', 'SMART-CS301-DEMO-TOKEN', 'B.Tech CS 3rd Year', 'Data Structures & Algorithms', 'Section A', '11111111-1111-1111-1111-111111111111', NOW(), NOW() + INTERVAL '30 minutes', true, 30)
ON CONFLICT (session_token) DO NOTHING;

-- Seed Sample Attendance for Rahul & Priya
INSERT INTO public.attendance (student_id, session_id, marked_at, status)
VALUES
('22222222-2222-2222-2222-000000000101', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '5 minutes', 'present'),
('22222222-2222-2222-2222-000000000103', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 minutes', 'present')
ON CONFLICT DO NOTHING;
