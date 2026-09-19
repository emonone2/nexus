import React from 'react';
import { Users, Globe, Lock, Check, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function GroupCard({ group }) {
  const { handleToggleJoinGroup } = useApp();

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-slate-200 dark:border-slate-800 group">
      
      {/* Cover Image */}
      <div className="h-32 relative bg-slate-900 overflow-hidden">
        <img
          src={group.cover}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/70 backdrop-blur-md rounded-full text-[11px] font-bold text-white flex items-center gap-1">
          {group.isPrivate ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
          <span>{group.isPrivate ? 'Private' : 'Public'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
              {group.category}
            </span>
          </div>

          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-500 transition-colors font-['Outfit']">
            {group.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {group.description}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-100 dark:border-slate-800/80 mb-3">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-indigo-500" /> {group.members.toLocaleString()} members
            </span>
            <span>{group.postsPerDay || '10+'} posts/day</span>
          </div>

          <button
            onClick={() => handleToggleJoinGroup(group.id)}
            className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              group.isJoined
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/20'
            }`}
          >
            {group.isJoined ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Joined</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Join Community</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
