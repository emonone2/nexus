import React, { useState } from 'react';
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

export default function PostCard({ post }) {
  const { handleLikePost, handleBookmarkPost, handleAddComment } = useApp();
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

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

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-3xl p-5 sm:p-6 mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/40 hover:shadow-lg transition-all duration-300"
    >
      
      {/* Header: Author details & post options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-500 cursor-pointer transition-colors">
                {post.author.name}
              </h4>
              {post.author.verified && (
                <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
              )}
            </div>
            
            {/* Zero-Pill unboxed clean metadata */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
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

      {/* Post Text Content */}
      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed mb-4 whitespace-pre-line font-medium">
        {post.content}
      </p>

      {/* Media Attachment Image */}
      {post.image && (
        <div className="rounded-2xl overflow-hidden mb-4 bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 relative group">
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-[480px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      )}

      {/* Reactions & Stats Bar */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <motion.span 
            animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
            className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white text-[10px]"
          >
            ❤️
          </motion.span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{post.likes} Likes</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowComments(!showComments)} 
            className="hover:text-indigo-500 transition-colors font-semibold"
          >
            {post.comments.length} Comments
          </button>
          <span>{post.shares} Shares</span>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="flex items-center justify-between pt-3 gap-1">
        
        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLikePost(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            post.isLiked
              ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 shadow-inner'
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
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 ${
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 relative"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
              <span>Share</span>
            </>
          )}
        </motion.button>

        {/* Bookmark Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleBookmarkPost(post.id)}
          className={`p-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
            post.isBookmarked
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          title="Save post"
        >
          <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isBookmarked ? 'fill-current text-indigo-500' : ''}`} />
        </motion.button>
      </div>

      {/* Expandable Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              
              {/* Add Comment Input */}
              <form onSubmit={onSubmitComment} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Write a supportive comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-40 hover:from-indigo-500 hover:to-violet-500 transition-colors shadow-sm shadow-indigo-500/10"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>

              {/* Comment items */}
              <div className="space-y-3 max-h-64 overflow-y-auto pt-1 pr-1">
                {post.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No comments yet. Be the first to start the conversation!</p>
                ) : (
                  post.comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-8 h-8 rounded-full object-cover mt-0.5 ring-2 ring-indigo-500/10"
                      />
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 p-3.5 rounded-2xl rounded-tl-none">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {comment.author}
                          </span>
                          <span className="text-[10px] text-slate-400">{comment.time}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.article>
  );
}
