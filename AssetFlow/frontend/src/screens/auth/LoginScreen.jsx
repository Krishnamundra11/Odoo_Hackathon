import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Boxes } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F4] px-4 py-12">
      {/* Logo + heading */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#061E29]">
          <Boxes className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-[#061E29]">Sign in to AssetFlow</h1>
        <p className="mt-1 text-sm text-[#5F9598]">Welcome back. Please enter your details.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Work email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-[#061E29]">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-[#1D546D] hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#061E29] py-2.5 text-sm font-medium text-white transition hover:bg-[#1D546D] disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : (
              <>
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google (decorative only - see note) */}
        <button
          type="button"
          disabled
          title="Not available - AssetFlow uses email/password accounts only"
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-400"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      <p className="mt-6 text-sm text-[#1D546D]">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-10 flex gap-4 text-xs text-gray-400">
        <span>Privacy</span>
        <span>·</span>
        <span>Terms</span>
        <span>·</span>
        <span>Support</span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 13.6a6.6 6.6 0 0 1 0-4.2V6.55H2.18a11 11 0 0 0 0 9.9l3.66-2.85z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.99 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.55l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}