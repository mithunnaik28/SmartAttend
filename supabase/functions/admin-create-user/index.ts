import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase function environment configuration.');
    return respond(500, { error: 'Account provisioning is not configured.' });
  }

  const authorization = request.headers.get('Authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return respond(401, { error: 'Authentication required.' });
  }

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await service.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return respond(401, { error: 'Your session is invalid or expired.' });
  }

  const { data: administrator, error: administratorError } = await service
    .from('admins')
    .select('id')
    .eq('user_id', authData.user.id)
    .maybeSingle();
  if (administratorError) {
    console.error('Failed to verify administrator role:', administratorError.message);
    return respond(500, { error: 'Could not verify administrator permissions.' });
  }
  if (!administrator) {
    return respond(403, { error: 'Only administrators can create accounts.' });
  }

  let input: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return respond(400, { error: 'Request body must be a JSON object.' });
    }
    input = body as Record<string, unknown>;
  } catch {
    return respond(400, { error: 'Request body must be valid JSON.' });
  }

  const role = input.role;
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const fullName = typeof input.full_name === 'string' ? input.full_name.trim() : '';
  const password = typeof input.password === 'string' ? input.password : '';

  if (role !== 'teacher' && role !== 'student') {
    return respond(400, { error: 'Role must be teacher or student.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return respond(400, { error: 'Enter a valid email address.' });
  }
  if (fullName.length < 2 || fullName.length > 120) {
    return respond(400, { error: 'Name must be between 2 and 120 characters.' });
  }
  if (password.length < 12 || password.length > 128) {
    return respond(400, { error: 'Temporary passwords must be between 12 and 128 characters.' });
  }

  const studentRollNumber = typeof input.roll_number === 'string'
    ? input.roll_number.trim().slice(0, 64)
    : '';
  const studentClassName = typeof input.class_name === 'string'
    ? input.class_name.trim().slice(0, 120)
    : '';
  const studentSection = typeof input.section === 'string'
    ? input.section.trim().slice(0, 64)
    : '';
  const profile = role === 'teacher'
    ? {
        full_name: fullName,
        email,
        department: typeof input.department === 'string' && input.department.trim()
          ? input.department.trim().slice(0, 120)
          : 'General',
      }
    : {
        full_name: fullName,
        email,
        roll_number: studentRollNumber,
        class_name: studentClassName,
        section: studentSection,
      };

  if (role === 'student' && (!studentRollNumber || !studentClassName || !studentSection)) {
    return respond(400, { error: 'Student roll number, class, and section are required.' });
  }

  const profileTable = role === 'teacher' ? 'teachers' : 'students';
  const identityColumn = role === 'teacher' ? 'email' : 'roll_number';
  const identityValue = role === 'teacher' ? email : studentRollNumber;
  const { data: existingProfile, error: existingProfileError } = await service
    .from(profileTable)
    .select('id, user_id')
    .eq(identityColumn, identityValue)
    .maybeSingle();
  if (existingProfileError) {
    console.error('Could not inspect the existing profile:', existingProfileError.message);
    return respond(500, { error: 'Could not verify whether this profile already exists.' });
  }
  if (existingProfile?.user_id) {
    return respond(409, { error: 'This email or roll number is already linked to an account.' });
  }

  const { data: createdAuth, error: createAuthError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (createAuthError || !createdAuth.user) {
    return respond(400, { error: createAuthError?.message || 'Could not create the account.' });
  }

  const profileQuery = existingProfile
    ? service.from(profileTable)
        .update({ ...profile, user_id: createdAuth.user.id })
        .eq('id', existingProfile.id)
        .is('user_id', null)
    : service.from(profileTable)
        .insert({ ...profile, user_id: createdAuth.user.id });
  const { data: createdProfile, error: profileError } = await profileQuery
    .select('id, full_name, email')
    .single();

  if (profileError || !createdProfile) {
    const { error: rollbackError } = await service.auth.admin.deleteUser(createdAuth.user.id);
    if (rollbackError) {
      console.error('Failed to roll back orphaned auth user:', rollbackError.message);
      return respond(500, { error: 'Profile creation failed and the new account could not be rolled back. Contact your administrator.' });
    }
    return respond(400, { error: profileError?.message || 'Could not create the profile.' });
  }

  return respond(201, {
    profile: { ...createdProfile, role },
    temporaryPasswordSet: true,
  });
});
