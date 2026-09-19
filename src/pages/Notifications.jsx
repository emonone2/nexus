import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Notifications() {
  const { notifications, handleMarkAllNotificationsRead, handleMarkNotificationRead } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'likes') return n.text.includes('liked');
    if (activeTab === 'comments') return n.text.includes('commented');
    if (activeTab === 'requests') return n.text.includes('friend request');
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Bell className="w-8 h-8 text-indigo-500" />
            Notifications Center
          </h1>
          <p className="text-sm text-slate-400">Stay updated on likes, comments, mentions, and requests.</p>
        </div>

        <button
          onClick={handleMarkAllNotificationsRead}
          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Activity', icon: Bell },
          { id: 'likes', label: 'Likes', icon: Heart },
          { id: 'comments', label: 'Comments', icon: MessageSquare },
          { id: 'requests', label: 'Requests', icon: UserPlus }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Notifications Stream */}
      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkNotificationRead(n.id)}
              className={`p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                n.unread ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="relative">
                <img src={n.avatar} alt={n.user} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-slate-900">
                  {n.text.includes('liked') ? '❤️' : '💬'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{n.user}</span> {n.text}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block font-medium">{n.time}</span>
              </div>

              {n.unread && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications in this category.
          </div>
        )}
      </div>

    </div>
  );
}
