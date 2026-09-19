import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play, Heart, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StoryViewerModal() {
  const { activeStory, setActiveStory } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

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

  if (!activeStory) return null;

  const handleClose = () => {
    setActiveStory(null);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-300 p-4">
      
      {/* Main Story Container */}
      <div className="relative w-full max-w-sm h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/10 flex flex-col justify-between">
        
        {/* Background Image */}
        <img
          src={activeStory.bg || activeStory.image}
          alt={activeStory.user}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />

        {/* Top Header Controls */}
        <div className="relative z-10 p-4 space-y-3">
          
          {/* Animated Progress Bar */}
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeStory.avatar}
                alt={activeStory.user}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
              />
              <div>
                <h4 className="font-bold text-sm text-white drop-shadow">{activeStory.user}</h4>
                <p className="text-[11px] text-slate-300">Active story</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Touch Areas */}
        <button
          onClick={() => setProgress(0)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-950/40 text-white hover:bg-slate-950/70"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            setActiveStory(null);
            setProgress(0);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-slate-950/40 text-white hover:bg-slate-950/70"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Reply Bar */}
        <div className="relative z-10 p-4 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Reply to ${activeStory.user.split(' ')[0]}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button className="p-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg transition-transform hover:scale-110">
            <Heart className="w-5 h-5 fill-current" />
          </button>
          <button
            disabled={!replyText.trim()}
            onClick={() => setReplyText('')}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-full shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
