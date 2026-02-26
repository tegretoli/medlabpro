'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { FlaskConical, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <FlaskConical className="w-9 h-9 text-primary-700" />
          </div>
          <h1 className="text-3xl font-bold text-white">MedLab Pro</h1>
          <p className="text-primary-200 mt-1 text-sm">Laboratory Management System</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in to your account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-700 text-white py-2.5 rounded-lg font-semibold 
                         hover:bg-primary-800 transition-colors disabled:opacity-60 mt-2
                         flex items-center justify-center gap-2">
              {loading ? (
                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">Demo credentials:</p>
            <div className="mt-2 space-y-1">
              {[
                ['admin@medlab.com', 'admin123', 'Admin'],
                ['biochemist@medlab.com', 'bio123', 'Biochemist'],
                ['tech@medlab.com', 'tech123', 'Lab Tech'],
              ].map(([email, pw, role]) => (
                <button key={email} onClick={() => setForm({ email, password: pw })}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-semibold text-primary-700">{role}</span>
                  <span className="text-xs text-slate-500 ml-2">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
