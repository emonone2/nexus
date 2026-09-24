import React, { useState } from 'react';
import { X, Image as ImageIcon, Smile, Globe, Tag, Sparkles, SmilePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { askGemini } from '../lib/geminiService';

export default function CreatePostModal() {
  const { currentUser, isPostModalOpen, setIsPostModalOpen, handleCreatePost } = useApp();
  
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiError, setAiError] = useState('');

  // Mood and Gradient Background States
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const gradients = [
    { name: 'Plain Text', class: '' },
    { name: 'Sunset Glow', class: 'from-indigo-600 via-purple-600 to-pink-500' },
    { name: 'Ocean Breeze', class: 'from-cyan-500 to-blue-600' },
    { name: 'Cosmic Dark', class: 'from-[#0F2027] via-[#203A43] to-[#2C5364]' },
    { name: 'Emerald Forest', class: 'from-emerald-500 to-teal-700' },
    { name: 'Warm Coral', class: 'from-orange-500 to-rose-500' }
  ];

  const moods = [
    'Excited 😊', 'Happy 😄', 'Learning 🚀', 'Chilling 🍹', 'Coding 💻', 'Hiking 🏔️', 'Coffee ☕', 'Gaming 🎮'
  ];

  const handleAiEnhance = async () => {
    try {
      setAiEnhancing(true);
      setAiError('');
      
      let prompt = content.trim();
      let systemInstruction = "";
      
      if (!prompt) {
        prompt = "Write a short, engaging, and professional social post about coding, design, or modern lifestyle. Keep it under 100 words, include relevant emojis and 2-3 hashtags.";
        systemInstruction = "You are a professional social media creator. Write a short, highly engaging, creative post in English.";
      } else {
        systemInstruction = "You are an expert social media proofreader and enhancer. Keep the user's core message but make it more catchy, professional, grammatically polished, add 2-3 fun emojis and 2-3 relevant hashtags.";
      }
      
      const result = await askGemini(prompt, systemInstruction);
      if (result) {
        setContent(result);
      }
    } catch (err) {
      console.error(err);
      setAiError('Failed to generate. Try again.');
    } finally {
      setAiEnhancing(false);
    }
  };

  const sampleImages = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Serialize Mood and Gradients into content using prefix format if selected
    let finalContent = content.trim();
    if (selectedMood || selectedGradient) {
      const prefix = {
        mood: selectedMood || null,
        gradient: selectedGradient || null
      };
      finalContent = `${JSON.stringify(prefix)} | ${content.trim()}`;
    }

    handleCreatePost({ content: finalContent, image: selectedGradient ? '' : imageUrl });
    
    // Reset form states
    setContent('');
    setImageUrl('');
    setSelectedMood('');
    setSelectedGradient('');
    setShowImageInput(false);
    setShowMoodSelector(false);
    setIsPostModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPostModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg glass-card bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden relative z-10 text-slate-900 dark:text-white"
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>Create Post</span>
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={onSubmit} className="p-6">
              
              {/* Author Row */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/25"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-['Outfit']">{currentUser.name}</h4>
                      {selectedMood && (
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40 text-[9px] font-extrabold rounded uppercase tracking-wider">
                          {selectedMood}
                        </span>
                      )}
                    </div>
                    
                    {/* Zero-pill unboxed layout for privacy status */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" /> 
                      <span>Public Feed</span>
                    </div>
                  </div>
                </div>

                {/* Clear selectors button */}
                {(selectedMood || selectedGradient) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMood('');
                      setSelectedGradient('');
                    }}
                    className="text-[10px] text-indigo-500 font-bold uppercase hover:underline"
                  >
                    Clear Styling
                  </button>
                )}
              </div>

              {/* Text Input Block with FB-style background card toggle */}
              {selectedGradient ? (
                <div className={`w-full rounded-2xl bg-gradient-to-tr ${selectedGradient} flex items-center justify-center p-6 min-h-[160px] shadow-inner mb-4 transition-all duration-300 relative`}>
                  <textarea
                    rows="3"
                    placeholder="Write a colorful, bold card status update..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent border-none text-white placeholder-white/70 focus:outline-none focus:ring-0 text-base sm:text-lg font-extrabold text-center resize-none leading-relaxed select-text"
                    autoFocus
                  />
                </div>
              ) : (
                <textarea
                  rows="4"
                  placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-sm sm:text-base resize-none mb-1 font-semibold"
                  autoFocus
                />
              )}

              {/* Facebook-style Background Gradients Selector Row */}
              <div className="mb-4 px-1">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Compose Card Gradient</span>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {gradients.map((grad, idx) => (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedGradient(grad.class);
                        if (grad.class) setImageUrl(''); // Disable images if gradient card is active
                      }}
                      className={`w-8 h-8 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedGradient === grad.class ? 'border-indigo-500 ring-2 ring-indigo-500/25 scale-105' : 'border-slate-200 dark:border-slate-800'
                      } ${grad.class ? `bg-gradient-to-tr ${grad.class}` : 'bg-slate-100 dark:bg-slate-800'}`}
                      title={grad.name}
                    />
                  ))}
                </div>
              </div>

              {/* AI Assistant Generator Bar */}
              <div className="flex justify-between items-center mb-4 px-1">
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={aiEnhancing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {aiEnhancing ? "AI Enhancing..." : content.trim() ? "✨ AI Enhance / Beautify" : "✨ AI Generate Post"}
                </button>
                {aiError && <span className="text-[10px] text-red-500 font-bold">{aiError}</span>}
              </div>

              {/* Mood Selector Block */}
              <AnimatePresence>
                {showMoodSelector && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden"
                  >
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">How are you feeling right now?</span>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedMood(m);
                            setShowMoodSelector(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedMood === m 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expandable Image preset and selector inputs */}
              <AnimatePresence>
                {showImageInput && !selectedGradient && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden"
                  >
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Image Address URL</label>
                    <input
                      type="url"
                      placeholder="Paste any Unsplash image link or tap a preset below..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <div className="flex gap-2.5">
                      {sampleImages.map((img, idx) => (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={idx}
                          src={img}
                          alt="Sample Preset"
                          onClick={() => setImageUrl(img)}
                          className={`w-14 h-14 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border-2 ${
                            imageUrl === img ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Image Attachment Preview */}
              {imageUrl && !selectedGradient && (
                <div className="relative mb-5 rounded-2xl overflow-hidden max-h-48 border border-slate-200/40 dark:border-slate-800/40 bg-slate-100 dark:bg-slate-950">
                  <img src={imageUrl} alt="Post Attachment Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-3.5 right-3.5 p-1.5 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Dynamic attachments toolbar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800/30">
                <span className="text-xs font-bold text-slate-400">Add visuals to your post</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedGradient) {
                        alert("Gradients cards cannot have image attachments.");
                        return;
                      }
                      setShowImageInput(!showImageInput);
                    }}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      showImageInput ? 'bg-indigo-500/10 text-indigo-500' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                    title="Attach preset photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMoodSelector(!showMoodSelector)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      showMoodSelector ? 'bg-indigo-500/10 text-indigo-500' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    }`}
                    title="Feeling / Activity"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMoodSelector(!showMoodSelector)}
                    className="p-2 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-xl transition-colors cursor-pointer"
                    title="Feeling status"
                  >
                    <SmilePlus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Post Action Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!content.trim()}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Publish Post
              </motion.button>

            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
