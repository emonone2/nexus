import React, { useState } from 'react';
import { Bookmark, FolderPlus, Trash2, Sparkles } from 'lucide-react';
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Bookmark className="w-8 h-8 text-indigo-500 fill-indigo-500/20" />
            Saved & Bookmarks
          </h1>
          <p className="text-sm text-slate-400">Organize your saved posts, articles, and media into collections.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <FolderPlus className="w-4 h-4 text-indigo-500" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collection Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {collectionsList.map((col) => (
          <button
            key={col.id}
            onClick={() => setActiveCollection(col.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeCollection === col.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{col.label}</span>
          </button>
        ))}
      </div>

      {/* Bookmarked Items Feed */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => (
            <div key={post.id} className="relative group">
              <PostCard post={post} />
              <button
                onClick={() => handleBookmarkPost(post.id)}
                className="absolute top-4 right-14 p-2 bg-slate-900/80 text-rose-400 rounded-full hover:bg-slate-900 shadow-md transition-all opacity-0 group-hover:opacity-100"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-16 glass-card rounded-3xl space-y-3">
            <Bookmark className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">No Saved Posts Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Click the bookmark icon on any post in your feed to save it here for later.
            </p>
          </div>
        )}
      </div>

      {/* New Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> New Collection Folder
            </h3>
            <p className="text-xs text-slate-400 mb-4">Create a folder to group your saved bookmarks.</p>

            <form onSubmit={onSubmitNewCollection} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g. 3D Inspiration"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
