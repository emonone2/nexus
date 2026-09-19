import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  Home,
  Users,
  MessageSquare,
  User,
  Search,
  Sun,
  Moon,
  Bell,
  PlusCircle,
  LogOut,
  Sparkles,
  CheckCheck,
  Settings,
  Compass
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const {
    currentUser,
    notifications,
    setIsPostModalOpen,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);

  const navigate = useNavigate();

  const displayNotifications =
    liveNotifications.length > 0 ? liveNotifications : notifications;

  const unreadNotifCount = displayNotifications.filter(
    (n) => n.unread
  ).length;

  // Load real notifications from Supabase and keep them realtime.
  useEffect(() => {
    if (!currentUser?.id) return;

    let mounted = true;

    const formatTime = (value) => {
      if (!value) return '';
      return new Date(value).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    };

    const loadNotifications = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('notifications')
          .select('id, user_id, type, reference_id, is_read, created_at')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(30);

        if (error) throw error;

        const mapped = [];

        for (const row of rows || []) {
          let user = 'Someone';
          let text = 'You have a new notification.';
          let avatar =
            'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff';

          if (row.type === 'message' && row.reference_id) {
            const { data: message } = await supabase
              .from('messages')
              .select('id, sender_id, content')
              .eq('id', row.reference_id)
              .maybeSingle();

            if (message?.sender_id) {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, username, profile_image')
                .eq('id', message.sender_id)
                .maybeSingle();

              user =
                senderProfile?.full_name ||
                senderProfile?.username ||
                'Someone';

              avatar =
                senderProfile?.profile_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=6366f1&color=fff`;

              text = message.content
                ? `sent you a message: "${message.content.slice(0, 70)}${message.content.length > 70 ? '...' : ''}"`
                : 'sent you a new message.';
            }
          } else if (
            row.type === 'friend_request' &&
            row.reference_id
          ) {
            const { data: request } = await supabase
              .from('friend_requests')
              .select('sender_id')
              .eq('id', row.reference_id)
              .maybeSingle();

            if (request?.sender_id) {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, username, profile_image')
                .eq('id', request.sender_id)
                .maybeSingle();

              user =
                senderProfile?.full_name ||
                senderProfile?.username ||
                'Someone';

              avatar =
                senderProfile?.profile_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=6366f1&color=fff`;

              text = 'sent you a friend request.';
            }
          }

          mapped.push({
            ...row,
            user,
            text,
            avatar,
            time: formatTime(row.created_at),
            unread: !row.is_read,
          });
        }

        if (mounted) setLiveNotifications(mapped);
      } catch (error) {
        console.error('Load notifications error:', error);
      }
    };

    loadNotifications();

    const poll = setInterval(loadNotifications, 3000);

    const channel = supabase
      .channel(`navbar-notifications-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          const row = payload.new;

          let user = 'Someone';
          let text = 'You have a new notification.';
          let avatar =
            'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff';

          if (row.type === 'message' && row.reference_id) {
            const { data: message } = await supabase
              .from('messages')
              .select('sender_id, content')
              .eq('id', row.reference_id)
              .maybeSingle();

            if (message?.sender_id) {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, username, profile_image')
                .eq('id', message.sender_id)
                .maybeSingle();

              user =
                senderProfile?.full_name ||
                senderProfile?.username ||
                'Someone';

              avatar =
                senderProfile?.profile_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=6366f1&color=fff`;

              text = message.content
                ? `sent you a message: "${message.content.slice(0, 70)}${message.content.length > 70 ? '...' : ''}"`
                : 'sent you a new message.';
            }
          } else if (
            row.type === 'friend_request' &&
            row.reference_id
          ) {
            const { data: request } = await supabase
              .from('friend_requests')
              .select('sender_id')
              .eq('id', row.reference_id)
              .maybeSingle();

            if (request?.sender_id) {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, username, profile_image')
                .eq('id', request.sender_id)
                .maybeSingle();

              user =
                senderProfile?.full_name ||
                senderProfile?.username ||
                'Someone';

              avatar =
                senderProfile?.profile_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=6366f1&color=fff`;

              text = 'sent you a friend request.';
            }
          }

          if (mounted) {
            setLiveNotifications((previous) => [
              {
                ...row,
                user,
                text,
                avatar,
                time: formatTime(row.created_at),
                unread: true,
              },
              ...previous,
            ].slice(0, 30));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    setIsSigningOut(true);

    try {
      if (supabase && supabase.auth) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.log('Signout local fallback');
    }

    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 glass-nav transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo & Search */}
          <div className="flex items-center gap-4 lg:gap-8">

            <NavLink
              to="/"
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>

              <span className="font-['Outfit'] font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent hidden sm:inline-block">
                Nexus
              </span>
            </NavLink>

            {/* Search Input */}
            <div className="relative max-w-xs w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>

              <input
                type="text"
                placeholder="Search Nexus, posts, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-full text-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">

            {/* Home */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-10 sm:w-14 sm:h-11 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
              title="Home Feed"
            >
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            </NavLink>

            {/* Explore */}
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-10 sm:w-14 sm:h-11 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
              title="Explore Reels"
            >
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </NavLink>

            {/* Friends */}
            <NavLink
              to="/friends"
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-10 sm:w-14 sm:h-11 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
              title="Friends & Requests"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </NavLink>

            {/* Chat */}
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-10 sm:w-14 sm:h-11 rounded-xl font-medium transition-all relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
              title="Messenger Chat"
            >
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-indigo-500"></span>
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-10 sm:w-14 sm:h-11 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
              title="My Profile"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Create Post */}
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Post</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">

              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />

                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-card bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">

                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      Notifications
                    </h3>

                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/notifications');
                      }}
                      className="text-xs text-indigo-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      View All
                    </button>

                  </div>

                  <div className="max-h-80 overflow-y-auto py-1">

                    {displayNotifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                    displayNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          setShowNotifications(false);

                          if (!n.is_read && n.id) {
                            await supabase
                              .from('notifications')
                              .update({ is_read: true })
                              .eq('id', n.id)
                              .eq('user_id', currentUser.id);

                            setLiveNotifications((previous) =>
                              previous.map((item) =>
                                item.id === n.id
                                  ? { ...item, unread: false, is_read: true }
                                  : item
                              )
                            );
                          }

                          if (n.type === 'message') {
                            navigate('/chat');
                          } else {
                            navigate('/notifications');
                          }
                        }}
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 cursor-pointer transition-colors ${
                          n.unread
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                            : ''
                        }`}
                      >

                        <img
                          src={n.avatar}
                          alt={n.user}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                        />

                        <div className="flex-1 min-w-0">

                          <p className="text-xs text-slate-800 dark:text-slate-200">
                            <span className="font-semibold">
                              {n.user}
                            </span>{' '}
                            {n.text}
                          </p>

                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            {n.time}
                          </span>

                        </div>
                      </div>
                    ))
                    )}

                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">

              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-card bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">

                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {currentUser.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      @{currentUser.handle}
                    </p>

                  </div>

                  <div className="py-1">

                    {/* View Profile */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-indigo-500" />
                      View Profile
                    </button>

                    {/* Settings */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-violet-500" />
                      Settings
                    </button>

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-2"
                    >
                      <LogOut className="w-4 h-4" />

                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </button>

                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </header>
  );
}