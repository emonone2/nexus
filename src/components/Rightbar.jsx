import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, UserPlus, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Rightbar() {
  const { 
    friendsList, 
    friendRequests, 
    handleAcceptRequest, 
    handleDeclineRequest,
    setActiveChatId 
  } = useApp();
  
  const navigate = useNavigate();

  const handleOpenChat = (friendId) => {
    navigate(`/chat?userId=${friendId}`);
  };

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pl-2 pr-1 pb-6 no-scrollbar">
      
      {/* Friend Requests Widget */}
      <AnimatePresence>
        {friendRequests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-4 rounded-3xl mb-6 border border-indigo-500/20 bg-white dark:bg-slate-900/40 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-500" />
                <span>Friend Requests</span>
              </h5>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-500 text-white">
                {friendRequests.length}
              </span>
            </div>

            <div className="space-y-3">
              {friendRequests.map((req) => (
                <motion.div 
                  layout
                  key={req.id} 
                  className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/40"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img
                      onClick={() => req.senderId && navigate(`/profile/${req.senderId}`)}
                      src={req.avatar || null}
                      alt={req.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/10 cursor-pointer hover:opacity-85 transition-opacity"
                    />
                    <div className="min-w-0 flex-1">
                      <h6 
                        onClick={() => req.senderId && navigate(`/profile/${req.senderId}`)}
                        className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-500 transition-colors"
                      >
                        {req.name}
                      </h6>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{req.mutuals} mutual friends</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptRequest(req.id)}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeclineRequest(req.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Contacts Widget */}
      <div className="glass-card p-4.5 rounded-3xl mb-6 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Active Contacts</span>
          </h5>
          <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
            {friendsList.filter(f => f.online).length} online
          </span>
        </div>

        <div className="space-y-1">
          {friendsList.map((friend) => (
            <motion.div
              whileHover={{ x: 2 }}
              key={friend.id}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Link to={friend.id === 'me' ? '/profile' : `/profile/${friend.id}`} className="relative shrink-0 block">
                  <img
                    src={friend.avatar || null}
                    alt={friend.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 hover:scale-105 transition-transform"
                  />
                  {friend.online ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-400 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link to={friend.id === 'me' ? '/profile' : `/profile/${friend.id}`}>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors truncate">
                      {friend.name}
                    </p>
                  </Link>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">{friend.role}</p>
                </div>
              </div>

              <button 
                onClick={() => handleOpenChat(friend.id)}
                className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer text-[10px] font-bold"
                title="Send Message"
              >
                Chat
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sponsored Creator Studio Pro Promo Banner */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="p-5 rounded-3xl bg-gradient-to-tr from-[#121626] via-[#1E193C] to-[#121626] text-white shadow-xl relative overflow-hidden group border border-indigo-500/20"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-[10px] uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Nexus Creator Studio</span>
          </div>
          <h4 className="font-extrabold text-sm mb-1 font-['Outfit']">Upgrade to Creator Pro</h4>
          <p className="text-xs text-slate-300 mb-4 leading-normal font-medium">Get verified badges, custom themes, analytics and 4K media uploads.</p>
          <motion.button 
            whileTap={{ scale: 0.96 }}
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 rounded-xl font-bold text-xs shadow-lg shadow-pink-500/10 transition-all cursor-pointer"
          >
            Explore Features
          </motion.button>
        </div>
      </motion.div>

    </aside>
  );
}
