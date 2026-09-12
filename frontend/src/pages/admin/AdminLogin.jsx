import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import GradientButton from '../../components/common/GradientButton';

// Intentionally not linked from the public nav ("hidden URL" per spec) —
// reachable only by navigating to /admin/login directly.
export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-base-800 p-6 shadow-card sm:p-8">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-logo-gradient text-xl font-extrabold text-white shadow-glow">
            B
          </div>
          <h1 className="mt-3 text-lg font-bold text-white">Admin нэвтрэх</h1>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-accent-red/10 px-3 py-2 text-sm text-accent-red">{error}</p>
        )}

        <label className="mb-1 block text-xs font-semibold uppercase text-gray-400">Нэвтрэх нэр</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mb-4 w-full rounded-xl border border-base-500 bg-base-800 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-to"
        />

        <label className="mb-1 block text-xs font-semibold uppercase text-gray-400">Нууц үг</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6 w-full rounded-xl border border-base-500 bg-base-800 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-to"
        />

        <GradientButton type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </GradientButton>
      </form>
    </div>
  );
}
