import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, isDemoMode, requireSupabase } from '../lib/supabase';
import { DEMO_TEACHER, DEMO_STUDENTS } from '../services/mockData';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'smartattend_current_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!isDemoMode()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Could not restore the demo user:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(async ({ data: { session }, error }) => {
        if (error) throw error;
        if (session?.user) await fetchProfile(session.user);
      }).catch((error) => {
        console.error('Could not restore the Supabase session:', error);
        setUser(null);
      }).finally(() => setLoading(false));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user).catch((error) => {
              console.error('Could not load the signed-in user profile:', error);
              setUser(null);
            });
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (authUser) => {
    const client = requireSupabase();
    const { data: administrator, error: adminError } = await client
      .from('admins')
      .select('id, user_id, full_name, email')
      .eq('user_id', authUser.id)
      .maybeSingle();
    if (adminError) throw adminError;

    let profile = administrator && { ...administrator, role: 'admin' };
    if (!profile) {
      const { data: teacher, error: teacherError } = await client
        .from('teachers')
        .select('id, user_id, full_name, email, department')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (teacherError) throw teacherError;
      if (teacher) profile = { ...teacher, role: 'teacher' };
    }
    if (!profile) {
      const { data: student, error: studentError } = await client
        .from('students')
        .select('id, user_id, full_name, email, roll_number, class_name, section, avatar_url')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (studentError) throw studentError;
      if (student) {
        let avatar = student.avatar_url;
        if (avatar && !avatar.startsWith('http')) {
          const { data, error } = await client.storage
            .from('student-avatars')
            .createSignedUrl(avatar, 3600);
          if (error) throw error;
          avatar = data.signedUrl;
        }
        profile = { ...student, avatar, role: 'student' };
      }
    }

    if (!profile) {
      throw new Error('This login is not linked to an active SmartAttend profile. Contact your administrator.');
    }
    const fullUser = { ...profile, user_id: authUser.id, email: profile.email || authUser.email };
    setUser(fullUser);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return fullUser;
  };

  const login = async (email, password, roleHint = 'teacher') => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) throw error;
        try {
          const profile = await fetchProfile(data.user);
          return { success: true, user: profile };
        } catch (profileError) {
          await supabase.auth.signOut();
          throw profileError;
        }
      }

      if (!isDemoMode()) {
        throw new Error('Database connection is required. Ask your administrator to configure SmartAttend.');
      }
      const cleanEmail = email.toLowerCase().trim();
      const matchedUser = cleanEmail === DEMO_TEACHER.email
        ? { ...DEMO_TEACHER }
        : DEMO_STUDENTS.find(s => s.email.toLowerCase() === cleanEmail);
      const expectedPassword = matchedUser?.role === 'teacher' ? 'password123' : 'student123';
      if (!matchedUser || matchedUser.role !== roleHint || password !== expectedPassword) {
        throw new Error('Invalid demo credentials. Use the evaluation profile buttons below.');
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

  const loginAsDemo = (type, studentId = null) => {
    if (!isDemoMode()) {
      throw new Error('Demo login is disabled when SmartAttend is connected to a database.');
    }
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

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const requestPasswordReset = async (email) => {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  };

  const updatePassword = async (password) => {
    const client = requireSupabase();
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;
  };

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsDemo,
        logout,
        requestPasswordReset,
        updatePassword,
        isTeacher,
        isStudent,
        isAdmin,
        demoStudents: DEMO_STUDENTS,
        demoTeacher: DEMO_TEACHER,
        isSupabaseReady: isSupabaseConfigured(),
        isDemoMode: isDemoMode()
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
