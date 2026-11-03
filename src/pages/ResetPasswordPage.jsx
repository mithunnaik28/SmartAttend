import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, loading, updatePassword } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', 'Enter the same password in both fields.');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(password);
      toast.success('Password updated', 'You can now sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Password could not be updated', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Checking password reset link…</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600">This password reset link is invalid or has expired.</p>
        <Button variant="primary" onClick={() => navigate('/login')}>Return to sign in</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-xs text-slate-500">Choose a unique password with at least 12 characters.</p>
      </div>
      <label className="block text-xs font-semibold text-slate-700">
        New password
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          required
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <label className="block text-xs font-semibold text-slate-700">
        Confirm new password
        <input
          type="password"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          required
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </label>
      <Button type="submit" variant="primary" loading={saving} className="w-full">
        Update password
      </Button>
    </form>
  );
}
