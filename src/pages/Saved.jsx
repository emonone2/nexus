import React, { useState } from 'react';
import { Bookmark, FolderPlus, Trash2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';

export default function Saved() {
  const { posts, handleBookmarkPost, collectionsList, handleCreateCollection } = useApp();
  const [activeCollection, setActiveCollection] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState('');

  const bookmarkedPosts = posts.filter(p => p.isBookmarked);

  const onSubmitNewCollection = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    handleCreateCollection(newColName);
    setNewColName('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Bookmark className="w-8 h-8 text-indigo-500 fill-indigo-500/10" />
            <span>Saved & Bookmarks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Organize your saved posts, inspiration, and designs into folder collections.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4.5 py-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <FolderPlus className="w-4.5 h-4.5 text-indigo-500" />
          <span>New Collection</span>
        </motion.button>
      </div>

      {/* Collection Segment Tabs */}
      <div className="flex gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 overflow-x-auto no-scrollbar py-1">
        {collectionsList.map((col) => (
          <button
            key={col.id}
            onClick={() => setActiveCollection(col.id)}
            className={`px-4.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeCollection === col.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{col.label}</span>
          </button>
        ))}
      </div>

      {/* Bookmarked Items Feed */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <AnimatePresence mode="popLayout">
          {bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map((post) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={post.id} 
                className="relative group"
              >
                <PostCard post={post} />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleBookmarkPost(post.id)}
                  className="absolute top-4 right-14 p-2.5 bg-slate-900/90 hover:bg-red-600 text-red-400 hover:text-white rounded-xl shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/5"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card rounded-[32px] space-y-3 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40"
            >
              <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">No saved bookmarks yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                Click the bookmark badge on any creative post in your home feed to organize it inside your folders here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Collection Modal */}
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

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 relative z-10"
            >
              <div className="flex items-center justify-between mb-4.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> 
                  <span>New Collection Folder</span>
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={onSubmitNewCollection} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Collection Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 3D Design Inspiration"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
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
                    Create Folder
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
