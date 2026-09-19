import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Check, 
  Lock, 
  KeyRound,
  Eye
} from 'lucide-react';
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
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-indigo-500" />
            Account & Settings
          </h1>
          <p className="text-sm text-slate-400">Manage your profile, security, and notification preferences.</p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> Changes Saved!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Settings Sidebar Tabs */}
        <div className="glass-card p-2 rounded-2xl md:col-span-1 space-y-1 h-fit">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? Moon : Sun }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Settings Content Form */}
        <div className="md:col-span-3 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">Edit Profile Details</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all"
              >
                Save Preferences
              </button>
            </form>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">Privacy & Security</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Public Profile Visibility</h4>
                  <p className="text-xs text-slate-400">Allow non-friends to view your public feed posts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={() => setPublicProfile(!publicProfile)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-slate-400">Add an extra layer of security to your account logins.</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={() => setTwoFactor(!twoFactor)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">Notification Preferences</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Email Digest & Alerts</h4>
                  <p className="text-xs text-slate-400">Receive weekly summaries of unread messages and top posts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">Theme Preferences</h3>
              <p className="text-xs text-slate-400">Choose between dark obsidian mode and light mode.</p>
              
              <div className="flex gap-4 pt-2">
                <button
                  onClick={toggleTheme}
                  className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-400'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Moon className="w-5 h-5 text-indigo-400" /> Dark Obsidian
                </button>
                <button
                  onClick={toggleTheme}
                  className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    theme === 'light'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" /> Light Mode
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
