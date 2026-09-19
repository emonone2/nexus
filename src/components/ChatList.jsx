import React, { useEffect, useState } from 'react';
import {
  Search,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ChatList({ activeChatId, onSelectChat }) {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const getAvatar = (profile) => {
    if (profile?.profile_image) {
      return profile.profile_image;
    }

    const name =
      profile?.full_name ||
      profile?.username ||
      'User';

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=4f46e5&color=fff&size=256`;
  };

  const formatTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();

    if (Number.isNaN(d.getTime())) return '';

    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setConversations([]);
        return;
      }

      const {
        data: memberships,
        error: memberError,
      } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships?.length) {
        setConversations([]);
        return;
      }

      const conversationIds =
        memberships.map(
          (item) => item.conversation_id
        );

      const {
        data: conversationData,
        error: conversationError,
      } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('created_at', {
          ascending: false,
        });

      if (conversationError) {
        throw conversationError;
      }

      const result = [];

      for (const conversation of conversationData || []) {
        const {
          data: members,
          error: membersError,
        } = await supabase
          .from('conversation_members')
          .select('user_id')
          .eq(
            'conversation_id',
            conversation.id
          );

        if (membersError) {
          console.error(membersError);
          continue;
        }

        const otherMember =
          members?.find(
            (member) =>
              member.user_id !== user.id
          );

        if (!otherMember) continue;

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(
            'id, username, full_name, profile_image'
          )
          .eq(
            'id',
            otherMember.user_id
          )
          .maybeSingle();

        if (profileError) {
          console.error(profileError);
          continue;
        }

        const {
          data: latestMessage,
        } = await supabase
          .from('messages')
          .select(
            'id, content, sender_id, created_at'
          )
          .eq(
            'conversation_id',
            conversation.id
          )
          .order('created_at', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        result.push({
          id: conversation.id,

          user: {
            id:
              profile?.id ||
              otherMember.user_id,

            name:
              profile?.full_name ||
              profile?.username ||
              'User',

            username:
              profile?.username || '',

            avatar:
              getAvatar(profile),

            online: false,
          },

          lastMessage:
            latestMessage?.content ||
            'Start a conversation',

          lastMessageTime:
            latestMessage?.created_at ||
            conversation.created_at,
        });
      }

      result.sort(
        (a, b) =>
          new Date(b.lastMessageTime) -
          new Date(a.lastMessageTime)
      );

      setConversations(result);
    } catch (error) {
      console.error(
        'Error loading conversations:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations =
    conversations.filter(
      (conversation) => {
        const q =
          search.trim().toLowerCase();

        if (!q) return true;

        return (
          conversation.user.name
            .toLowerCase()
            .includes(q) ||
          conversation.user.username
            .toLowerCase()
            .includes(q) ||
          conversation.lastMessage
            .toLowerCase()
            .includes(q)
        );
      }
    );

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">

      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold">
              Messages
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Your conversations
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
            <p className="text-xs">
              Loading chats...
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="h-full flex items-center justify-center p-7 text-center">
            <div>
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-indigo-400" />
              </div>

              <h3 className="font-bold text-slate-200">
                No conversations
              </h3>

              <p className="text-xs text-slate-500 mt-2 max-w-[220px] leading-5">
                Start a conversation with a friend to see it here.
              </p>
            </div>
          </div>
        ) : (
          filteredConversations.map(
            (conversation) => {
              const active =
                activeChatId ===
                conversation.id;

              return (
                <button
                  type="button"
                  key={conversation.id}
                  onClick={() =>
                    onSelectChat(
                      conversation
                    )
                  }
                  className={`w-full px-4 py-3.5 flex items-center gap-3 text-left border-b border-slate-900 transition ${
                    active
                      ? 'bg-indigo-500/10'
                      : 'hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={conversation.user.avatar}
                    alt={conversation.user.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`font-semibold text-sm truncate ${
                          active
                            ? 'text-indigo-300'
                            : 'text-slate-100'
                        }`}
                      >
                        {
                          conversation.user
                            .name
                        }
                      </h3>

                      <span className="text-[10px] text-slate-600 shrink-0">
                        {formatTime(
                          conversation.lastMessageTime
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {
                        conversation.lastMessage
                      }
                    </p>

                    {conversation.user
                      .username && (
                      <p className="text-[10px] text-slate-700 truncate mt-0.5">
                        @
                        {
                          conversation.user
                            .username
                        }
                      </p>
                    )}
                  </div>
                </button>
              );
            }
          )
        )}
      </div>
    </div>
  );
}
