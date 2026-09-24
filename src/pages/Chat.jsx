import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  ArrowLeft,
  MessageSquare,
  Loader2,
  RefreshCw,
  Search,
  Plus,
  Mic,
  MicOff,
  PhoneOff,
  X,
  CheckCheck,
  File,
  Download,
  FileText,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';
import useVoiceCall from '../hooks/useVoiceCall';
import { chatWithGemini } from '../lib/geminiService';

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryUserId = searchParams.get('userId');

  const [currentUser, setCurrentUser] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [inputText, setInputText] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [sending, setSending] = useState(false);

  const [showFriends, setShowFriends] = useState(false);
  const [mobileList, setMobileList] = useState(true);

  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null); // { name, type, size, data }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: event.target?.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // =====================================================
  // VOICE CALL
  // =====================================================

  const {
    callState,
    incomingCall,
    remoteUser,
    isMuted,
    callDuration,
    callError,
    remoteAudioRef,
    startVoiceCall,
    acceptIncomingCall,
    rejectIncomingCall,
    toggleMute,
    endCall,
    setCallError,
  } = useVoiceCall(currentUser);

  // =====================================================
  // CURRENT USER
  // =====================================================

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return;
      }

      setCurrentUser(user);
    } catch (err) {
      console.log('Chat fallback mode active');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ALL CHAT DATA
  // =====================================================

  useEffect(() => {
    if (!currentUser) return;

    loadConversations();
    loadFriends();
  }, [currentUser]);

  // Auto-open chat if userId is in URL search parameters
  useEffect(() => {
    if (!currentUser || !queryUserId) return;

    const autoOpen = async () => {
      try {
        // First try to load from Supabase profiles
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', queryUserId)
          .maybeSingle();

        // Fallback to local profiles
        if (!profile) {
          const profilesList = JSON.parse(localStorage.getItem('nexus_db_profiles') || '[]');
          profile = profilesList.find(p => p.id === queryUserId);
        }

        // Fallback to curated mock profiles
        if (!profile) {
          const curatedMock = {
            'user_sarah_connor': { id: 'user_sarah_connor', full_name: 'Sarah Connor', username: 'sarahconnor', profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
            'user_alex_rivers': { id: 'user_alex_rivers', full_name: 'Alex Rivers', username: 'alexrivers', profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
            'user_elena_rostova': { id: 'user_elena_rostova', full_name: 'Elena Rostova', username: 'elenarostova', profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80' },
            'user_marcus_vance': { id: 'user_marcus_vance', full_name: 'Marcus Vance', username: 'marcusvance', profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
            'user_marcus_chen': { id: 'user_marcus_chen', full_name: 'Marcus Chen', username: 'marcuschen', profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
            'user_sarah_jenkins': { id: 'user_sarah_jenkins', full_name: 'Sarah Jenkins', username: 'sarahjenkins', profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
            'user_david_kim': { id: 'user_david_kim', full_name: 'David Kim', username: 'davidkim', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
          };
          profile = curatedMock[queryUserId];
        }

        if (profile) {
          const friend = {
            id: profile.id,
            name: profile.full_name || profile.username || 'User',
            username: profile.username || '',
            avatar: profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.username || 'User')}&background=4f46e5&color=fff&size=256`
          };
          await openFriendChat(friend);
          setSearchParams({});
        }
      } catch (err) {
        console.error('Error auto-opening chat:', err);
      }
    };

    autoOpen();
  }, [currentUser, queryUserId]);

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  const loadConversations = async () => {
    try {
      setLoadingChats(true);

      const { data: memberships, error } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      if (!memberships?.length) {
        setConversations([]);
        return;
      }

      const ids = memberships.map(
        (item) => item.conversation_id
      );

      const { data: chats, error: chatError } =
        await supabase
          .from('conversations')
          .select('*')
          .in('id', ids)
          .order('created_at', {
            ascending: false,
          });

      if (chatError) throw chatError;

      const result = [];

      for (const conversation of chats || []) {
        const { data: members } = await supabase
          .from('conversation_members')
          .select('user_id')
          .eq(
            'conversation_id',
            conversation.id
          );

        const other = members?.find(
          (member) =>
            member.user_id !== currentUser.id
        );

        if (!other) continue;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', other.user_id)
          .maybeSingle();

        const { data: latest } = await supabase
          .from('messages')
          .select('*')
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
            id: profile?.id,
            name:
              profile?.full_name ||
              profile?.username ||
              'User',
            username:
              profile?.username || '',
            avatar:
              profile?.profile_image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                profile?.full_name ||
                  profile?.username ||
                  'User'
              )}&background=2563eb&color=fff`,
          },

          lastMessage:
            latest?.content ||
            'Start a conversation',

          lastMessageTime:
            latest?.created_at ||
            conversation.created_at,
        });
      }

      setConversations(result);

      if (result.length > 0 && !activeChat) {
        setActiveChat(result[0]);
        setMobileList(false);
      }
    } catch (err) {
      console.error(
        'Conversation error:',
        err
      );

      setError(err.message);
    } finally {
      setLoadingChats(false);
    }
  };

  // =====================================================
  // LOAD FRIENDS
  // =====================================================

  const loadFriends = async () => {
    try {
      // Accepted requests where I am sender
      const { data: sent } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', currentUser.id)
        .eq('status', 'accepted');

      // Accepted requests where I am receiver
      const { data: received } = await supabase
        .from('friend_requests')
        .select('sender_id')
        .eq('receiver_id', currentUser.id)
        .eq('status', 'accepted');

      const friendIds = [
        ...(sent || []).map(
          (item) => item.receiver_id
        ),
        ...(received || []).map(
          (item) => item.sender_id
        ),
      ];

      const uniqueIds = [
        ...new Set(friendIds),
      ];

      if (uniqueIds.length === 0) {
        setFriends([]);
        return;
      }

      const { data: profiles, error } =
        await supabase
          .from('profiles')
          .select('*')
          .in('id', uniqueIds);

      if (error) throw error;

      const formatted = (profiles || []).map(
        (profile) => ({
          id: profile.id,

          name:
            profile.full_name ||
            profile.username ||
            'User',

          username:
            profile.username || '',

          avatar:
            profile.profile_image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profile.full_name ||
                profile.username ||
                'User'
            )}&background=2563eb&color=fff`,
        })
      );

      setFriends(formatted);
    } catch (err) {
      console.error(
        'Friends loading error:',
        err
      );
    }
  };

  // =====================================================
  // CREATE / OPEN CONVERSATION
  // =====================================================

  const openFriendChat = async (friend) => {
    try {
      setCreatingChat(true);
      setError('');

      // ----------------------------------------------
      // Check existing conversation
      // ----------------------------------------------

      const {
        data: myMemberships,
        error: membershipError,
      } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUser.id);

      if (membershipError) {
        throw membershipError;
      }

      let existingConversation = null;

      for (const membership of myMemberships || []) {
        const { data: friendMembership } =
          await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq(
              'conversation_id',
              membership.conversation_id
            )
            .eq('user_id', friend.id)
            .maybeSingle();

        if (friendMembership) {
          existingConversation =
            membership.conversation_id;

          break;
        }
      }

      // ----------------------------------------------
      // Conversation exists
      // ----------------------------------------------

      if (existingConversation) {
        await loadConversations();

        const existing = conversations.find(
          (chat) =>
            chat.id === existingConversation
        );

        if (existing) {
          setActiveChat(existing);
        } else {
          await buildChat(
            existingConversation,
            friend
          );
        }
      }

      // ----------------------------------------------
      // Create new conversation
      // ----------------------------------------------

      else {
        const {
          data: newConversation,
          error: createError,
        } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Add both users
        const {
          error: memberError,
        } = await supabase
          .from('conversation_members')
          .insert([
            {
              conversation_id:
                newConversation.id,
              user_id:
                currentUser.id,
            },
            {
              conversation_id:
                newConversation.id,
              user_id: friend.id,
            },
          ]);

        if (memberError) {
          throw memberError;
        }

        await buildChat(
          newConversation.id,
          friend
        );
      }

      setShowFriends(false);
      setMobileList(false);
    } catch (err) {
      console.error(
        'Create conversation error:',
        err
      );

      setError(
        err.message ||
          'Could not create conversation.'
      );
    } finally {
      setCreatingChat(false);
    }
  };

  // =====================================================
  // BUILD CHAT OBJECT
  // =====================================================

  const buildChat = async (
    conversationId,
    friend
  ) => {
    const chat = {
      id: conversationId,

      user: {
        id: friend.id,
        name: friend.name,
        username: friend.username,
        avatar: friend.avatar,
      },

      lastMessage:
        'Start a conversation',

      lastMessageTime:
        new Date().toISOString(),
    };

    setActiveChat(chat);

    setConversations((previous) => {
      const exists = previous.some(
        (item) =>
          item.id === conversationId
      );

      if (exists) return previous;

      return [chat, ...previous];
    });

    setMessages([]);
  };

  // =====================================================
  // LOAD MESSAGES
  // =====================================================

  useEffect(() => {
    if (!activeChat?.id) return;

    loadMessages();
  }, [activeChat?.id]);

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);

      const { data, error } =
        await supabase
          .from('messages')
          .select('*')
          .eq(
            'conversation_id',
            activeChat.id
          )
          .order('created_at', {
            ascending: true,
          });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // =====================================================
  // REALTIME
  // =====================================================

  useEffect(() => {
    if (!activeChat?.id) return;

    console.log(
      'Starting realtime:',
      activeChat.id
    );

    const channel = supabase
      .channel(
        `chat-${activeChat.id}`
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter:
            `conversation_id=eq.${activeChat.id}`,
        },
        (payload) => {
          console.log(
            'Realtime message:',
            payload.new
          );

          setMessages((previous) => {
            const exists = previous.some(
              (message) =>
                message.id ===
                payload.new.id
            );

            if (exists) {
              return previous;
            }

            return [
              ...previous,
              payload.new,
            ];
          });

          setConversations(
            (previous) =>
              previous.map((chat) =>
                chat.id === activeChat.id
                  ? {
                      ...chat,
                      lastMessage:
                        payload.new.content,
                      lastMessageTime:
                        payload.new.created_at,
                    }
                  : chat
              )
          );
        }
      )
      .subscribe((status) => {
        console.log(
          'Realtime status:',
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat?.id]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

// =====================================================
// SEND MESSAGE + NOTIFICATION
// =====================================================

const sendMessage = async (e) => {
  e.preventDefault();

  const text = inputText.trim();

  if (!text && !selectedFile) return;
  if (!activeChat?.id) return;
  if (!currentUser?.id) return;

  try {
    setSending(true);
    setError('');

    let finalContent = text;
    let msgType = 'text';
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        finalContent = `[IMAGE]:${selectedFile.data}${text ? `[CAPTION]:${text}` : ''}`;
        msgType = 'image';
      } else {
        finalContent = `[FILE]:${selectedFile.name}|${selectedFile.type}|${selectedFile.data}${text ? `[CAPTION]:${text}` : ''}`;
        msgType = 'file';
      }
    }

    // ==========================================
    // 1. SEND MESSAGE
    // ==========================================

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeChat.id,
        sender_id: currentUser.id,
        content: finalContent,
        message_type: msgType,
        is_seen: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // ==========================================
    // 2. ADD MESSAGE INSTANTLY TO CHAT
    // ==========================================

    setMessages((previous) => {
      const exists = previous.some(
        (message) => message.id === data.id
      );

      if (exists) return previous;

      return [
        ...previous,
        data,
      ];
    });

    // ==========================================
    // 3. UPDATE CHAT PREVIEW
    // ==========================================

    const previewText = selectedFile 
      ? (selectedFile.type.startsWith('image/') ? '📷 Image Attachment' : `📁 ${selectedFile.name}`)
      : text;

    setConversations((previous) =>
      previous.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              lastMessage: previewText,
              lastMessageTime: data.created_at,
            }
          : chat
      )
    );

    // ==========================================
    // 4. FIND RECEIVER
    // ==========================================

    const receiverId = activeChat?.user?.id;

    // Don't notify yourself
    if (
      receiverId &&
      receiverId !== currentUser.id
    ) {

      // ========================================
      // 5. CREATE NOTIFICATION
      // ========================================

      const { error: notificationError } =
        await supabase
          .from('notifications')
          .insert({
            user_id: receiverId,
            type: 'message',
            reference_id: data.id,
            is_read: false,
          });

      if (notificationError) {
        console.error(
          'Notification error:',
          notificationError
        );
      }
    }

    // ==========================================
    // 6. CLEAR INPUT
    // ==========================================

    setInputText('');
    setSelectedFile(null);
    setShowEmojiPicker(false);

    // ==========================================
    // 7. TRIGGERS AUTOMATIC GEMINI AI RESPONDER IF ACTIVE CHAT IS GEMINI
    // ==========================================
    if (activeChat?.user?.id === 'user_gemini_ai') {
      setTimeout(async () => {
        try {
          const chatHistory = [...messages, data].map(msg => ({
            sender: msg.sender_id === currentUser.id ? 'me' : 'them',
            text: msg.content.startsWith('[IMAGE]:') || msg.content.startsWith('[FILE]:')
              ? 'Attached file/image prompt: ' + (msg.content.includes('[CAPTION]:') ? msg.content.split('[CAPTION]:')[1] : 'No caption')
              : msg.content
          }));

          const responseText = await chatWithGemini(chatHistory);

          const { data: aiData, error: aiError } = await supabase
            .from('messages')
            .insert({
              conversation_id: activeChat.id,
              sender_id: 'user_gemini_ai',
              content: responseText,
              message_type: 'text',
              is_seen: false,
            })
            .select()
            .single();

          if (!aiError && aiData) {
            setMessages((previous) => {
              if (previous.some((m) => m.id === aiData.id)) return previous;
              return [...previous, aiData];
            });

            setConversations((previous) =>
              previous.map((chat) =>
                chat.id === activeChat.id
                  ? {
                      ...chat,
                      lastMessage: responseText,
                      lastMessageTime: aiData.created_at,
                    }
                  : chat
              )
            );
          }
        } catch (err) {
          console.error('AI response error:', err);
        }
      }, 800);
    }

  } catch (err) {
    console.error(
      'Send error:',
      err
    );

    setError(
      err.message ||
        'Message could not be sent.'
    );

  } finally {
    setSending(false);
  }
};

  // =====================================================
  // SELECT CHAT
  // =====================================================

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages([]);
    setMobileList(false);
    setError('');
  };

  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) return '';

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =====================================================
  // CALL DURATION
  // =====================================================

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');

    const secs = (seconds % 60)
      .toString()
      .padStart(2, '0');

    return `${mins}:${secs}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // =====================================================
  // FILTER FRIENDS
  // =====================================================

  const filteredFriends =
    friends.filter((friend) => {
      const text = search.toLowerCase();

      return (
        friend.name
          .toLowerCase()
          .includes(text) ||
        friend.username
          .toLowerCase()
          .includes(text)
      );
    });

  // =====================================================
  // UI
  // =====================================================

  const getInitials = (name = 'User') =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'U';

  const getAvatar = (user, size = 'md') => {
    const sizes = {
      sm: 'w-9 h-9 text-xs',
      md: 'w-12 h-12 text-sm',
      lg: 'w-14 h-14 text-base',
      xl: 'w-20 h-20 text-xl',
    };

    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name || 'User'}
          className={`${sizes[size] || sizes.md} rounded-full object-cover shrink-0`}
        />
      );
    }

    return (
      <div
        className={`${sizes[size] || sizes.md} rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold`}
      >
        {getInitials(user?.name || 'User')}
      </div>
    );
  };

  const formatChatTime = (date) => {
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

  const formatMessageTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    return d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  const visibleChats = conversations.filter((chat) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      chat.user.name.toLowerCase().includes(q) ||
      (chat.user.username || '').toLowerCase().includes(q) ||
      (chat.lastMessage || '').toLowerCase().includes(q)
    );
  });

  const visibleFriends = filteredFriends;

  return (
    <>
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />

      {/* INCOMING VOICE CALL */}
      {callState === 'incoming' && incomingCall && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-7 text-center">
            <div className="flex justify-center">
              {getAvatar(
                incomingCall.caller || {
                  name: 'User',
                  avatar: '',
                },
                'xl'
              )}
            </div>

            <h3 className="text-xl font-bold text-white mt-5">
              Incoming Voice Call
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {incomingCall.caller?.name || 'User'} is calling...
            </p>

            <div className="flex gap-3 mt-7">
              <button
                type="button"
                onClick={rejectIncomingCall}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={acceptIncomingCall}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OUTGOING / ACTIVE VOICE CALL */}
      {['outgoing', 'connecting', 'active', 'ended'].includes(callState) &&
        remoteUser && (
          <div className="fixed inset-0 z-[99] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 text-center">
              <div className="flex justify-center">
                {getAvatar(remoteUser, 'xl')}
              </div>

              <h3 className="text-xl font-bold text-white mt-5">
                {remoteUser.name || 'User'}
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                {callState === 'outgoing' && 'Calling...'}
                {callState === 'connecting' && 'Connecting...'}
                {callState === 'active' &&
                  formatCallDuration(callDuration)}
                {callState === 'ended' && 'Call ended'}
              </p>

              {callError && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {callError}
                </div>
              )}

              <div className="flex justify-center gap-4 mt-8">
                {callState !== 'ended' && (
                  <>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        isMuted
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <MicOff className="w-6 h-6" />
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={endCall}
                      className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition"
                      title="End call"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </>
                )}

                {callState === 'ended' && (
                  <button
                    type="button"
                    onClick={() => setCallError('')}
                    className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      <div className="h-[calc(100vh-64px)] min-h-[620px] bg-slate-950 text-white">
      <div className="h-full max-w-[1500px] mx-auto flex overflow-hidden border-x border-slate-800">

        {/* LEFT: CONVERSATIONS */}
        <aside
          className={`
            ${mobileList ? 'flex' : 'hidden'}
            md:flex
            w-full md:w-[340px] lg:w-[390px]
            shrink-0 flex-col
            bg-slate-950 border-r border-slate-800
          `}
        >
          <div className="px-5 pt-5 pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Messages
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Your conversations
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFriends((value) => !value)}
                className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition flex items-center justify-center shadow-lg shadow-indigo-900/20"
                title="New message"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people or messages..."
                className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
              />
            </div>
          </div>

          {/* NEW CHAT */}
          {showFriends && (
            <div className="border-b border-slate-800 bg-slate-900/90">
              <div className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    New conversation
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a friend
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFriends(false)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {visibleFriends.length === 0 ? (
                  <div className="px-5 py-7 text-center text-sm text-slate-500">
                    No friends found.
                  </div>
                ) : (
                  visibleFriends.map((friend) => (
                    <button
                      type="button"
                      key={friend.id}
                      onClick={() => openFriendChat(friend)}
                      disabled={creatingChat}
                      className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {getAvatar(friend, 'md')}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          @{friend.username || 'user'}
                        </p>
                      </div>

                      <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CHAT LIST */}
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
                <p className="text-xs text-slate-500">
                  Loading conversations...
                </p>
              </div>
            ) : visibleChats.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-[240px]">
                  <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-indigo-400" />
                  </div>

                  <h3 className="font-bold text-slate-200">
                    No conversations
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    Click the + button to start a new chat.
                  </p>
                </div>
              </div>
            ) : (
              visibleChats.map((chat) => {
                const active = activeChat?.id === chat.id;

                return (
                  <button
                    type="button"
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full px-4 py-3.5 flex items-center gap-3 text-left border-b border-slate-900 transition ${
                      active
                        ? 'bg-indigo-500/10'
                        : 'hover:bg-slate-900'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {getAvatar(chat.user, 'lg')}

                      {chat.user.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-semibold text-sm truncate ${
                            active
                              ? 'text-indigo-300'
                              : 'text-slate-100'
                          }`}
                        >
                          {chat.user.name}
                        </p>

                        <span className="text-[10px] text-slate-600 shrink-0">
                          {formatChatTime(chat.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mt-1">
                        {chat.lastMessage || 'Start a conversation'}
                      </p>

                      {chat.user.username && (
                        <p className="text-[10px] text-slate-700 truncate mt-0.5">
                          @{chat.user.username}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT: CHAT */}
        <main
          className={`
            ${mobileList ? 'hidden' : 'flex'}
            md:flex
            flex-1 min-w-0 flex-col bg-slate-950
          `}
        >
          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-5">
                  <MessageSquare className="w-9 h-9 text-indigo-400" />
                </div>

                <h2 className="text-2xl font-bold">
                  Your Messages
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Select a conversation to start chatting.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <header className="h-[74px] shrink-0 px-4 md:px-6 border-b border-slate-800 bg-slate-950/95 backdrop-blur flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileList(true)}
                  className="md:hidden w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div 
                  onClick={() => {
                    if (activeChat.user.id) {
                      navigate(`/profile/${activeChat.user.id}`);
                    }
                  }}
                  className="relative shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  {getAvatar(activeChat.user, 'md')}

                  {activeChat.user.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  )}
                </div>

                <div 
                  onClick={() => {
                    if (activeChat.user.id) {
                      navigate(`/profile/${activeChat.user.id}`);
                    }
                  }}
                  className="flex-1 min-w-0 cursor-pointer group"
                >
                  <h2 className="font-bold text-base truncate group-hover:text-indigo-400 transition-colors">
                    {activeChat.user.name}
                  </h2>

                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {activeChat.user.online
                      ? '● Active now'
                      : `@${activeChat.user.username || 'user'}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    startVoiceCall({
                      user: activeChat.user,
                      conversationId: activeChat.id,
                    })
                  }
                  disabled={
                    !activeChat?.user?.id ||
                    callState !== 'idle'
                  }
                  className="w-10 h-10 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Audio call"
                >
                  <Phone className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  disabled
                  className="w-10 h-10 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition opacity-40 cursor-not-allowed"
                  title="Video call — coming soon"
                >
                  <Video className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  className="w-10 h-10 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                  title="Conversation info"
                >
                  <Info className="w-5 h-5" />
                </button>
              </header>

              {/* ERROR */}
              {error && (
                <div className="mx-4 md:mx-6 mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {error}
                </div>
              )}

              {/* MESSAGE AREA */}
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-3" />
                    <p className="text-xs text-slate-500">
                      Loading messages...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      {getAvatar(activeChat.user, 'xl')}

                      <h3 className="font-bold text-slate-200 mt-4">
                        {activeChat.user.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        @{activeChat.user.username || 'user'}
                      </p>

                      <p className="text-sm text-slate-500 mt-4">
                        Say hello and start the conversation 👋
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-1">
                    {messages.map((message, index) => {
                      const mine =
                        message.sender_id === currentUser.id;

                      const previous = messages[index - 1];

                      let messageImageUrl = null;
                      let messageFile = null; // { name, type, data }
                      let messageText = message.content || '';
                      if (messageText.startsWith('[IMAGE]:')) {
                        const parts = messageText.substring(8).split('[CAPTION]:');
                        messageImageUrl = parts[0];
                        messageText = parts[1] || '';
                      } else if (messageText.startsWith('[FILE]:')) {
                        const parts = messageText.substring(7).split('[CAPTION]:');
                        const filePayload = parts[0];
                        messageText = parts[1] || '';
                        const fileParts = filePayload.split('|');
                        if (fileParts.length >= 3) {
                          messageFile = {
                            name: fileParts[0],
                            type: fileParts[1],
                            data: fileParts.slice(2).join('|')
                          };
                        }
                      }

                      const previousMine =
                        previous &&
                        previous.sender_id === currentUser.id;

                      const showAvatar =
                        !mine &&
                        (!previous || previousMine);

                      const currentDate = new Date(
                        message.created_at
                      );

                      const previousDate = previous
                        ? new Date(previous.created_at)
                        : null;

                      const showDate =
                        !previous ||
                        currentDate.toDateString() !==
                          previousDate?.toDateString();

                      return (
                        <React.Fragment key={message.id}>
                          {showDate && (
                            <div className="flex justify-center py-4">
                              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-500">
                                {currentDate.toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          )}

                          <div
                            className={`flex items-end gap-2 ${
                              mine
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            {!mine &&
                              (showAvatar ? (
                                <div 
                                  onClick={() => {
                                    if (activeChat.user.id) {
                                      navigate(`/profile/${activeChat.user.id}`);
                                    }
                                  }}
                                  className="cursor-pointer hover:opacity-85 transition-opacity shrink-0"
                                >
                                  {getAvatar(activeChat.user, 'sm')}
                                </div>
                              ) : (
                                <div className="w-9 shrink-0" />
                              ))}

                            <div
                              className={`max-w-[78%] md:max-w-[65%] flex flex-col ${
                                mine
                                  ? 'items-end'
                                  : 'items-start'
                              }`}
                            >
                              <div
                                className={`px-4 py-2.5 text-sm leading-5 shadow-sm overflow-hidden ${
                                  mine
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                                    : 'bg-slate-800 text-slate-100 rounded-2xl rounded-bl-md'
                                }`}
                              >
                                {messageImageUrl && (
                                  <div className="mb-2 rounded-xl overflow-hidden max-w-xs border border-slate-700 bg-black/40">
                                    <img 
                                      src={messageImageUrl} 
                                      alt="Attachment" 
                                      className="w-full h-auto max-h-60 object-cover cursor-zoom-in hover:scale-[1.01] transition-transform duration-300"
                                      onClick={() => window.open(messageImageUrl, '_blank')}
                                    />
                                  </div>
                                )}
                                {messageFile && (
                                  <div className="mb-2 p-3 rounded-xl bg-slate-900/60 dark:bg-slate-950/40 border border-slate-700/50 flex items-center gap-3 max-w-xs select-none">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                                      {messageFile.type.includes('text') || messageFile.type.includes('pdf') ? (
                                        <FileText className="w-5 h-5" />
                                      ) : (
                                        <File className="w-5 h-5" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-100 truncate" title={messageFile.name}>
                                        {messageFile.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 truncate">
                                        {messageFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                      </p>
                                    </div>
                                    <a
                                      href={messageFile.data}
                                      download={messageFile.name}
                                      className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center justify-center transition shrink-0"
                                      title={`Download ${messageFile.name}`}
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                )}
                                {messageText && (
                                  <p className="whitespace-pre-wrap break-words font-medium">
                                    {messageText}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500 font-medium">
                                <span>
                                  {formatMessageTime(
                                    message.created_at
                                  )}
                                </span>
                                {mine && (
                                  <CheckCheck 
                                    className={`w-3.5 h-3.5 ${
                                      message.is_seen || activeChat?.user?.id === 'user_gemini_ai'
                                        ? 'text-sky-400' 
                                        : 'text-slate-500'
                                    }`} 
                                    title={message.is_seen || activeChat?.user?.id === 'user_gemini_ai' ? 'Seen' : 'Delivered'}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* FILE PREVIEW DRAWER */}
              {selectedFile && (
                <div className="px-4 md:px-6 py-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 relative">
                    {selectedFile.type.startsWith('image/') ? (
                      <img 
                        src={selectedFile.data} 
                        alt="Attachment preview" 
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-slate-800">
                        <File className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 pr-8">
                      <p className="text-xs text-slate-200 font-bold truncate max-w-[180px] sm:max-w-xs">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Ready to send
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* EMOJI PICKER DRAWER */}
              {showEmojiPicker && (
                <div className="px-4 md:px-6 py-3 border-t border-slate-800 bg-slate-900 flex flex-wrap gap-2 justify-center max-w-4xl mx-auto rounded-t-3xl shadow-inner">
                  {['😀', '😂', '😍', '👍', '🔥', '🎉', '❤️', '🙌', '👏', '🤔', '😎', '⭐', '🎂', '🎈', '⚡', '✨', '☕', '🍕', '👀', '💡', '🚀', '💯'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-10 h-10 rounded-xl hover:bg-slate-800 flex items-center justify-center text-lg transition duration-200 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* MESSAGE COMPOSER */}
              <form
                onSubmit={sendMessage}
                className="shrink-0 px-4 md:px-6 py-4 border-t border-slate-800 bg-slate-950"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="*/*" 
                  className="hidden" 
                />

                <div className="max-w-4xl mx-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 flex items-center justify-center transition cursor-pointer"
                    title="Attach"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      value={inputText}
                      onChange={(e) =>
                        setInputText(e.target.value)
                      }
                      placeholder={`Message ${activeChat.user.name}...`}
                      disabled={sending}
                      className="w-full h-11 bg-slate-900 border border-slate-800 rounded-full pl-4 pr-12 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                    />

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-slate-800 text-slate-500 hover:text-amber-400 flex items-center justify-center transition cursor-pointer"
                      title="Emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      (!inputText.trim() && !selectedFile)
                    }
                    className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition shadow-lg shadow-indigo-900/20 cursor-pointer"
                    title="Send message"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-700 text-center mt-2">
                  Real-time messaging • ConnectBD
                </p>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
    </>
  );
}
