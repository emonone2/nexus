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
  Zap
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ============================================================
     LOGIN
     ============================================================ */
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

      /*
       * IMPORTANT:
       * Do NOT call supabase.auth.signOut() before login.
       *
       * AppContext already listens to Supabase auth changes.
       * Calling signOut() here can create an auth race condition.
       */

      const {
        data,
        error: loginError
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (loginError) {
        throw loginError;
      }

      /*
       * Supabase should return both user and session
       */
      if (!data?.user?.id || !data?.session) {
        throw new Error(
          'Login succeeded, but no active session was returned. Please try again.'
        );
      }

      /*
       * Verify that the current Supabase session belongs
       * to the account that just logged in.
       */
      const {
        data: { user: verifiedUser },
        error: verifyError
      } = await supabase.auth.getUser();

      if (verifyError) {
        throw verifyError;
      }

      if (!verifiedUser) {
        throw new Error(
          'No authenticated user was found. Please try logging in again.'
        );
      }

      if (verifiedUser.id !== data.user.id) {
        throw new Error(
          'Account session verification failed. Please try again.'
        );
      }

      console.log('✅ CONNECTBD LOGIN SUCCESS:', {
        id: verifiedUser.id,
        email: verifiedUser.email
      });

      /*
       * AppContext will receive the SIGNED_IN event,
       * load the profile and set currentUser.
       *
       * Then go to the protected home route.
       */
      navigate('/', { replace: true });

    } catch (err) {
      console.error('❌ Login error:', err);

      let message = 'Login failed. Please try again.';

      if (err?.message) {
        message = err.message;
      }

      /*
       * More user-friendly Supabase messages
       */
      if (
        message.toLowerCase().includes('invalid login credentials')
      ) {
        message = 'Invalid email or password.';
      }

      if (
        message.toLowerCase().includes('email not confirmed')
      ) {
        message =
          'Please confirm your email before logging in.';
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     UI
     ============================================================ */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-slate-100 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative z-10 my-8">

        {/* ======================================================
            LEFT SIDE
            ====================================================== */}
        <div className="flex flex-col justify-between space-y-8 lg:pr-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0">

          <div>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">

                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>

              </div>

              <span className="font-['Outfit'] font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
                Nexus
              </span>

            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight font-['Outfit']">

              Experience Social Media <br />

              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                Reimagined.
              </span>

            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Connect with friends, share vibrant moments, and explore
              dynamic communities.
            </p>

          </div>

          {/* Features */}
          <div className="space-y-4">

            {/* Realtime Messenger */}
            <div className="flex items-start gap-3">

              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Zap className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">
                  Realtime Messenger
                </h4>

                <p className="text-xs text-slate-400">
                  Chat with friends instantly.
                </p>
              </div>

            </div>

            {/* Privacy */}
            <div className="flex items-start gap-3">

              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">
                  Privacy First
                </h4>

                <p className="text-xs text-slate-400">
                  Your account and messages stay protected.
                </p>
              </div>

            </div>

          </div>

          <div className="text-xs text-slate-500">
            Nexus Social UI © 2026. All rights reserved.
          </div>

        </div>

        {/* ======================================================
            RIGHT SIDE - LOGIN FORM
            ====================================================== */}
        <div className="flex flex-col justify-center">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome Back
            </h2>

            <p className="text-sm text-slate-400">
              Enter your credentials to access your account.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* ==================================================
              FORM
              ================================================== */}
          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            {/* Email */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>

              <div className="relative">

                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <div className="flex justify-between items-center mb-1.5">

                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      'Password reset will be added soon.'
                    )
                  }
                  className="text-xs text-indigo-400 hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">

                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((v) => !v)
                  }
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all group mt-2"
            >

              <span>
                {loading
                  ? 'Signing In...'
                  : 'Sign In to Account'}
              </span>

              {!loading && (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}

            </button>

          </form>

          {/* Register */}
          <p className="text-center text-xs text-slate-400 mt-6">

            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-indigo-400 font-bold hover:underline"
            >
              Create an Account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}