import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, FileText, Palette, Send, ArrowRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function CreateStoryModal() {
  const { isStoryModalOpen, setIsStoryModalOpen, handleCreateStory, currentUser } = useApp();

  const [storyType, setStoryType] = useState('text'); // 'text' or 'image'
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-indigo-600 via-purple-600 to-pink-500');

  const presetGradients = [
    { name: 'Sunset Aura', class: 'from-indigo-600 via-purple-600 to-pink-500' },
    { name: 'Cyan Spark', class: 'from-cyan-500 via-teal-500 to-blue-600' },
    { name: 'Cosmic Sky', class: 'from-[#0F2027] via-[#203A43] to-[#2C5364]' },
    { name: 'Peach Coral', class: 'from-orange-500 via-amber-400 to-rose-500' },
    { name: 'Emerald Wave', class: 'from-emerald-500 via-teal-600 to-indigo-700' }
  ];

  const presetImages = [
    { name: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=900&q=80' },
    { name: 'Scenic Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&h=900&q=80' },
    { name: 'Retro Neon', url: 'https://images.unsplash.com/photo-1507799279861-4dd421887fb3?auto=format&fit=crop&w=600&h=900&q=80' },
    { name: 'Aesthetic Light', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&h=900&q=80' }
  ];

  const handlePublish = (e) => {
    e.preventDefault();

    let finalBg = '';
    if (storyType === 'image') {
      finalBg = imageUrl.trim() || presetImages[0].url;
    } else {
      // If text story, generate a beautiful text background or use dynamic gradient API image
      const cleanText = encodeURIComponent(text.trim() || 'My Story');
      finalBg = `https://singlecolorimage.com/get/4f46e5/400x600`; // safe fallback
      // Create a canvas-based data URL or premium gradient background
      finalBg = `https://ui-avatars.com/api/?name=${cleanText}&background=4f46e5&color=fff&size=512&length=20&bold=true`;
    }

    // Call context handler to save story & trigger mock views
    handleCreateStory(storyType === 'image' ? (imageUrl.trim() || presetImages[0].url) : null, text.trim());

    // Reset Form
    setText('');
    setImageUrl('');
    setStoryType('text');
    setIsStoryModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsStoryModalOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden relative z-10 text-slate-950 dark:text-white"
          >
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2 font-['Outfit']">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <span>Create Story</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Disappears automatically in 24 hours</p>
              </div>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector tabs */}
            <div className="p-6 pb-2 grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setStoryType('text')}
                className={`py-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer select-none ${storyType === 'text' ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/15' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
              >
                <Palette className="w-4 h-4" />
                <span>Text Story</span>
              </button>

              <button
                type="button"
                onClick={() => setStoryType('image')}
                className={`py-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer select-none ${storyType === 'image' ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/15' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo Story</span>
              </button>
            </div>

            {/* Form & Preview Area */}
            <form onSubmit={handlePublish} className="p-6 pt-2.5 space-y-5">
              {storyType === 'text' ? (
                // Text Story Fields
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Write something</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="What is on your mind today?"
                      maxLength={100}
                      rows={3}
                      className="w-full p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    />
                    <div className="text-right text-[10px] text-slate-400 font-bold mt-1">
                      {text.length}/100 chars
                    </div>
                  </div>

                  {/* Preset Gradients Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Choose Background Gradient</label>
                    <div className="flex gap-2 flex-wrap">
                      {presetGradients.map((grad, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSelectedGradient(grad.class)}
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${grad.class} cursor-pointer hover:scale-105 transition-transform shrink-0 border-2 ${selectedGradient === grad.class ? 'border-indigo-600 ring-2 ring-indigo-500/25' : 'border-transparent'}`}
                          title={grad.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER */}
                  <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-3 bg-slate-50 dark:bg-slate-950/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Story Preview</p>
                    <div className={`w-full h-44 rounded-2xl bg-gradient-to-tr ${selectedGradient} flex items-center justify-center p-4 text-center shadow-inner relative overflow-hidden`}>
                      <p className="text-white text-sm font-extrabold font-['Outfit'] leading-relaxed drop-shadow-md whitespace-pre-wrap max-w-full truncate-3-lines">
                        {text.trim() || 'Your story text goes here...'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Photo Story Fields
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Custom Photo URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Preset Background Photos */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Or Choose a Beautiful Photo</label>
                    <div className="grid grid-cols-4 gap-2">
                      {presetImages.map((img, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setImageUrl(img.url)}
                          className="h-14 rounded-xl overflow-hidden relative cursor-pointer hover:opacity-90 transition shadow-sm group border-2 border-transparent focus:border-indigo-600"
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/10" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PHOTO PREVIEW */}
                  <div className="border border-slate-100 dark:border-slate-800 rounded-3xl p-3 bg-slate-50 dark:bg-slate-950/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Story Preview</p>
                    <div className="w-full h-44 rounded-2xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <img
                        src={imageUrl.trim() || presetImages[0].url}
                        alt="Story preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                      {text.trim() && (
                        <p className="absolute bottom-4 left-4 right-4 text-white text-xs font-extrabold drop-shadow truncate-2-lines">
                          {text.trim()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Overlay Caption (Optional)</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Add overlay text to photo..."
                      maxLength={50}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold text-xs sm:text-sm transition cursor-pointer select-none"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 hover:shadow-lg transition cursor-pointer select-none"
                >
                  <Send className="w-4.5 h-4.5" />
                  <span>Share to Story</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
