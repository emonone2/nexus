import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, setCurrentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings form state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [publicProfile, setPublicProfile] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(
    currentUser.isProfileLocked || localStorage.getItem(`nexus_profile_lock_${currentUser.id}`) === 'true'
  );

  const handleToggleProfileLock = async (checked) => {
    setIsProfileLocked(checked);
    setCurrentUser(prev => ({
      ...prev,
      isProfileLocked: checked
    }));

    try {
      await supabase
        .from('profiles')
        .update({ is_profile_locked: checked })
        .eq('id', currentUser.id);
    } catch (e) {
      console.warn("Database column lock error, falling back to local storage:", e);
    }

    localStorage.setItem(`nexus_profile_lock_${currentUser.id}`, checked ? 'true' : 'false');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setCurrentUser(prev => ({
      ...prev,
      name,
      bio,
      location
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-indigo-500" />
            <span>Account & Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your custom profile, security integrations, and themes.</p>
        </div>

        <AnimatePresence>
          {savedSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-4.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Check className="w-4 h-4" /> 
              <span>Changes Saved!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Settings Sidebar Tabs */}
        <div className="glass-card p-2 rounded-3xl md:col-span-1 space-y-1 h-fit bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? Moon : Sun }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all text-left cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <tab.icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>

        {/* Right Settings Content Form with AnimatePresence Transitions */}
        <div className="md:col-span-3 glass-card p-6.5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm">
          
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.form 
                key="profile-settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSave} 
                className="space-y-5"
              >
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit']">Edit Profile Details</h3>
                  <p className="text-[11px] text-slate-400">Update your public representation on Nexus.</p>
                </div>
                
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Bio / Description</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Creator Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer self-start"
                >
                  Save Preferences
                </motion.button>
              </motion.form>
            )}

            {activeTab === 'privacy' && (
              <motion.div 
                key="privacy-settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit']">Privacy & Security</h3>
                  <p className="text-[11px] text-slate-400">Configure public boundaries and secure login integrations.</p>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="pr-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Public Profile Visibility</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Allow non-friends to view your design portfolio and listed assets.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={publicProfile}
                    onChange={() => setPublicProfile(!publicProfile)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between py-5 border-b border-slate-100 dark:border-slate-800/60 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                  <div className="pr-4">
                    <h4 className="font-extrabold text-xs sm:text-sm text-indigo-500 flex items-center gap-1.5 font-['Outfit']">
                      <Shield className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
                      <span>Lock Personal Profile</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                      Secure your profile! If enabled, only accepted friends can visit your profile details, bio, or full posts. Non-friends will see a locked screen.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isProfileLocked}
                    onChange={(e) => handleToggleProfileLock(e.target.checked)}
                    className="w-5.5 h-5.5 accent-indigo-600 rounded cursor-pointer shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="pr-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Receive dynamic secure tokens on your mobile device during account login.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={() => setTwoFactor(!twoFactor)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications-settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit']">Notification Preferences</h3>
                  <p className="text-[11px] text-slate-400">Choose when and how Nexus reaches you.</p>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div className="pr-4">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Email Digest & Alerts</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Receive curated summaries of unread messages, comments, and trending assets.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={() => setEmailAlerts(!emailAlerts)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer shrink-0"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div 
                key="appearance-settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit']">Theme Preferences</h3>
                  <p className="text-[11px] text-slate-400">Toggle dark obsidian and bright modes.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleTheme}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-indigo-400" /> 
                    <span>Dark Obsidian</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleTheme}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 font-extrabold text-xs transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-amber-500" /> 
                    <span>Light Mode</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
