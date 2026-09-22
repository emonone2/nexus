import React from 'react';
import { Users, Globe, Lock, Check, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function GroupCard({ group }) {
  const { handleToggleJoinGroup } = useApp();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-200/50 dark:border-slate-800/40 group bg-white dark:bg-slate-900/40"
    >
      
      {/* Cover Image */}
      <div className="h-36 relative bg-slate-900 overflow-hidden">
        <img
          src={group.cover}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
          {group.isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{group.isPrivate ? 'Private' : 'Public'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Zero-pill Category tag */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
              {group.category}
            </span>
          </div>

          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-1.5 group-hover:text-indigo-500 transition-colors font-['Outfit'] leading-snug">
            {group.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {group.description}
          </p>
        </div>

        <div>
          {/* Unboxed Stats separated with dot */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-3 border-t border-slate-100 dark:border-slate-800/80 mb-4 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
              <Users className="w-4 h-4 text-indigo-500" /> 
              <span>{group.members.toLocaleString()} members</span>
            </span>
            <span>{group.postsPerDay || '10+'} posts/day</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => handleToggleJoinGroup(group.id)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
              group.isJoined
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
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
          </motion.button>
        </div>

      </div>

    </motion.div>
  );
}
