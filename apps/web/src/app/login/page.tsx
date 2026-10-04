'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle2, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [step, setStep] = useState<'EMAIL_CHECK' | 'LOGIN' | 'REGISTER'>('EMAIL_CHECK');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'OFFICER' | 'WORKER'>('CITIZEN');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [existingUserMeta, setExistingUserMeta] = useState<{ name?: string; role?: string } | null>(null);

  // Step 1: Check Email
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to check email');
      }

      if (data.exists) {
        // User exists -> Sign In
        setExistingUserMeta(data.user);
        setStep('LOGIN');
      } else {
        // User is new -> Register
        setExistingUserMeta(null);
        setStep('REGISTER');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error checking account');
    } finally {
      setLoading(false);
    }
  };

  // Step 2A: Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Password is required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccessMessage('Login successful! Redirecting...');
      localStorage.setItem('swachh_user', JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.role === 'OFFICER' || data.user.role === 'SUPERVISOR') {
          router.push('/officer');
        } else if (data.user.role === 'WORKER') {
          router.push('/worker');
        } else if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/citizen');
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid password or credentials');
    } finally {
      setLoading(false);
    }
  };

  // Step 2B: Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setErrorMessage('Name and password are required');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMessage('Account registered & stored in MongoDB! Redirecting...');
      localStorage.setItem('swachh_user', JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.role === 'OFFICER') router.push('/officer');
        else if (data.user.role === 'WORKER') router.push('/worker');
        else router.push('/citizen');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative z-10 text-slate-100">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Swachh Setu Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {step === 'EMAIL_CHECK' && 'Enter your email to Sign In or Create an Account'}
              {step === 'LOGIN' && 'Welcome Back — Enter your password to sign in'}
              {step === 'REGISTER' && 'New Account Setup — Saved directly to MongoDB'}
            </p>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-xs text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Email Detection */}
        {step === 'EMAIL_CHECK' && (
          <form onSubmit={handleCheckEmail} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2A: Sign In (Existing User) */}
        {step === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in duration-300">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  {existingUserMeta?.name ? existingUserMeta.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-200">{existingUserMeta?.name || 'Existing User'}</p>
                  <p className="text-[11px] text-slate-400">{email}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 uppercase">
                {existingUserMeta?.role || 'User'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('REGISTER');
                setErrorMessage('');
              }}
              className="w-full text-xs text-slate-400 hover:text-emerald-400 text-center transition py-1"
            >
              Don't have an account? Create one
            </button>
          </form>
        )}

        {/* STEP 2B: Register (New User) */}
        {step === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-300">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
              <UserPlus className="w-4 h-4 shrink-0 text-amber-400" />
              <span>No existing account for <strong className="text-white">{email}</strong>. Set up your details below.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'CITIZEN', label: 'Citizen' },
                  { key: 'OFFICER', label: 'Officer' },
                  { key: 'WORKER', label: 'Worker' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRole(item.key as any)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      role === item.key
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Save to MongoDB</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('LOGIN');
                setErrorMessage('');
              }}
              className="w-full text-xs text-slate-400 hover:text-emerald-400 text-center transition py-1"
            >
              Already have an account? Sign In
            </button>
          </form>
        )}

        {/* Change Email Link */}
        {step !== 'EMAIL_CHECK' && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setStep('EMAIL_CHECK');
                setPassword('');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              ← Change Email Address ({email})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
