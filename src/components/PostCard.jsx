import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Check, 
  Send,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { askGemini } from '../lib/geminiService';

export default function PostCard({ post }) {
  const { handleLikePost, handleBookmarkPost, handleAddComment, currentUser } = useApp();
  
  const isMe = post.userId === currentUser?.id || post.userId === 'me';
  const profilePath = post.userId ? (isMe ? '/profile' : `/profile/${post.userId}`) : '#';
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Floating Heart Particle Reactions State
  const [heartBursts, setHeartBursts] = useState([]);

  // AI Translation & Explanation states
  const [aiResult, setAiResult] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAiOptions, setShowAiOptions] = useState(false);

  // Parse Serialized Mood & Background Gradients
  let postText = post.content;
  let postMood = null;
  let postGradient = null;

  if (post.content && post.content.trim().startsWith('{') && post.content.includes('|')) {
    try {
      const parts = post.content.split('|');
      const prefix = JSON.parse(parts[0].trim());
      postText = parts.slice(1).join('|').trim();
      postMood = prefix.mood;
      postGradient = prefix.gradient;
    } catch (e) {
      // Fallback to normal text content on parse error
    }
  }

  const onSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    handleAddComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const handleShare = () => {
    setCopiedShare(true);
    navigator.clipboard?.writeText?.(`${window.location.origin}/profile/${post.author.handle}`);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const onLikeClick = () => {
    if (!post.isLiked) {
      // Trigger a beautiful burst of floating heart particles
      const bursts = Array.from({ length: 8 }).map((_, i) => ({
        id: `heart_burst_${Date.now()}_${i}`,
        x: Math.random() * 100 - 50, // random offset left/right
        y: -Math.random() * 40 - 10, // random upward speed start
        scale: Math.random() * 0.4 + 0.8,
        delay: i * 0.04
      }));
      setHeartBursts(bursts);
      setTimeout(() => setHeartBursts([]), 1600);
    }
    handleLikePost(post.id);
  };

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-3xl p-5 sm:p-6 mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/40 hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900/40"
    >
      
      {/* Header: Author details & post options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={profilePath} className="relative group block shrink-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={profilePath}>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-500 cursor-pointer transition-colors font-['Outfit'] leading-tight">
                  {post.author.name}
                </h4>
              </Link>
              {post.author.verified && (
                <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
              )}
              
              {/* Mood Pill */}
              {postMood && (
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40 text-[9px] font-extrabold rounded uppercase tracking-wider">
                  {postMood}
                </span>
              )}
            </div>
            
            {/* Zero-Pill unboxed clean metadata */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 font-semibold mt-0.5">
              <span>@{post.author.handle}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>{post.time}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Text Content / Facebook-style Gradient */}
      {postGradient ? (
        <div className={`w-full rounded-3xl bg-gradient-to-tr ${postGradient} flex items-center justify-center py-16 px-6 mb-4.5 shadow-md relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-base sm:text-lg font-extrabold text-white text-center drop-shadow-md leading-relaxed z-10 font-['Outfit'] select-text">
            {postText}
          </p>
        </div>
      ) : (
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line font-medium">
          {postText}
        </p>
      )}

      {/* Media Attachment Image */}
      {post.image && !postGradient && (
        <div className="rounded-2xl overflow-hidden mb-4 bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 relative group">
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-[480px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      )}

      {/* AI Translate / Explain Result Panel */}
      {aiResult && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 relative"
        >
          <button 
            onClick={() => setAiResult('')}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 flex items-center justify-center text-[10px] font-bold transition cursor-pointer"
          >
            ✕
          </button>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-['Outfit'] uppercase tracking-wider flex items-center gap-1">
              ✨ Gemini AI Translation / Summary
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
            {aiResult}
          </p>
        </motion.div>
      )}

      {/* AI Translate & Options dropdown trigger */}
      {postText && (
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            onClick={() => setShowAiOptions(!showAiOptions)}
            className="text-[10px] sm:text-xs font-extrabold text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 transition-all cursor-pointer select-none"
          >
            <span>✨ AI Translate & Explain</span>
          </button>

          {showAiOptions && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-850 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm"
            >
              <button
                disabled={loadingAi}
                onClick={async () => {
                  try {
                    setLoadingAi(true);
                    setShowAiOptions(false);
                    const prompt = `Translate the following social media post text into pure, conversational, standard Bengali. Do not write any other explanation or text, just the Bengali translation: "${postText}"`;
                    const res = await askGemini(prompt, "You are a professional English-to-Bengali translator.");
                    setAiResult(res);
                  } catch (e) {
                    setAiResult("Translation failed. Try again.");
                  } finally {
                    setLoadingAi(false);
                  }
                }}
                className="px-2 py-1 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 transition-all uppercase cursor-pointer"
              >
                🇧🇩 Bengali
              </button>
              <span className="text-slate-200 dark:text-slate-700">|</span>
              <button
                disabled={loadingAi}
                onClick={async () => {
                  try {
                    setLoadingAi(true);
                    setShowAiOptions(false);
                    const prompt = `Translate the following social media post text into pure, natural, fluent English. Do not write any other explanation or text, just the English translation: "${postText}"`;
                    const res = await askGemini(prompt, "You are a professional Bengali-to-English translator.");
                    setAiResult(res);
                  } catch (e) {
                    setAiResult("Translation failed. Try again.");
                  } finally {
                    setLoadingAi(false);
                  }
                }}
                className="px-2 py-1 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 transition-all uppercase cursor-pointer"
              >
                🇺🇸 English
              </button>
              <span className="text-slate-200 dark:text-slate-700">|</span>
              <button
                disabled={loadingAi}
                onClick={async () => {
                  try {
                    setLoadingAi(true);
                    setShowAiOptions(false);
                    const prompt = `Explain the hidden context, humor, technical jargon, or summarize this post in a single brief, witty and engaging sentence: "${postText}"`;
                    const res = await askGemini(prompt, "You are a clever, witty social media assistant who explains tech, coding, design, and general posts with flair.");
                    setAiResult(res);
                  } catch (e) {
                    setAiResult("Explanation failed. Try again.");
                  } finally {
                    setLoadingAi(false);
                  }
                }}
                className="px-2 py-1 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 transition-all uppercase cursor-pointer"
              >
                💡 Explain
              </button>
            </motion.div>
          )}

          {loadingAi && (
            <span className="text-[10px] font-extrabold text-indigo-500 animate-pulse uppercase tracking-wider">
              Gemini translating...
            </span>
          )}
        </div>
      )}

      {/* Reactions & Stats Bar */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-400 font-semibold">
        <div className="flex items-center gap-2">
          <motion.span 
            animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
            className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white text-[10px]"
          >
            ❤️
          </motion.span>
          <span className="font-extrabold text-slate-700 dark:text-slate-300">{post.likes} Likes</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowComments(!showComments)} 
            className="hover:text-indigo-500 transition-colors font-extrabold"
          >
            {post.comments.length} Comments
          </button>
          <span>{post.shares} Shares</span>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="flex items-center justify-between pt-3 gap-1 relative">
        
        {/* Floating Heart Reaction Bursts */}
        <AnimatePresence>
          {heartBursts.map((hb) => (
            <motion.span
              key={hb.id}
              initial={{ opacity: 1, y: 0, scale: 0, x: 0 }}
              animate={{ opacity: 0, y: -140, scale: hb.scale, x: hb.x }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: hb.delay }}
              className="absolute pointer-events-none text-red-500 z-50 text-xl font-bold"
              style={{ left: '16%' }}
            >
              ❤️
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onLikeClick}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            post.isLiked
              ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 shadow-inner border border-pink-500/10'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${post.isLiked ? 'fill-current text-pink-500 scale-110' : ''}`} />
          <span>Like</span>
        </motion.button>

        {/* Comment Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer ${
            showComments ? 'bg-slate-100 dark:bg-slate-800' : ''
          }`}
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          <span>Comment</span>
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            copiedShare
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          {copiedShare ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />}
          <span>{copiedShare ? 'Copied' : 'Share'}</span>
        </motion.button>

        {/* Bookmark Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleBookmarkPost(post.id)}
          className={`px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
            post.isBookmarked
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          title="Bookmark Post"
        >
          <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Expandable Comments Drawer Area */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-4.5 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4"
          >
            {/* Comments List Grid */}
            <div className="space-y-3.5 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {post.comments.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold text-center uppercase tracking-wider py-4">Be the first to comment on this thread</p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start">
                    <Link to={comment.userId === currentUser?.id ? '/profile' : `/profile/${comment.userId}`}>
                      <img
                        src={comment.avatar || null}
                        alt={comment.author}
                        className="w-8.5 h-8.5 rounded-xl object-cover ring-2 ring-indigo-500/10 shrink-0"
                      />
                    </Link>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Link to={comment.userId === currentUser?.id ? '/profile' : `/profile/${comment.userId}`}>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors">{comment.author}</span>
                        </Link>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{comment.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Compose Reply Form */}
            <form onSubmit={onSubmitComment} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Write a sweet response..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-500/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.article>
  );
}
