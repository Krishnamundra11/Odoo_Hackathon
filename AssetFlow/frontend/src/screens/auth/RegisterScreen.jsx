import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Boxes } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function RegisterScreen() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      // role is intentionally never sent - backend hardcodes "employee" on signup
      await signup({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F4] px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#061E29]">
          <Boxes className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-[#061E29]">Create your AssetFlow account</h1>
        <p className="mt-1 text-sm text-[#5F9598]">New accounts start as Employees.</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Full name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
            </div>
          </div>

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

          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Password</label>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Confirm password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                minLength={6}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#061E29] py-2.5 text-sm font-medium text-white transition hover:bg-[#1D546D] disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : (
              <>
                Create account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-[#1D546D]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold hover:underline">
          Sign in
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