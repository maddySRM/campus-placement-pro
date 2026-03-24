import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Shield, User, Eye, EyeOff } from 'lucide-react';
import { supabase, type Profile } from './lib/supabase';
import StudentApp from './pages/StudentApp';
import AdminApp from './pages/AdminApp';

// ── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase isn't properly configured yet, don't wait for a slow network timeout
    const isSupabaseConfigured = (import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Skipping auth check and showing login screen.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // Give the user a visible hint instead of silently reloading
      alert(`Login succeeded but profile fetch failed: ${err.message || 'Unknown error'}. Did you run the Supabase SQL schema?`);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="p-3 bg-white rounded-2xl shadow-md">
          <GraduationCap className="w-10 h-10 text-indigo-600 animate-pulse-soft" />
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  // Not authenticated → show auth
  if (!user || !profile) {
    return <AuthScreen />;
  }

  // Authenticated → route by role
  if (profile.is_admin) {
    return (
      <AdminApp
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <StudentApp
      user={user}
      profile={profile}
      onSignOut={handleSignOut}
      onProfileUpdate={() => fetchProfile(user.id)}
    />
  );
}

// ── Auth Screen ───────────────────────────────────────────────────────────────

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, roll_number: rollNumber }
          }
        });
        if (authError) throw authError;
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-end pb-16 px-12 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/sand_dune_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
            Student Placement
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs mx-auto drop-shadow">
            track applications, discover opportunitieS
          </p>
        </div>
      </div>


      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
              <div className="p-2 admin-sidebar rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900">Student Placement</span>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900">
                  {mode === 'login' ? 'Welcome back!' : 'Create account'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your placement dashboard.'
                    : 'Register to start your placement journey.'}
                </p>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Students</span> sign in below. Admin credentials are provided by your placement officer.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Roll Number</label>
                      <input
                        required
                        type="text"
                        value={rollNumber}
                        onChange={e => setRollNumber(e.target.value)}
                        placeholder="CS2023001"
                        className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full h-11 rounded-xl border border-slate-200 px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <span className="text-sm text-slate-500">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
