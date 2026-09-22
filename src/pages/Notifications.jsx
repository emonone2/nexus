import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  UserPlus,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Notifications() {
  const { notifications, handleMarkAllNotificationsRead, handleMarkNotificationRead } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'likes') return n.text.toLowerCase().includes('liked');
    if (activeTab === 'comments') return n.text.toLowerCase().includes('commented') || n.text.toLowerCase().includes('replied');
    if (activeTab === 'requests') return n.text.toLowerCase().includes('friend request') || n.text.toLowerCase().includes('connect');
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Bell className="w-8 h-8 text-indigo-500" />
            <span>Notifications Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Stay updated on creator likes, comments, mentions, and friend requests.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleMarkAllNotificationsRead}
          className="px-4.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </motion.button>
      </div>

      {/* Segment Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Activity', icon: Bell },
          { id: 'likes', label: 'Likes', icon: Heart },
          { id: 'comments', label: 'Comments', icon: MessageSquare },
          { id: 'requests', label: 'Requests', icon: UserPlus }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10 font-extrabold'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Notifications Stream Container */}
      <div className="glass-card rounded-[32px] overflow-hidden bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          <AnimatePresence mode="popLayout">
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((n) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={n.id}
                  onClick={() => handleMarkNotificationRead(n.id)}
                  className={`p-4.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${
                    n.unread ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  {/* Notification Badge Badge Icon */}
                  <div className="relative">
                    <img src={n.avatar} alt={n.user} className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/10" />
                    <span className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-slate-900 shadow-md">
                      {n.text.toLowerCase().includes('liked') ? '❤️' : '💬'}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-normal font-medium">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit']">@{n.user}</span> {n.text}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block uppercase tracking-wider">{n.time}</span>
                  </div>

                  {/* Pulsing indicator if unread */}
                  {n.unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/40 shrink-0"></span>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-16 text-center text-slate-400"
              >
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No notifications in this category yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
