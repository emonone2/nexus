import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play, Heart, Send, Eye, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StoryViewerModal() {
  const { activeStory, setActiveStory, storyViews, recordStoryView, currentUser } = useApp();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

  // Automatically record view when a story is viewed
  useEffect(() => {
    if (activeStory?.id) {
      recordStoryView(activeStory.id);
    }
  }, [activeStory?.id]);

  useEffect(() => {
    if (!activeStory || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, isPlaying, setActiveStory]);

  const handleClose = () => {
    setActiveStory(null);
    setProgress(0);
  };

  if (!activeStory) return null;

  const isOwnStory = activeStory.userId === currentUser?.id;
  const currentStoryViews = storyViews.filter(v => v.storyId === activeStory.id);

  return (
    <AnimatePresence>
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Fader */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
          />

          {/* Main Story Container Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm h-[620px] rounded-[32px] overflow-hidden shadow-2xl bg-slate-950 border border-white/10 flex flex-col justify-between z-10"
          >
            
            {/* Background Story Photo or Gradient */}
            {activeStory.bg ? (
              <img
                src={activeStory.bg}
                alt={activeStory.user}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none animate-fade-in"
              />
            ) : (
              // If there is no background photo, render a stunning gradient background
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 animate-fade-in" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

            {/* Center Story Text Overlay */}
            {activeStory.text && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none z-10">
                <p className="text-white text-base sm:text-lg font-black font-['Outfit'] leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] whitespace-pre-wrap max-w-full">
                  {activeStory.text}
                </p>
              </div>
            )}

            {/* Top Controls Header */}
            <div className="relative z-10 p-5 space-y-4">
              
              {/* Timeline Meter */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Author & Interactions */}
              <div className="flex items-center justify-between">
                <div 
                  onClick={() => {
                    if (activeStory.userId) {
                      handleClose();
                      if (activeStory.userId === currentUser?.id) {
                        navigate('/profile');
                      } else {
                        navigate(`/profile/${activeStory.userId}`);
                      }
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.user}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-white drop-shadow-md font-['Outfit'] group-hover:text-indigo-400 transition-colors">{activeStory.user}</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Active Story</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Side Arrow Navigation Helpers */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setProgress(0)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md cursor-pointer border border-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setActiveStory(null);
                setProgress(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md cursor-pointer border border-white/5"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {/* Bottom reply/viewers panel */}
            {isOwnStory ? (
              /* Bottom Viewers Panel for owner */
              <div className="relative z-10 p-5 bg-black/85 border-t border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Story Views</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                    {currentStoryViews.length} views
                  </span>
                </div>

                <div className="max-h-24 overflow-y-auto no-scrollbar space-y-2">
                  {currentStoryViews.length > 0 ? (
                    currentStoryViews.map((viewer, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 animate-fade-in">
                        <div 
                          onClick={() => {
                            if (viewer.viewerId) {
                              handleClose();
                              if (viewer.viewerId === currentUser?.id) {
                                navigate('/profile');
                              } else {
                                navigate(`/profile/${viewer.viewerId}`);
                              }
                            }
                          }}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <img
                            src={viewer.viewerAvatar}
                            alt={viewer.viewerName}
                            className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="font-extrabold text-white text-xs group-hover:text-indigo-400 transition-colors">{viewer.viewerName}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Viewed</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Waiting for viewers...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Bottom Reply Bar Panel for visitors */
              <div className="relative z-10 p-5 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeStory.user.split(' ')[0]}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4.5 py-3 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full text-xs sm:text-sm text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-gradient-to-tr from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-lg transition-transform cursor-pointer"
                >
                  <Heart className="w-4.5 h-4.5 fill-current" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  disabled={!replyText.trim()}
                  onClick={() => setReplyText('')}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-full shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5" />
                </motion.button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
