import React, { useState } from 'react';
import { Plus, Image, Smile, Video, Sparkles, Flame, Users, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function Home() {
  const { 
    currentUser, 
    stories, 
    posts, 
    setIsPostModalOpen, 
    searchQuery 
  } = useApp();

  const [activeTab, setActiveTab] = useState('all');

  const filteredPosts = posts.filter(p => {
    if (searchQuery.trim()) {
      return (
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto pb-12">
      
      {/* 1. Story Highlights Reel */}
      <div className="mb-6 overflow-x-auto no-scrollbar py-2 px-1">
        <div className="flex gap-3 min-w-max">
          
          {/* Add Story Card */}
          <div
            onClick={() => setIsPostModalOpen(true)}
            className="w-28 h-44 rounded-2xl relative overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 glass-card flex flex-col justify-between p-2 shadow-sm hover:shadow-md transition-all"
          >
            <img
              src={currentUser.avatar}
              alt="Your avatar"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 dark:opacity-40"
            />
            <div className="relative z-10 self-end p-1">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Plus className="w-5 h-5" />
              </span>
            </div>
            <div className="relative z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl text-center">
              <p className="text-xs font-bold text-white">Create Story</p>
            </div>
          </div>

          {/* Friend Story Cards */}
          {stories.filter(s => !s.isUser).map(story => (
            <div
              key={story.id}
              className="w-28 h-44 rounded-2xl relative overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={story.bg}
                alt={story.user}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
              
              {/* Avatar ring */}
              <div className="relative z-10 p-2">
                <div className={`w-9 h-9 rounded-full p-0.5 ${story.hasUnseen ? 'story-gradient ring-2 ring-indigo-500' : 'bg-slate-700'}`}>
                  <img
                    src={story.avatar}
                    alt={story.user}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              <div className="relative z-10 p-2.5 mt-auto">
                <p className="text-xs font-bold text-white truncate drop-shadow-md">
                  {story.user}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* 2. Create Post Input Trigger Box */}
      <div className="glass-card rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex-1 text-left px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-full text-sm text-slate-500 dark:text-slate-400 transition-colors"
          >
            What's on your mind, {currentUser.name.split(' ')[0]}?
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
          >
            <Image className="w-4 h-4 text-emerald-500" />
            <span>Photo / Video</span>
          </button>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-2 hover:text-rose-500 transition-colors"
          >
            <Video className="w-4 h-4 text-rose-500" />
            <span>Live Stream</span>
          </button>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-2 hover:text-amber-500 transition-colors"
          >
            <Smile className="w-4 h-4 text-amber-500" />
            <span>Feeling / Activity</span>
          </button>
        </div>
      </div>

      {/* 3. Feed Navigation Filter Tabs */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> All Feed
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'following'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Following
          </button>

          <button
            onClick={() => setActiveTab('trending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trending'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Trending
          </button>
        </div>
      </div>

      {/* 4. Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-12 glass-card rounded-2xl">
            <p className="text-slate-400 text-sm">No posts found matching your search query.</p>
          </div>
        )}
      </div>

      {/* Create Post Modal Component */}
      <CreatePostModal />

    </div>
  );
}
