import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  AtSign,
  ArrowRight,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Design', 'React']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableInterests = [
    'Design',
    'React',
    'Photography',
    'AI & Tech',
    'Outdoors',
    'Gaming',
    'Music'
  ];

  const toggleInterest = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const clearLocalAppState = () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (
        key.startsWith('connectbd_') ||
        key.startsWith('ConnectBD_')
      ) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const cleanName = name.trim();
    const cleanHandle = handle.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanHandle) {
      setError('Please enter a username.');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(cleanHandle)) {
      setError(
        'Username can contain only letters, numbers, underscore and dot.'
      );
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       * Make sure an old logged-in account cannot remain active
       * while creating the next account.
       */
      await supabase.auth.signOut();
      clearLocalAppState();

      /*
       * Check username first so two profiles cannot accidentally
       * use the same handle.
       */
      const { data: existingProfile, error: usernameCheckError } =
        await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanHandle)
          .maybeSingle();

      if (usernameCheckError) {
        console.error('Username check error:', usernameCheckError);
        throw new Error(
          'Could not verify username. Please try again.'
        );
      }

      if (existingProfile) {
        setError('This username is already taken.');
        return;
      }

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              username: cleanHandle,
              interests: selectedTags
            }
          }
        });

      if (signUpError) throw signUpError;

      if (!data?.user) {
        throw new Error('Account could not be created.');
      }

      console.log('✅ NEW CONNECTBD ACCOUNT:', {
        id: data.user.id,
        email: data.user.email
      });

      /*
       * The database trigger should create:
       * profiles.id = auth.users.id
       *
       * We wait briefly and verify it.
       */
      let profile = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: profileData, error: profileError } =
          await supabase
            .from('profiles')
            .select('id, full_name, username, profile_image')
            .eq('id', data.user.id)
            .maybeSingle();

        if (!profileError && profileData) {
          profile = profileData;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!profile) {
        /*
         * If your trigger is not present, create the profile here.
         * This is safe because id is the Auth UUID.
         */
        const { data: createdProfile, error: createProfileError } =
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: cleanName,
              username: cleanHandle
            })
            .select()
            .single();

        if (createProfileError) {
          console.error(
            'Profile creation fallback error:',
            createProfileError
          );

          throw new Error(
            'Account was created, but the profile could not be created. Check the profiles table RLS/trigger.'
          );
        }

        profile = createdProfile;
      }

      /*
       * Email confirmation OFF:
       * Supabase returns a session and we can enter the app.
       *
       * Email confirmation ON:
       * data.session will be null and user must confirm email.
       */
      if (data.session) {
        const {
          data: { user: verifiedUser },
          error: verifyError
        } = await supabase.auth.getUser();

        if (verifyError) throw verifyError;

        if (!verifiedUser || verifiedUser.id !== data.user.id) {
          throw new Error('New account session verification failed.');
        }

        setSuccess('Account created successfully!');

        console.log('✅ REGISTERED SESSION:', {
          id: verifiedUser.id,
          email: verifiedUser.email,
          profileId: profile.id
        });

        navigate('/', { replace: true });
      } else {
        setSuccess(
          'Account created! Please confirm your email, then sign in.'
        );
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative z-10 my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 mb-3 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white">
            Join ConnectBD Today
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create your account to start sharing and connecting.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>

              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Emon Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>

              <div className="relative">
                <AtSign className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="emon23"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="emon@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>

            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Your Interests
            </label>

            <div className="flex flex-wrap gap-2">
              {availableInterests.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all group mt-4"
          >
            <span>
              {loading ? 'Creating Account...' : 'Create Account'}
            </span>

            {!loading && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-400 font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
