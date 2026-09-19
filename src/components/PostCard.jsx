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
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5 mb-5 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Header: Author details & post options */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-500 cursor-pointer transition-colors">
                {post.author.name}
              </h4>
              {post.author.verified && (
                <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>@{post.author.handle}</span>
              <span>•</span>
              <span>{post.time}</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Text Content */}
      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed mb-3 whitespace-pre-line">
        {post.content}
      </p>

      {/* Media Attachment Image */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-200/50 dark:border-slate-800">
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      )}

      {/* Reactions & Stats Bar */}
      <div className="flex items-center justify-between pt-2 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-[10px]">
            ❤️
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{post.likes} likes</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowComments(!showComments)} 
            className="hover:underline hover:text-slate-600 dark:hover:text-slate-300"
          >
            {post.comments.length} comments
          </button>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        
        {/* Like Button */}
        <button
          onClick={() => handleLikePost(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            post.isLiked
              ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isLiked ? 'fill-current animate-bounce' : ''}`} />
          <span>Like</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all relative"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Share</span>
            </>
          )}
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => handleBookmarkPost(post.id)}
          className={`p-2 rounded-xl text-xs sm:text-sm transition-all ${
            post.isBookmarked
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          title="Save post"
        >
          <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-300">
          
          {/* Add Comment Input */}
          <form onSubmit={onSubmitComment} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Comment items */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pt-1">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 items-start">
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-7 h-7 rounded-full object-cover mt-0.5"
                />
                <div className="flex-1 bg-slate-100 dark:bg-slate-800/70 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-slate-400">{comment.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </article>
  );
}
