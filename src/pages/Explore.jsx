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
  Check
} from 'lucide-react';
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
      bg: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      tag: '#webdesign'
    },
    {
      id: 'r2',
      title: 'Yosemite sunset timelapse shot on 4K cinematic camera 🏔️',
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Compass className="w-8 h-8 text-indigo-500" />
            Explore & Discover
          </h1>
          <p className="text-sm text-slate-400">Discover trending video reels, topics, and top creators.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Explore topics, reels, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Trending Hashtags Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pr-2">
          <Flame className="w-4 h-4 text-amber-400" /> Trending:
        </span>
        {tags.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setSearchQuery(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
              searchQuery === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'reels', label: 'Trending Reels', icon: Video },
          { id: 'creators', label: 'Top Creators', icon: UserCheck },
          { id: 'articles', label: 'Articles & Insights', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* View Content */}
      {activeTab === 'reels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveStory({ user: reel.creator, avatar: reel.avatar, bg: reel.bg })}
              className="h-80 rounded-2xl relative overflow-hidden glass-card group cursor-pointer border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between p-3"
            >
              <img
                src={reel.bg}
                alt={reel.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/20" />

              {/* Play Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-slate-950/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                  <Play className="w-3 h-3 text-indigo-400 fill-current" /> Reel
                </span>
                <span className="text-[11px] font-bold text-indigo-300">{reel.tag}</span>
              </div>

              {/* Footer info */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <img src={reel.avatar} alt={reel.creator} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50" />
                  <span className="text-xs font-bold text-white">{reel.creator}</span>
                </div>

                <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug">
                  {reel.title}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-1">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-indigo-400" /> {reel.views}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-400" /> {reel.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {creators.map((c, idx) => {
            const isFollowing = followedCreators.includes(c.name);
            return (
              <div key={idx} className="glass-card p-6 rounded-3xl text-center space-y-3">
                <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-3xl object-cover mx-auto ring-4 ring-indigo-500/30" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit']">{c.name}</h3>
                  <p className="text-xs text-slate-400">{c.role}</p>
                </div>
                <p className="text-xs font-bold text-indigo-500">{c.followers} followers</p>
                <button
                  onClick={() => handleFollowCreator(c.name)}
                  className={`w-full py-2 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1 ${
                    isFollowing
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
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
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row gap-4">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80" alt="Article" className="w-full sm:w-48 h-32 rounded-xl object-cover" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">AI Architecture</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-['Outfit'] mb-1">Building Responsive AI Interfaces in 2026</h3>
                <p className="text-xs text-slate-400 line-clamp-2">A comprehensive deep dive into generative design tokens and layout math.</p>
              </div>
              <span className="text-[11px] text-slate-400 mt-2">5 min read · Published 3 hours ago</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
