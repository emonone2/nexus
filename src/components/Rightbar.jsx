import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Check, X, Circle, Sparkles } from 'lucide-react';
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

  const handleOpenChat = (friendName) => {
    setActiveChatId('c1');
    navigate('/chat');
  };

  return (
    <aside className="w-80 flex-shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pl-2">
      
      {/* Friend Requests Widget */}
      {friendRequests.length > 0 && (
        <div className="glass-card p-4 rounded-2xl mb-6 border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Friend Requests</span>
            </h5>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500 text-white">
              {friendRequests.length}
            </span>
          </div>

          <div className="space-y-3">
            {friendRequests.map((req) => (
              <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="min-w-0 flex-1">
                    <h6 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {req.name}
                    </h6>
                    <p className="text-[11px] text-slate-400 truncate">{req.mutuals} mutual friends</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Contacts Widget */}
      <div className="glass-card p-4 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Active Contacts</span>
          </h5>
          <span className="text-xs text-slate-400">
            {friendsList.filter(f => f.online).length} online
          </span>
        </div>

        <div className="space-y-1">
          {friendsList.map((friend) => (
            <button
              key={friend.id}
              onClick={() => handleOpenChat(friend.name)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                  {friend.online ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-400 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors truncate">
                    {friend.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{friend.role}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sponsored Event / Nexus Pro Promo */}
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Nexus Creator Studio</span>
          </div>
          <h4 className="font-bold text-sm mb-1">Upgrade to Creator Pro</h4>
          <p className="text-xs text-slate-300 mb-3">Get verified badges, custom themes, analytics and 4K media uploads.</p>
          <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 rounded-xl font-bold text-xs shadow-lg shadow-pink-500/20 transition-all">
            Explore Features
          </button>
        </div>
      </div>

    </aside>
  );
}
