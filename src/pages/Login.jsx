import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (loginError) throw loginError;

      if (!data?.user?.id || !data?.session) {
        throw new Error('Login succeeded, but no active session was returned. Please try again.');
      }

      const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser();

      if (verifyError) throw verifyError;

      if (!verifiedUser) {
        throw new Error('No authenticated user was found. Please try logging in again.');
      }

      if (verifiedUser.id !== data.user.id) {
        throw new Error('Account session verification failed. Please try again.');
      }

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Login failed. Please try again.';

      if (err?.message) {
        message = err.message;
      }

      if (message.toLowerCase().includes('invalid login credentials')) {
        message = 'Invalid email or password.';
      }

      if (message.toLowerCase().includes('email not confirmed')) {
        message = 'Please confirm your email before logging in.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B0D19] text-slate-100 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero card frame */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card rounded-[40px] p-6 sm:p-10 border border-indigo-500/10 shadow-2xl relative z-10 my-8 bg-[#111425]/70 backdrop-blur-xl"
      >
        
        {/* Left Welcome branding block */}
        <div className="flex flex-col justify-between space-y-8 lg:pr-8 border-b lg:border-b-0 lg:border-r border-slate-800/60 pb-8 lg:pb-0">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5.5 h-5.5 text-indigo-400" />
                </div>
              </div>
              <span className="font-['Outfit'] font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
                Nexus
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight font-['Outfit']">
              Experience Social Media <br />
              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Reimagined.</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
              Connect with creators worldwide, browse high-fidelity products, explore active group circles, and direct-message instantly.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white font-['Outfit']">Real-time Messenger</h4>
                <p className="text-[11px] text-slate-400">Collaborate and chat without reloading.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/25">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white font-['Outfit']">Privacy First</h4>
                <p className="text-[11px] text-slate-400">Authenticated sessions backed by secure encryption.</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Nexus Social Architecture © 2026.
          </div>
        </div>

        {/* Right side authentication panel */}
        <div className="flex flex-col justify-center lg:pl-4">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white font-['Outfit']">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Enter your credentials to securely access your portfolio feed.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold leading-normal">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => setError('Password reset flows are currently managed by admin.')}
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Login trigger button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
            >
              <span>{loading ? 'Verifying Account...' : 'Sign In to Account'}</span>
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <ArrowRight className="w-4.5 h-4.5" />
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 font-extrabold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </motion.div>

    </div>
  );
}
