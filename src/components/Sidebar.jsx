import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  User, 
  Bookmark, 
  Compass, 
  ShoppingBag, 
  TrendingUp,
  Settings,
  Bell,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentUser } = useApp();

  const mainLinks = [
    { label: 'Home Feed', icon: Home, path: '/', color: 'text-indigo-500' },
    { label: 'Explore & Reels', icon: Compass, path: '/explore', color: 'text-cyan-500' },
    { label: 'Friends & Network', icon: Users, path: '/friends', color: 'text-violet-500' },
    { label: 'Messenger Chat', icon: MessageSquare, path: '/chat', color: 'text-pink-500' },
    { label: 'Communities', icon: Layers, path: '/groups', color: 'text-amber-500' },
    { label: 'Marketplace', icon: ShoppingBag, path: '/marketplace', color: 'text-emerald-500' },
  ];

  const secondaryLinks = [
    { label: 'Saved Bookmarks', icon: Bookmark, path: '/saved', badge: '8' },
    { label: 'Notifications', icon: Bell, path: '/notifications', badge: '3' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const trendingTags = [
    { tag: '#reactjs', posts: '42.8k posts' },
    { tag: '#glassmorphism', posts: '18.2k posts' },
    { tag: '#webdesign', posts: '95.4k posts' },
    { tag: '#ai_future', posts: '120k posts' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pr-2">
      
      {/* User Profile Summary Card */}
      <NavLink
        to="/profile"
        className="glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-indigo-500/50 transition-all duration-300 mb-6 group block"
      >
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-slate-900 flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-500 transition-colors">
            {currentUser.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{currentUser.handle}</p>
        </div>
      </NavLink>

      {/* Main Navigation Group */}
      <div className="mb-6">
        <h5 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Navigation
        </h5>
        <div className="space-y-1">
          {mainLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Shortcuts Group */}
      <div className="mb-6">
        <h5 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Shortcuts
        </h5>
        <div className="space-y-1">
          {secondaryLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-slate-400" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Trending Topics Widget */}
      <div className="glass-card p-4 rounded-2xl mb-6">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>Trending Hashtags</span>
        </div>
        <div className="space-y-2.5">
          {trendingTags.map((item, idx) => (
            <NavLink key={idx} to="/explore" className="block cursor-pointer group">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">
                {item.tag}
              </p>
              <p className="text-xs text-slate-400">{item.posts}</p>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 text-xs text-slate-400 space-y-1">
        <p>© 2026 Nexus Social UI</p>
        <p className="flex gap-2">
          <a href="#" className="hover:underline">Privacy</a> · 
          <a href="#" className="hover:underline">Terms</a> · 
          <a href="#" className="hover:underline">Cookies</a>
        </p>
      </div>

    </aside>
  );
}
