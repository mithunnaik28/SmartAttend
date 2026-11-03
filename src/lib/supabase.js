import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function hasValidSupabaseUrl() {
  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) return false;
  try {
    const url = new URL(supabaseUrl);
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = () => {
  return Boolean(
    hasValidSupabaseUrl() &&
    supabaseAnonKey && 
    !/^your[-_]/i.test(supabaseAnonKey) &&
    supabaseAnonKey !== '******'
  );
};

export const isDemoMode = () =>
  !isSupabaseConfigured() && import.meta.env.VITE_DEMO_MODE === 'true';

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('SmartAttend is not connected to Supabase. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}
