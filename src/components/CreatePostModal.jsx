import React, { useState } from 'react';
import { X, Image as ImageIcon, Smile, Globe, Tag, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CreatePostModal() {
  const { currentUser, isPostModalOpen, setIsPostModalOpen, handleCreatePost } = useApp();
  
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  if (!isPostModalOpen) return null;

  const sampleImages = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    handleCreatePost({ content, image: imageUrl });
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-card bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Create Post
          </h3>
          <button
            onClick={() => setIsPostModalOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6">
          
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{currentUser.name}</h4>
              <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full w-fit mt-0.5">
                <Globe className="w-3 h-3" /> Public
              </div>
            </div>
          </div>

          {/* Text input */}
          <textarea
            rows="4"
            placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-base resize-none mb-4"
            autoFocus
          ></textarea>

          {/* Optional Image Attachment Input */}
          {showImageInput && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Image URL</label>
              <input
                type="url"
                placeholder="Paste image link or choose preset below..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                {sampleImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Sample"
                    onClick={() => setImageUrl(img)}
                    className="w-14 h-14 rounded-lg object-cover cursor-pointer hover:opacity-80 ring-2 ring-indigo-500/50"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative mb-4 rounded-xl overflow-hidden max-h-48">
              <img src={imageUrl} alt="Attached" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Media Actions Toolbar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-6">
            <span className="text-xs font-semibold text-slate-500">Add to your post</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                title="Attach photo"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                title="Feeling / Activity"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                title="Tag friends"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Post Action Button */}
          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
          >
            Publish Post
          </button>

        </form>

      </div>
    </div>
  );
}
