import React, { useState } from 'react';
import { Users, Plus, Search, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';

export default function Groups() {
  const { groupsList, handleCreateGroup } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Tech & Code');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const categories = ['all', 'Tech & Code', 'UI/UX Design', 'Outdoors', 'Gaming'];

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

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      
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
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

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
              className="w-full max-w-md glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 relative z-10"
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
