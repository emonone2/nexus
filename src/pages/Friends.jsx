import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  MessageSquare,
  Check,
  X,
  Sparkles,
  UserCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function Friends() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState({});
  const [filterQuery, setFilterQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [messageLoading, setMessageLoading] = useState(null);
  const [requestLoading, setRequestLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =====================================================
  // INITIALIZE
  // =====================================================
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return;
      }

      setCurrentUser(user);

      await Promise.all([
        loadFriends(user.id),
        loadFriendRequests(user.id),
        loadSentRequests(user.id),
      ]);

      await loadSuggestedUsers(user.id);
    } catch (err) {
      console.log('Friends page fallback mode active');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const openProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const getAvatar = (profile) => {
    if (profile?.profile_image) {
      return profile.profile_image;
    }
    const name = profile?.full_name || profile?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=256`;
  };

  const formatProfile = (profile) => {
    return {
      id: profile.id,
      name: profile.full_name || profile.username || 'User',
      username: profile.username || '',
      avatar: getAvatar(profile),
      bio: profile.bio || '',
      role: profile.bio || 'ConnectBD User',
      online: false,
    };
  };

  const loadFriends = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      if (error) throw error;

      if (!data || data.length === 0) {
        setFriendsList([]);
        return;
      }

      const friendIds = [
        ...new Set(
          data
            .map((request) =>
              request.sender_id === userId ? request.receiver_id : request.sender_id
            )
            .filter(Boolean)
        ),
      ];

      if (friendIds.length === 0) {
        setFriendsList([]);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profileError) throw profileError;

      const formattedFriends = (profiles || []).map(formatProfile);
      setFriendsList(formattedFriends);
    } catch (err) {
      console.error('Load friends error:', err);
      setError(err.message || 'Could not load friends.');
    }
  };

  const loadFriendRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setFriendRequests([]);
        return;
      }

      const senderIds = [
        ...new Set(data.map((request) => request.sender_id).filter(Boolean)),
      ];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      if (profileError) throw profileError;

      const formattedRequests = data.map((request) => {
        const profile = profiles?.find((item) => item.id === request.sender_id);
        return {
          id: request.id,
          senderId: request.sender_id,
          name: profile?.full_name || profile?.username || 'User',
          username: profile?.username || '',
          avatar: getAvatar(profile),
          role: profile?.bio || 'ConnectBD User',
        };
      });

      setFriendRequests(formattedRequests);
    } catch (err) {
      console.error('Load requests error:', err);
      setError(err.message || 'Could not load friend requests.');
    }
  };

  const loadSentRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setSentRequests([]);
        return;
      }

      const receiverIds = [
        ...new Set(data.map((request) => request.receiver_id).filter(Boolean)),
      ];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', receiverIds);

      if (profileError) throw profileError;

      const formattedSent = data.map((request) => {
        const profile = profiles?.find((item) => item.id === request.receiver_id);
        return {
          id: request.id,
          receiverId: request.receiver_id,
          name: profile?.full_name || profile?.username || 'User',
          username: profile?.username || '',
          avatar: getAvatar(profile),
          role: profile?.bio || 'ConnectBD User',
        };
      });

      setSentRequests(formattedSent);
    } catch (err) {
      console.error('Load sent requests error:', err);
    }
  };

  const loadSuggestedUsers = async (userId) => {
    try {
      const { data: accepted } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      const friendIds = new Set(
        (accepted || []).map((request) =>
          request.sender_id === userId ? request.receiver_id : request.sender_id
        )
      );

      const { data: pending } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id, status')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'pending');

      const relatedIds = new Set();
      (pending || []).forEach((request) => {
        if (request.sender_id === userId) {
          relatedIds.add(request.receiver_id);
        } else {
          relatedIds.add(request.sender_id);
        }
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .limit(20);

      if (error) throw error;

      const formattedUsers = (data || [])
        .filter((profile) => !friendIds.has(profile.id) && !relatedIds.has(profile.id))
        .map((profile) => ({
          ...formatProfile(profile),
          mutuals: 0,
        }));

      setSuggestedUsers(formattedUsers);
    } catch (err) {
      console.error('Load suggested users error:', err);
    }
  };

  const searchPeople = async (query) => {
    setFilterQuery(query);
    const text = query.trim();

    if (!text) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError('');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .or(`full_name.ilike.%${text}%,username.ilike.%${text}%`)
        .limit(20);

      if (error) throw error;

      const results = (data || []).map(formatProfile);
      setSearchResults(results);

      if (results.length > 0) {
        await loadRequestStatuses(results.map((user) => user.id));
      } else {
        setRequestStatuses({});
      }
    } catch (err) {
      console.error('Search people error:', err);
      setError(err.message || 'Search failed.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadRequestStatuses = async (userIds) => {
    if (!currentUser) return;

    try {
      const statuses = {};
      for (const userId of userIds) {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('id, sender_id, receiver_id, status')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
          .maybeSingle();

        if (error) {
          console.error('Request status error:', error);
          continue;
        }

        if (!data) {
          statuses[userId] = 'none';
        } else if (data.status === 'accepted') {
          statuses[userId] = 'friends';
        } else if (data.status === 'pending') {
          if (data.sender_id === currentUser.id) {
            statuses[userId] = 'sent';
          } else {
            statuses[userId] = 'received';
          }
        }
      }
      setRequestStatuses(statuses);
    } catch (err) {
      console.error('Request statuses error:', err);
    }
  };

  const handleAddFriend = async (userId) => {
    if (!currentUser) return;

    try {
      clearMessages();
      setRequestLoading(userId);

      const { data: existingRequest, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRequest) {
        if (existingRequest.status === 'accepted') {
          setRequestStatuses((previous) => ({ ...previous, [userId]: 'friends' }));
          return;
        }
        if (existingRequest.status === 'pending') {
          const isMine = existingRequest.sender_id === currentUser.id;
          setRequestStatuses((previous) => ({ ...previous, [userId]: isMine ? 'sent' : 'received' }));
          return;
        }
      }

      const { data: request, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUser.id,
          receiver_id: userId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'friend_request',
          reference_id: request.id,
          is_read: false,
        });

      if (notificationError) {
        console.error('Notification creation error:', notificationError);
        setSuccess('Friend request sent, but notification could not be created.');
      } else {
        setSuccess('Friend request sent successfully!');
      }

      setRequestStatuses((previous) => ({ ...previous, [userId]: 'sent' }));
      setSuggestedUsers((previous) => previous.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Send friend request error:', err);
      setError(err.message || 'Could not send friend request.');
    } finally {
      setRequestLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      clearMessages();
      setRequestLoading(requestId);

      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      setSuccess('Friend request accepted!');
      await initialize();
    } catch (err) {
      console.error('Accept request error:', err);
      setError(err.message || 'Could not accept request.');
    } finally {
      setRequestLoading(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      clearMessages();
      setRequestLoading(requestId);

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setSuccess('Friend request removed.');
      await initialize();
    } catch (err) {
      console.error('Decline request error:', err);
      setError(err.message || 'Could not remove request.');
    } finally {
      setRequestLoading(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      clearMessages();
      setRequestLoading(requestId);

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setSuccess('Sent friend request cancelled.');
      await initialize();
    } catch (err) {
      console.error('Cancel request error:', err);
      setError(err.message || 'Could not cancel request.');
    } finally {
      setRequestLoading(null);
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!currentUser) return;

    try {
      clearMessages();
      setRequestLoading(friendId);

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUser.id})`);

      if (error) throw error;

      setSuccess('Unfriended successfully.');
      await initialize();
    } catch (err) {
      console.error('Unfriend error:', err);
      setError(err.message || 'Could not unfriend.');
    } finally {
      setRequestLoading(null);
    }
  };

  const handleMessage = async (friend) => {
    if (!currentUser || !friend?.id) return;

    try {
      clearMessages();
      setMessageLoading(friend.id);

      const { data: myMemberships, error: membershipError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUser.id);

      if (membershipError) throw membershipError;

      let conversationId = null;

      for (const membership of myMemberships || []) {
        const { data: otherMember, error } = await supabase
          .from('conversation_members')
          .select('user_id')
          .eq('conversation_id', membership.conversation_id)
          .eq('user_id', friend.id)
          .maybeSingle();

        if (error) {
          console.error('Check conversation error:', error);
          continue;
        }

        if (otherMember) {
          conversationId = membership.conversation_id;
          break;
        }
      }

      if (!conversationId) {
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (error) throw error;

        conversationId = newConversation.id;

        const { error: memberError } = await supabase
          .from('conversation_members')
          .insert([
            { conversation_id: conversationId, user_id: currentUser.id },
            { conversation_id: conversationId, user_id: friend.id },
          ]);

        if (memberError) {
          await supabase.from('conversations').delete().eq('id', conversationId);
          throw memberError;
        }
      }

      navigate('/chat');
    } catch (err) {
      console.error('Conversation error:', err);
      setError(err.message || 'Could not open conversation.');
    } finally {
      setMessageLoading(null);
    }
  };

  const filteredFriends = friendsList.filter((friend) => {
    const query = filterQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      friend.name.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query);

    if (activeFilterTab === 'online') {
      return matchesSearch && friend.online;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-wider">Loading friends & network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-500" />
            <span>Friends & Network</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your dynamic connections, handle requests, and meet top-tier creators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4.5 py-2 rounded-2xl text-center bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Friends</span>
            <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">{friendsList.length}</span>
          </div>

          <div className="glass-card px-4.5 py-2 rounded-2xl text-center bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-wider block">Requests</span>
            <span className="font-extrabold text-base text-indigo-500 dark:text-indigo-400">{friendRequests.length}</span>
          </div>

          <div className="glass-card px-4.5 py-2 rounded-2xl text-center bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-extrabold uppercase tracking-wider block">Sent</span>
            <span className="font-extrabold text-base text-amber-500 dark:text-amber-400">{sentRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Banner for success/error */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold ${
              success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{success || error}</span>
              <button onClick={clearMessages} className="opacity-70 hover:opacity-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Find People Search section */}
      <div className="glass-card p-5.5 rounded-[32px] bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <Search className="w-5 h-5 text-indigo-500" />
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 font-['Outfit']">
            Find Connections
          </h2>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-3.5" />
          <input
            type="text"
            placeholder="Search creators by full name or username..."
            value={filterQuery}
            onChange={(e) => searchPeople(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          {searching && (
            <Loader2 className="w-5 h-5 text-indigo-500 absolute right-4.5 top-3.5 animate-spin" />
          )}
        </div>

        {/* Live Search Results */}
        {filterQuery.trim() && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Search Results</h3>
              <span className="text-[11px] text-slate-400 font-bold">{searchResults.length} matches</span>
            </div>

            {searching ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No matching connections found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((user) => {
                  const status = requestStatuses[user.id] || 'none';
                  return (
                    <motion.div
                      whileHover={{ y: -2 }}
                      key={user.id}
                      onClick={() => openProfile(user.id)}
                      className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl cursor-pointer hover:border-indigo-500/30 hover:shadow-md transition-all"
                    >
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/10" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">{user.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">@{user.username}</p>
                      </div>

                      {status === 'friends' ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Friends
                        </span>
                      ) : status === 'sent' ? (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">Pending</span>
                      ) : status === 'received' ? (
                        <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 text-[10px] font-bold uppercase">Requested</span>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddFriend(user.id);
                          }}
                          disabled={requestLoading === user.id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {requestLoading === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                          <span>Add</span>
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Friend Requests */}
      <AnimatePresence>
        {friendRequests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              <span>Pending Requests ({friendRequests.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {friendRequests.map((request) => (
                <motion.div
                  layout
                  key={request.id}
                  className="glass-card p-4.5 rounded-[24px] flex items-center gap-4 shadow-sm bg-white dark:bg-slate-900/40 border border-indigo-500/10"
                >
                  <img 
                    src={request.avatar} 
                    alt={request.name} 
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/15 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => navigate(`/profile/${request.senderId}`)}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => navigate(`/profile/${request.senderId}`)}
                    >
                      {request.name}
                    </h4>
                    <p 
                      className="text-[10px] text-slate-400 font-semibold truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => navigate(`/profile/${request.senderId}`)}
                    >
                      @{request.username}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-1 leading-normal font-medium">{request.role}</p>

                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={requestLoading === request.id}
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        {requestLoading === request.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Confirm</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleDeclineRequest(request.id)}
                        disabled={requestLoading === request.id}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sent Friend Requests */}
      <AnimatePresence>
        {sentRequests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              <span>Sent Friend Requests ({sentRequests.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sentRequests.map((request) => (
                <motion.div
                  layout
                  key={request.id}
                  className="glass-card p-4.5 rounded-[24px] flex items-center gap-4 shadow-sm bg-white dark:bg-slate-900/40 border border-indigo-500/10"
                >
                  <img 
                    src={request.avatar} 
                    alt={request.name} 
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/15 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => navigate(`/profile/${request.receiverId}`)}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => navigate(`/profile/${request.receiverId}`)}
                    >
                      {request.name}
                    </h4>
                    <p 
                      className="text-[10px] text-slate-400 font-semibold truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => navigate(`/profile/${request.receiverId}`)}
                    >
                      @{request.username}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-1 leading-normal font-medium">{request.role}</p>

                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={requestLoading === request.id}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-500/10 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-500/10"
                      >
                        {requestLoading === request.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        <span>Cancel Request</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends grid and lists */}
      <div className="glass-card p-5.5 rounded-[32px] bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
              }`}
            >
              All Friends ({friendsList.length})
            </button>

            <button
              onClick={() => setActiveFilterTab('online')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === 'online'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
              }`}
            >
              Online ({friendsList.filter((f) => f.online).length})
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={initialize}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Friends listings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-1">
          {filteredFriends.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">No connections found</p>
              <p className="text-xs text-slate-400 mt-1">Search for creators above or find people you may know.</p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <motion.div
                whileHover={{ y: -3 }}
                key={friend.id}
                onClick={() => openProfile(friend.id)}
                className="p-4.5 bg-slate-50 dark:bg-slate-950/20 rounded-[24px] border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center text-center group cursor-pointer hover:border-indigo-500/30 hover:shadow-md transition-all"
              >
                <div className="relative mb-3">
                  <img src={friend.avatar} alt={friend.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/15 group-hover:scale-105 transition-transform duration-300" />
                  {friend.online && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>

                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate w-full font-['Outfit']">
                  {friend.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold truncate w-full">@{friend.username}</p>

                {friend.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full mt-2 leading-relaxed font-medium">
                    {friend.bio}
                  </p>
                )}

                <div className="flex gap-2 w-full mt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(friend);
                    }}
                    disabled={messageLoading === friend.id}
                    className="flex-1 py-2.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-extrabold text-[10px] uppercase tracking-wide rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {messageLoading === friend.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>{messageLoading === friend.id ? 'Opening...' : 'Message'}</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfriend(friend.id);
                    }}
                    disabled={requestLoading === friend.id}
                    className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                    title="Unfriend"
                  >
                    {requestLoading === friend.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Suggested Users / People you may know */}
      <AnimatePresence>
        {suggestedUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>People You May Know</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {suggestedUsers.map((user) => {
                const status = requestStatuses[user.id] || 'none';
                return (
                  <motion.div
                    whileHover={{ y: -3 }}
                    key={user.id}
                    onClick={() => openProfile(user.id)}
                    className="glass-card p-5 rounded-[24px] flex flex-col items-center text-center cursor-pointer hover:border-indigo-500/30 hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40"
                  >
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-xl object-cover mb-2.5 ring-2 ring-indigo-500/10" />
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate w-full font-['Outfit']">{user.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mb-3.5">@{user.username}</p>

                    {status === 'sent' ? (
                      <button disabled className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-extrabold text-[10px] uppercase rounded-xl border border-slate-200/10">
                        Request Sent
                      </button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFriend(user.id);
                        }}
                        disabled={requestLoading === user.id}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-xl shadow-md shadow-indigo-500/15 hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {requestLoading === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="w-3.5 h-3.5" />
                        )}
                        <span>{requestLoading === user.id ? 'Sending...' : 'Add Friend'}</span>
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
