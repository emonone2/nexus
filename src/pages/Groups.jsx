import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Sparkles, 
  X, 
  ArrowLeft, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Globe, 
  Lock, 
  Check, 
  UserPlus,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';
import { Link } from 'react-router-dom';

export default function Groups() {
  const { 
    currentUser,
    groupsList, 
    handleCreateGroup, 
    handleToggleJoinGroup 
  } = useApp();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Group Details View
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPostText, setNewPostText] = useState('');
  const [localGroupPosts, setLocalGroupPosts] = useState({});

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Tech & Code');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const categories = ['all', 'Tech & Code', 'UI/UX Design', 'Outdoors', 'Gaming'];

  // Initialize group posts fallback
  useEffect(() => {
    // Generate initial posts if not already loaded
    const initialPosts = {
      'group_1': [
        {
          id: 'gp_1',
          authorName: 'Elena Rostova',
          authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
          authorId: 'user_elena_rostova',
          content: 'Is anyone else experimenting with React 19 Server Actions in combination with Vite? Finding some really clean architectural patterns for real-time form mutations!',
          likes: 24,
          isLiked: false,
          time: '3 hours ago',
          replies: [
            { authorName: 'Alex Rivers', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', text: 'Yes! Combined with Vite server middlewares, it is blazing fast.' }
          ]
        },
        {
          id: 'gp_2',
          authorName: 'Alex Rivers',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
          authorId: 'user_alex_rivers',
          content: 'Just launched a new minimal blog theme template in the creator store. High SEO scoring, configured with React 19, Vite, and Tailwind v4. Feedback welcome!',
          likes: 12,
          isLiked: false,
          time: '5 hours ago',
          replies: []
        }
      ],
      'group_2': [
        {
          id: 'gp_3',
          authorName: 'Sarah Connor',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
          authorId: 'user_sarah_connor',
          content: 'Auto Layout wraps are literally a lifesaver for flex responsive grids in Figma. What are your favorite spacing tokens and variable systems to keep things clean?',
          likes: 42,
          isLiked: false,
          time: '1 day ago',
          replies: []
        }
      ],
      'group_3': [
        {
          id: 'gp_4',
          authorName: 'Marcus Vance',
          authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
          authorId: 'user_marcus_vance',
          content: 'Starting my thru-hike next month! Gear list is completely finalized and base weight is 11.5 lbs. Anyone else hitting the trails northbound this season?',
          likes: 19,
          isLiked: false,
          time: '2 days ago',
          replies: []
        }
      ],
      'group_4': [
        {
          id: 'gp_5',
          authorName: 'Elena Rostova',
          authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
          authorId: 'user_elena_rostova',
          content: 'Restored an old retro custom Galaga cabinet this weekend! Replaced the CRT monitor with a modern zero-latency LCD panel. Plays like a dream.',
          likes: 31,
          isLiked: false,
          time: '4 hours ago',
          replies: []
        }
      ]
    };

    const stored = localStorage.getItem('nexus_group_posts');
    if (stored) {
      try {
        setLocalGroupPosts(JSON.parse(stored));
      } catch {
        setLocalGroupPosts(initialPosts);
      }
    } else {
      setLocalGroupPosts(initialPosts);
      localStorage.setItem('nexus_group_posts', JSON.stringify(initialPosts));
    }
  }, []);

  const filteredGroups = groupsList.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && g.category === activeCategory;
  });

  const onSubmitNewGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    handleCreateGroup({
      name: newGroupName,
      category: newGroupCat,
      description: newGroupDesc
    });
    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreateModal(false);
  };

  const handlePostInCommunity = (e) => {
    e.preventDefault();
    if (!newPostText.trim() || !selectedGroup) return;

    const newPost = {
      id: `local_gp_${Date.now()}`,
      authorName: currentUser.name || 'User',
      authorAvatar: currentUser.avatar || 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff',
      authorId: currentUser.id,
      content: newPostText.trim(),
      likes: 0,
      isLiked: false,
      time: 'Just now',
      replies: []
    };

    const updatedPosts = {
      ...localGroupPosts,
      [selectedGroup.id]: [newPost, ...(localGroupPosts[selectedGroup.id] || [])]
    };

    setLocalGroupPosts(updatedPosts);
    localStorage.setItem('nexus_group_posts', JSON.stringify(updatedPosts));
    setNewPostText('');
  };

  const handleLikeGroupPost = (postId) => {
    if (!selectedGroup) return;
    
    const updatedList = (localGroupPosts[selectedGroup.id] || []).map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1
        };
      }
      return p;
    });

    const updatedPosts = {
      ...localGroupPosts,
      [selectedGroup.id]: updatedList
    };

    setLocalGroupPosts(updatedPosts);
    localStorage.setItem('nexus_group_posts', JSON.stringify(updatedPosts));
  };

  const activeGroupPosts = selectedGroup ? (localGroupPosts[selectedGroup.id] || []) : [];

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      
      <AnimatePresence mode="wait">
        {!selectedGroup ? (
          <motion.div
            key="groups-list-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            {/* Header Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
                  <Users className="w-8 h-8 text-indigo-500" />
                  <span>Communities & Groups</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Join discussions, share passion projects, and collaborate with teams.</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreateModal(true)}
                className="px-4.5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Create Community</span>
              </motion.button>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize shrink-0 transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Groups' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Groups Grid with smooth staggered animation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  onSelect={(g) => setSelectedGroup(g)} 
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="group-details-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xs sm:text-sm font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Communities</span>
            </button>

            {/* Interactive Community Header Card */}
            <div className="glass-card rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-[#0F1122] shadow-xl">
              <div className="h-44 md:h-56 relative bg-slate-900 overflow-hidden">
                <img src={selectedGroup.cover} alt={selectedGroup.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-4 right-4 px-3 py-1 bg-slate-950/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
                  {selectedGroup.isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{selectedGroup.isPrivate ? 'Private' : 'Public'}</span>
                </div>
              </div>

              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
                <div className="space-y-2 max-w-2xl">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20 inline-block">
                    {selectedGroup.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] tracking-tight">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {selectedGroup.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <strong>{selectedGroup.members}</strong> members
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span>{selectedGroup.postsPerDay || '10+'} posts per day</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleToggleJoinGroup(selectedGroup.id)}
                  className={`px-6 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap self-start ${
                    selectedGroup.isJoined
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {selectedGroup.isJoined ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Joined Community</span>
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

            {/* Discussion Feed Column & Write Post Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Write Community Post */}
                {selectedGroup.isJoined ? (
                  <form onSubmit={handlePostInCommunity} className="glass-card p-5 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
                    <div className="flex gap-3">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                      <textarea
                        rows="2"
                        required
                        placeholder={`Post an update in ${selectedGroup.name}...`}
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-xs sm:text-sm font-medium pt-1 resize-none"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Community Discussion Feed</span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-center space-y-2">
                    <Lock className="w-8 h-8 text-indigo-400 mx-auto" />
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Join to participate</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">This community is public, but you must join to compose updates and interact with discussions.</p>
                  </div>
                )}

                {/* Community Feed Posts */}
                <div className="space-y-4">
                  {activeGroupPosts.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No posts yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Be the first to share your thoughts in this community feed!</p>
                    </div>
                  ) : (
                    activeGroupPosts.map(post => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={post.id}
                        className="glass-card p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Link to={post.authorId === currentUser.id ? "/profile" : `/profile/${post.authorId}`} className="block">
                              <img src={post.authorAvatar} alt={post.authorName} className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/15" />
                            </Link>
                            <div>
                              <Link to={post.authorId === currentUser.id ? "/profile" : `/profile/${post.authorId}`}>
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors leading-snug">{post.authorName}</h4>
                              </Link>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{post.time}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-5 pt-3 border-t border-slate-100 dark:border-slate-800/50 text-xs font-semibold text-slate-400">
                          <button
                            onClick={() => handleLikeGroupPost(post.id)}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${post.isLiked ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-slate-600 dark:hover:text-slate-300'}`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>

                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.replies?.length || 0} replies</span>
                          </span>
                        </div>

                        {/* Thread Replies */}
                        {post.replies && post.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 pt-2">
                            {post.replies.map((reply, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start">
                                <img src={reply.authorAvatar} alt={reply.authorName} className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-500/10" />
                                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 p-2.5 rounded-xl flex-1 text-xs">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{reply.authorName}</span>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Side Panels */}
              <div className="space-y-6">
                
                {/* About Box */}
                <div className="glass-card p-5.5 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>About Community</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    This community brings together users around a shared interest. Participate in weekly discussion threads, share your creative resources, and stay inspired!
                  </p>
                  <div className="text-[10px] text-slate-400 font-extrabold space-y-1.5 uppercase tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <div>Type: <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedGroup.isPrivate ? 'Private Group' : 'Open Public'}</span></div>
                    <div>Category: <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedGroup.category}</span></div>
                    <div>Active: <span className="text-emerald-500 font-bold">Excellent Health</span></div>
                  </div>
                </div>

                {/* Team Admins */}
                <div className="glass-card p-5.5 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Community Admins</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Elena Rostova', role: 'Creator & Moderator', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', id: 'user_elena_rostova' },
                      { name: 'Alex Rivers', role: 'Tech Advisor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', id: 'user_alex_rivers' }
                    ].map((admin, idx) => (
                      <Link to={`/profile/${admin.id}`} key={idx} className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                        <img src={admin.avatar} alt={admin.name} className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/10" />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors leading-tight truncate">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{admin.role}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Community Modal with AnimatePresence */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 relative z-10 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> 
                  <span>Create New Community</span>
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={onSubmitNewGroup} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Group Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js Builders"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={newGroupCat}
                    onChange={(e) => setNewGroupCat(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="Tech & Code">Tech & Code</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Outdoors">Outdoors</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Briefly describe what your community is about..."
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  ></textarea>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 hover:bg-indigo-500 cursor-pointer"
                  >
                    Publish Group
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
