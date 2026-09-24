import React, { useState, useEffect } from 'react';
import { Plus, Image, Smile, Video, Sparkles, Flame, Users, Clock, Lightbulb, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import CreateStoryModal from '../components/CreateStoryModal';
import { askGemini } from '../lib/geminiService';

export default function Home() {
  const { 
    currentUser, 
    stories, 
    posts, 
    setIsPostModalOpen, 
    setPrefilledPostContent,
    searchQuery,
    setActiveStory,
    friendsList,
    isStoryModalOpen,
    setIsStoryModalOpen
  } = useApp();

  const navigate = useNavigate();

  const [aiIdeas, setAiIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [ideasError, setAiError] = useState('');

  const generateIdeas = async () => {
    try {
      setLoadingIdeas(true);
      setAiError('');
      const prompt = "Provide exactly 3 short, super trendy, catchy social media post ideas or captions (one about technology/web design/learning, one about morning motivation/inspiration, and one funny/creative/lifestyle caption with emojis and hashtags). Format each idea on a new line starting with '1.', '2.', and '3.' respectively. Do not write any other introductory or concluding text, just the 3 formatted ideas.";
      const result = await askGemini(prompt, "You are a professional social media creative director and trend spotter. You write ultra-high engaging posts with perfect grammar, cool emojis, and trendy hashtags.");
      if (result) {
        const parsed = result
          .split('\n')
          .map(line => line.replace(/^\d+[\.\s\-]+/, '').trim())
          .filter(line => line.length > 10)
          .slice(0, 3);
        setAiIdeas(parsed);
      }
    } catch (err) {
      console.error(err);
      setAiError('Failed to generate post ideas. Please try again.');
    } finally {
      setLoadingIdeas(false);
    }
  };

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
            onClick={() => setIsStoryModalOpen(true)}
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

      {/* Active Friends Horizontal Slider (Facebook style) */}
      {friendsList && friendsList.filter(f => f.online).length > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1.5">
            <h5 className="font-extrabold text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span>Active Friends</span>
            </h5>
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {friendsList.filter(f => f.online).length} Active
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-4.5 min-w-max px-1">
              {friendsList.filter(f => f.online).map((friend) => (
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  key={friend.id}
                  onClick={() => navigate(`/chat?userId=${friend.id}`)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer relative group text-center"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar || null}
                      alt={friend.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 shadow-md group-hover:scale-105 transition-all"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center shadow-md">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 max-w-[65px] truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    {friend.name.split(' ')[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* AI Creativity Hub Widget */}
      <div className="glass-card rounded-3xl p-5 mb-6 border border-indigo-500/10 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5 bg-gradient-to-tr from-white to-indigo-50/10 dark:from-slate-900/40 dark:to-indigo-950/10">
        <div className="flex items-center justify-between gap-3 mb-4.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-1.5">
                <span>AI Creativity Hub</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-[8px] font-extrabold uppercase tracking-widest rounded-full scale-95">Gemini Companion</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Stuck on what to share? Let Gemini write for you!</p>
            </div>
          </div>

          <button
            onClick={generateIdeas}
            disabled={loadingIdeas}
            className="text-[11px] font-extrabold text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {loadingIdeas ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{aiIdeas.length > 0 ? "Generate New" : "Try Now"}</span>
          </button>
        </div>

        {ideasError && (
          <div className="text-xs text-rose-500 font-bold bg-rose-500/5 border border-rose-500/10 rounded-xl p-2.5 text-center mt-2.5">
            {ideasError}
          </div>
        )}

        {aiIdeas.length === 0 && !loadingIdeas ? (
          <div className="p-4.5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-3">
              Generate 3 trendsetting, custom social media post ideas and templates in one tap!
            </p>
            <button
              onClick={generateIdeas}
              className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-500/10 hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <Lightbulb className="w-4 h-4 fill-current" />
              <span>💡 Suggest 3 Post Captions</span>
            </button>
          </div>
        ) : loadingIdeas ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2.5">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase animate-pulse">Gemini is brainstorming ideas...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiIdeas.map((idea, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={() => {
                  setPrefilledPostContent(idea);
                  setIsPostModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/20 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 border border-slate-100 dark:border-slate-800/40 hover:border-indigo-500/25 transition-all cursor-pointer flex gap-3 text-left items-start group shadow-inner"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 text-xs font-extrabold flex items-center justify-center border border-indigo-500/15 shrink-0 select-none group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold pr-2 select-all">
                    "{idea}"
                  </p>
                  <div className="mt-2 text-[10px] text-indigo-500 group-hover:text-indigo-600 font-extrabold uppercase tracking-wider flex items-center gap-1 select-none">
                    <span>✨ Tap to use this caption template</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
      <CreateStoryModal />

    </div>
  );
}
