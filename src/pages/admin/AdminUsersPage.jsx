import React, { useEffect, useState } from 'react';
import { AlertCircle, GraduationCap, Plus, School, ShieldCheck, Upload, Users } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

const initialForm = {
  role: 'student',
  full_name: '',
  email: '',
  password: '',
  roll_number: '',
  class_name: '',
  section: '',
  department: ''
};

function Avatar({ person }) {
  if (person.avatar) {
    return <img src={person.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />;
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
      {person.full_name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

export default function AdminUsersPage() {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const [teacherRows, studentRows] = await Promise.all([
        attendanceService.getTeachers(),
        attendanceService.getStudents({ includeEmail: true })
      ]);
      setTeachers(teacherRows);
      setStudents(studentRows);
    } catch (error) {
      toast.error('Directory could not be loaded', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      const profile = await attendanceService.createManagedUser(form);
      let avatarUploaded = false;
      if (form.role === 'student' && avatarFile) {
        try {
          await attendanceService.uploadStudentAvatar(profile.id, avatarFile);
          avatarUploaded = true;
        } catch (error) {
          toast.error('Account created; photo upload failed', error.message);
        }
      }
      if (avatarUploaded || !avatarFile || form.role !== 'student') {
        toast.success('Account created', `${profile.full_name} can sign in with the temporary password.`);
      }
      setForm(initialForm);
      setAvatarFile(null);
      event.target.reset();
      await loadDirectory();
    } catch (error) {
      toast.error('Account was not created', error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Administration</span>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">People & access</h1>
        <p className="mt-1 text-sm text-slate-500">Create teacher and student accounts for your institution.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Add an account</h2>
              <p className="text-xs text-slate-500">The user can reset their temporary password from sign-in.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">
              Account type
              <select
                name="role"
                value={form.role}
                onChange={updateForm}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Full name
              <input
                name="full_name"
                value={form.full_name}
                onChange={updateForm}
                minLength={2}
                maxLength={120}
                autoComplete="name"
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateForm}
                maxLength={254}
                autoComplete="email"
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Temporary password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateForm}
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <span className="mt-1 block font-normal text-slate-500">Use at least 12 characters. Share it directly and ask the user to reset it.</span>
            </label>

            {form.role === 'teacher' ? (
              <label className="block text-xs font-semibold text-slate-700">
                Department
                <input
                  name="department"
                  value={form.department}
                  onChange={updateForm}
                  maxLength={120}
                  placeholder="e.g. Mathematics"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </label>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Roll number
                    <input
                      name="roll_number"
                      value={form.roll_number}
                      onChange={updateForm}
                      maxLength={64}
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Section
                    <input
                      name="section"
                      value={form.section}
                      onChange={updateForm}
                      maxLength={64}
                      placeholder="e.g. A"
                      required
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-slate-700">
                  Class
                  <input
                    name="class_name"
                    value={form.class_name}
                    onChange={updateForm}
                    maxLength={120}
                    placeholder="e.g. B.Tech CS 3rd Year"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Profile photo <span className="font-normal text-slate-400">(optional, JPG/PNG/WebP, up to 5 MB)</span>
                  <span className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600 hover:border-brand-400">
                    <Upload className="h-4 w-4 text-brand-600" />
                    {avatarFile?.name || 'Choose a photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                    />
                  </span>
                </label>
              </>
            )}

            <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Account creation is recorded in Supabase Auth and the student/teacher directory. Admins never receive a service-role key.
            </div>

            <Button type="submit" variant="primary" icon={Plus} loading={creating} className="w-full">
              Create {form.role} account
            </Button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><School className="h-4 w-4 text-brand-600" /> Teachers</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{loading ? '—' : teachers.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><GraduationCap className="h-4 w-4 text-purple-600" /> Students</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{loading ? '—' : students.length}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Student roster</h2>
                <p className="text-xs text-slate-500">Photos and class assignments</p>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading directory…</p>
            ) : students.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No student accounts yet.</p>
            ) : (
              <div className="max-h-[34rem] divide-y divide-slate-100 overflow-y-auto">
                {students.map(student => (
                  <div key={student.id} className="flex items-center gap-3 py-3">
                    <Avatar person={student} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{student.full_name}</div>
                      <div className="truncate text-xs text-slate-500">{student.email} · #{student.roll_number}</div>
                    </div>
                    <div className="hidden text-right text-xs text-slate-500 sm:block">
                      <div>{student.class_name}</div>
                      <div>Section {student.section}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <div>
                <h2 className="font-bold text-slate-900">Teacher directory</h2>
                <p className="text-xs text-slate-500">Authorized faculty accounts</p>
              </div>
            </div>
            {loading ? (
              <p className="py-5 text-center text-sm text-slate-500">Loading directory…</p>
            ) : teachers.length === 0 ? (
              <p className="py-5 text-center text-sm text-slate-500">No teacher accounts yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="flex items-center gap-3 py-3">
                    <Avatar person={teacher} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{teacher.full_name}</div>
                      <div className="truncate text-xs text-slate-500">{teacher.email} · {teacher.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
