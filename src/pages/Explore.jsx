import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Flame, 
  Play, 
  Eye, 
  Heart, 
  Video,
  FileText,
  UserCheck,
  Check,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Explore() {
  const { setActiveStory, followedCreators, handleFollowCreator } = useApp();
  const [activeTab, setActiveTab] = useState('reels');
  const [searchQuery, setSearchQuery] = useState('');

  const reels = [
    {
      id: 'r1',
      title: 'Building glassmorphic design tokens in 60 seconds 🚀',
      views: '142.5k',
      likes: '18.4k',
      creator: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1555066931-4365d14babc?auto=format&fit=crop&w=600&q=80',
      tag: '#webdesign'
    },
    {
      id: 'r2',
      title: 'Yosemite sunset timelapse shot on cinematic camera 🏔️',
      views: '98.2k',
      likes: '12.1k',
      creator: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80',
      tag: '#nature'
    },
    {
      id: 'r3',
      title: 'Future of Generative AI UI paradigms explained',
      views: '210k',
      likes: '34.9k',
      creator: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      tag: '#ai_future'
    },
    {
      id: 'r4',
      title: 'Setup tour: Minimalist dark aesthetic workspace 🎧',
      views: '76.4k',
      likes: '9.8k',
      creator: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      tag: '#workspace'
    }
  ];

  const creators = [
    { name: 'Elena Rostova', role: 'UI/UX Architect', followers: '124.5k', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { name: 'Marcus Chen', role: 'Outdoor Photographer', followers: '89.2k', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Sarah Jenkins', role: 'AI Researcher', followers: '210k', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' }
  ];

  const tags = ['#ai_future', '#reactjs', '#glassmorphism', '#yosemite', '#cyberpunk', '#minimalism'];

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Compass className="w-8 h-8 text-indigo-500" />
            Explore & Discover
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Discover trending video reels, topics, and top creators.</p>
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Explore topics, reels, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Trending Hashtags Pills (Unboxed, horizontal carousel) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pr-2 shrink-0">
          <Flame className="w-4 h-4 text-amber-500" /> Trending:
        </span>
        {tags.map((t, idx) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={idx}
            onClick={() => setSearchQuery(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              searchQuery === t
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* Segment Filter Tabs */}
      <div className="flex border-b border-slate-200/60 dark:border-slate-800/60">
        {[
          { id: 'reels', label: 'Trending Reels', icon: Video },
          { id: 'creators', label: 'Top Creators', icon: UserCheck },
          { id: 'articles', label: 'Articles & Insights', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all relative cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main View Content Layer */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'reels' && (
            <motion.div 
              key="reels-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
            >
              {reels.map((reel) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  key={reel.id}
                  onClick={() => setActiveStory({ user: reel.creator, avatar: reel.avatar, bg: reel.bg })}
                  className="h-80 rounded-3xl relative overflow-hidden glass-card group cursor-pointer border border-slate-200/50 dark:border-slate-800/40 shadow-md flex flex-col justify-between p-4"
                >
                  <img
                    src={reel.bg}
                    alt={reel.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 pointer-events-none" />

                  {/* Play Indicator Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-extrabold text-white flex items-center gap-1 uppercase tracking-wider">
                      <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" /> Reel
                    </span>
                    <span className="text-[10px] font-bold text-indigo-300 drop-shadow-sm">{reel.tag}</span>
                  </div>

                  {/* Reel Bottom Meta Overlay */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={reel.avatar} alt={reel.creator} className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/30" />
                      <span className="text-xs font-bold text-white font-['Outfit']">{reel.creator}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                      {reel.title}
                    </p>

                    {/* Unboxed metric numbers separated by spaces */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-300 font-bold pt-1 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-indigo-400" /> {reel.views} Views</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/10" /> {reel.likes} Likes</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'creators' && (
            <motion.div 
              key="creators-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {creators.map((c, idx) => {
                const isFollowing = followedCreators.includes(c.name);
                return (
                  <motion.div 
                    whileHover={{ y: -3 }}
                    key={idx} 
                    className="glass-card p-6.5 rounded-[32px] text-center space-y-4 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm"
                  >
                    <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-indigo-500/25 shadow-lg" />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit']">{c.name}</h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">{c.role}</p>
                    </div>
                    <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-wide">{c.followers} followers</p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleFollowCreator(c.name)}
                      className={`w-full py-2.5 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        isFollowing
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Following</span>
                        </>
                      ) : (
                        <span>Follow Creator</span>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div 
              key="articles-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <motion.div 
                whileHover={{ y: -2 }}
                className="glass-card p-5 rounded-[32px] flex flex-col sm:flex-row gap-5 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm"
              >
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&h=300&q=80" alt="Article Cover" className="w-full sm:w-56 h-36 rounded-2xl object-cover border border-slate-200/10" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block mb-1">AI Architecture</span>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 font-['Outfit'] leading-snug mb-1.5 hover:text-indigo-500 cursor-pointer transition-colors">
                      Building Responsive AI Interfaces in 2026
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      A comprehensive deep dive into generative design tokens, dark-mode styling variables, and layout math algorithms for the future web.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider mt-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>5 min read</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span>Published 3 hours ago</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
