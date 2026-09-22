import React, { useState, useEffect } from 'react';
import { Plus, Image, Smile, Video, Sparkles, Flame, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

export default function Home() {
  const { 
    currentUser, 
    stories, 
    posts, 
    setIsPostModalOpen, 
    searchQuery,
    setActiveStory
  } = useApp();

  const [activeTab, setActiveTab] = useState('all');
  const [friendIds, setFriendIds] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchFriends = async () => {
      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('sender_id, receiver_id')
          .eq('status', 'accepted')
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

        if (error) throw error;

        const ids = (data || []).map(r => 
          r.sender_id === currentUser.id ? r.receiver_id : r.sender_id
        );
        setFriendIds(ids);
      } catch (err) {
        console.error('Error fetching friends for Home Feed:', err);
      }
    };

    fetchFriends();
  }, [currentUser?.id, posts]);

  const filteredPosts = (() => {
    let list = [...posts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.content?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q) ||
        p.author?.handle?.toLowerCase().includes(q)
      );
    }

    // Active tab filter
    if (activeTab === 'following' && currentUser?.id) {
      list = list.filter(p => 
        p.userId === currentUser.id || 
        friendIds.includes(p.userId)
      );
    } else if (activeTab === 'trending') {
      list.sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.comments?.length || 0) * 2;
        const scoreB = (b.likes || 0) + (b.comments?.length || 0) * 2;
        return scoreB - scoreA;
      });
    }

    return list;
  })();

  return (
    <div className="max-w-2xl mx-auto pb-12">
      
      {/* 1. Story Highlights Reel (No-Scrollbar Horizontal carousel) */}
      <div className="mb-6 overflow-x-auto no-scrollbar py-2 px-1">
        <div className="flex gap-3 min-w-max">
          
          {/* Add Story Card */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPostModalOpen(true)}
            className="w-28 h-44 rounded-3xl relative overflow-hidden group cursor-pointer border border-slate-200/60 dark:border-slate-800/60 glass-card flex flex-col justify-between p-3.5 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900/40"
          >
            <img
              src={currentUser.avatar}
              alt="Your avatar"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 dark:opacity-45 select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 self-end">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Plus className="w-5 h-5" />
              </span>
            </div>
            <div className="relative z-10 bg-black/50 backdrop-blur-md p-1.5 rounded-xl text-center border border-white/10">
              <p className="text-[10px] font-extrabold text-white uppercase tracking-wider">Add Story</p>
            </div>
          </motion.div>

          {/* Friend Story Cards */}
          {stories.filter(s => !s.isUser).map(story => (
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="w-28 h-44 rounded-3xl relative overflow-hidden group cursor-pointer border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={story.bg}
                alt={story.user}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
              
              {/* Avatar Ring */}
              <div className="relative z-10 p-2">
                <div className={`w-9 h-9 rounded-xl p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-indigo-500 to-pink-500 ring-2 ring-indigo-500/20' : 'bg-slate-700/60'}`}>
                  <img
                    src={story.avatar}
                    alt={story.user}
                    className="w-full h-full rounded-[10px] object-cover"
                  />
                </div>
              </div>

              <div className="relative z-10 p-2.5 mt-auto">
                <p className="text-[11px] font-extrabold text-white truncate drop-shadow-md font-['Outfit']">
                  {story.user}
                </p>
              </div>
            </motion.div>
          ))}

        </div>
      </div>

      {/* 2. Create Post Input Trigger Box */}
      <div className="glass-card rounded-3xl p-5 mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40">
        <div className="flex items-center gap-3.5 mb-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/25"
          />
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex-1 text-left px-5 py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-2xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors font-medium border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 cursor-pointer"
          >
            What's on your mind, {currentUser.name.split(' ')[0]}?
          </button>
        </div>

        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/60 px-1 text-xs font-bold text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-2 hover:text-emerald-500 transition-colors cursor-pointer"
          >
            <Image className="w-4 h-4 text-emerald-500" />
            <span>Photo / Video</span>
          </button>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-2 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4 text-rose-500" />
            <span>Live Stream</span>
          </button>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <Smile className="w-4 h-4 text-amber-500" />
            <span>Feeling / Activity</span>
          </button>
        </div>
      </div>

      {/* 3. Feed Navigation Filter Tabs */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> All Feed
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'following'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Following
          </button>

          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trending'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending
          </button>
        </div>
      </div>

      {/* 4. Posts List Container with Entrance Layout Animations */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 glass-card rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40"
          >
            <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No posts match your filters or search query.</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for other words or creating a post yourself.</p>
          </motion.div>
        )}
      </div>

      {/* Post Creator Modal Layer */}
      <CreatePostModal />

    </div>
  );
}
