import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  AtSign,
  ArrowRight,
  Check,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      setError('Username can contain only letters, numbers, underscore and dot.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);

      await supabase.auth.signOut();
      clearLocalAppState();

      const { data: existingProfile, error: usernameCheckError } =
        await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanHandle)
          .maybeSingle();

      if (usernameCheckError) {
        console.error('Username check error:', usernameCheckError);
        throw new Error('Could not verify username. Please try again.');
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
          console.error('Profile creation fallback error:', createProfileError);
          throw new Error('Account was created, but the profile could not be created. Check the profiles table RLS/trigger.');
        }

        profile = createdProfile;
      }

      if (data.session) {
        const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser();

        if (verifyError) throw verifyError;

        if (!verifiedUser || verifiedUser.id !== data.user.id) {
          throw new Error('New account session verification failed.');
        }

        setSuccess('Account created successfully!');
        navigate('/', { replace: true });
      } else {
        setSuccess('Account created! Please check your email for the confirmation link, then sign in.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B0D19] text-slate-100 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl glass-card rounded-[40px] p-6 sm:p-10 border border-indigo-500/15 shadow-2xl relative z-10 my-8 bg-[#111425]/75 backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 mb-3.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5.5 h-5.5 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
            Join Nexus Today
          </h1>

          <p className="text-xs text-slate-400 mt-1 font-medium">
            Create your high-fidelity creator account to start posting and building.
          </p>
        </div>

        {error && (
          <div className="mb-4.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold leading-normal">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold leading-normal">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Emon Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
              <div className="relative">
                <AtSign className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="emon23"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          </div>

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
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Select Your Interests</label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800/60 hover:border-slate-700/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors mt-4"
          >
            <span>{loading ? 'Creating Creator Account...' : 'Create Account'}</span>
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <ArrowRight className="w-4.5 h-4.5" />
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-extrabold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
