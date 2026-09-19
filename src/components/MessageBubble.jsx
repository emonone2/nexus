import React from 'react';
import { CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, userAvatar }) {
  const isMe = message.sender === 'me';

  return (
    <div className={`flex gap-3 mb-4 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
      
      {!isMe && (
        <img
          src={userAvatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover mb-1 ring-1 ring-slate-200 dark:ring-slate-700"
        />
      )}

      <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${
            isMe
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-none'
          }`}
        >
          {message.text}
        </div>

        <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span>{message.time}</span>
          {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />}
        </div>
      </div>

    </div>
  );
}
