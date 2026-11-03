import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_TEACHER, DEMO_STUDENTS } from '../services/mockData';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'smartattend_current_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Initialize Supabase Auth listener if enabled
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          // If no supabase session and not a local demo session, clear
          if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
            setUser(null);
          }
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      // Check if user is a teacher
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (teacher) {
        const fullUser = {
          id: teacher.id,
          user_id: authUser.id,
          email: authUser.email,
          full_name: teacher.full_name,
          role: 'teacher',
          department: teacher.department
        };
        setUser(fullUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fullUser));
        setLoading(false);
        return;
      }

      // Check if user is a student
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (student) {
        const fullUser = {
          id: student.id,
          user_id: authUser.id,
          email: authUser.email,
          full_name: student.full_name,
          roll_number: student.roll_number,
          class_name: student.class_name,
          section: student.section,
          role: 'student'
        };
        setUser(fullUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fullUser));
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in with email & password (supports Supabase & Demo fallbacks)
   */
  const login = async (email, password, roleHint = 'teacher') => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        await fetchProfile(data.user);
        return { success: true, user: data.user };
      }

      // Demo Login Mode
      const cleanEmail = email.toLowerCase().trim();
      let matchedUser = null;

      if (cleanEmail === DEMO_TEACHER.email || roleHint === 'teacher') {
        matchedUser = { ...DEMO_TEACHER };
      } else {
        const matchedStudent = DEMO_STUDENTS.find(s => s.email.toLowerCase() === cleanEmail) 
          || DEMO_STUDENTS.find(s => s.roll_number === email.trim()) 
          || DEMO_STUDENTS[0];
        matchedUser = { ...matchedStudent };
      }

      setUser(matchedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
      return { success: true, user: matchedUser };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick-login helper for demo evaluation
   */
  const loginAsDemo = (type, studentId = null) => {
    let selectedUser;
    if (type === 'teacher') {
      selectedUser = { ...DEMO_TEACHER };
    } else {
      if (studentId) {
        selectedUser = DEMO_STUDENTS.find(s => s.id === studentId) || DEMO_STUDENTS[0];
      } else {
        selectedUser = DEMO_STUDENTS[0]; // Rahul (101)
      }
    }
    setUser(selectedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(selectedUser));
    return selectedUser;
  };

  /**
   * Log out
   */
  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsDemo,
        logout,
        isTeacher,
        isStudent,
        demoStudents: DEMO_STUDENTS,
        demoTeacher: DEMO_TEACHER,
        isSupabaseReady: isSupabaseConfigured()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
