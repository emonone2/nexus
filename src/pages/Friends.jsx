import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  UserPlus,
  Search,
  MessageSquare,
  Check,
  X,
  Sparkles,
  UserCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';

export default function Friends() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [currentUser, setCurrentUser] = useState(null);

  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
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
      ]);

      await loadSuggestedUsers(user.id);
    } catch (err) {
      console.log('Friends page fallback mode active');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // =====================================================
  // GO TO PROFILE
  // =====================================================

  const openProfile = (userId) => {
    if (!userId) return;

    navigate(`/profile/${userId}`);
  };

  // =====================================================
  // AVATAR HELPER
  // =====================================================

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

  // =====================================================
  // FORMAT PROFILE
  // =====================================================

  const formatProfile = (profile) => {
    return {
      id: profile.id,

      name:
        profile.full_name ||
        profile.username ||
        'User',

      username:
        profile.username || '',

      avatar: getAvatar(profile),

      bio:
        profile.bio || '',

      role:
        profile.bio ||
        'ConnectBD User',

      online: false,
    };
  };

  // =====================================================
  // LOAD FRIENDS
  // =====================================================

  const loadFriends = async (userId) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(
          `sender_id.eq.${userId},receiver_id.eq.${userId}`
        );

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setFriendsList([]);
        return;
      }

      // ---------------------------------------------
      // Get friend IDs
      // ---------------------------------------------

      const friendIds = [
        ...new Set(
          data
            .map((request) =>
              request.sender_id === userId
                ? request.receiver_id
                : request.sender_id
            )
            .filter(Boolean)
        ),
      ];

      if (friendIds.length === 0) {
        setFriendsList([]);
        return;
      }

      // ---------------------------------------------
      // Get profiles
      // ---------------------------------------------

      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profileError) {
        throw profileError;
      }

      const formattedFriends = (
        profiles || []
      ).map(formatProfile);

      setFriendsList(formattedFriends);
    } catch (err) {
      console.error(
        'Load friends error:',
        err
      );

      setError(
        err.message ||
          'Could not load friends.'
      );
    }
  };

  // =====================================================
  // LOAD FRIEND REQUESTS
  // =====================================================

  const loadFriendRequests = async (userId) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setFriendRequests([]);
        return;
      }

      const senderIds = [
        ...new Set(
          data
            .map(
              (request) =>
                request.sender_id
            )
            .filter(Boolean)
        ),
      ];

      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      if (profileError) {
        throw profileError;
      }

      const formattedRequests =
        data.map((request) => {
          const profile =
            profiles?.find(
              (item) =>
                item.id ===
                request.sender_id
            );

          return {
            id: request.id,

            senderId:
              request.sender_id,

            name:
              profile?.full_name ||
              profile?.username ||
              'User',

            username:
              profile?.username || '',

            avatar:
              getAvatar(profile),

            role:
              profile?.bio ||
              'ConnectBD User',
          };
        });

      setFriendRequests(
        formattedRequests
      );
    } catch (err) {
      console.error(
        'Load requests error:',
        err
      );

      setError(
        err.message ||
          'Could not load friend requests.'
      );
    }
  };

  // =====================================================
  // LOAD SUGGESTED USERS
  // =====================================================

  const loadSuggestedUsers = async (
    userId
  ) => {
    try {
      // ---------------------------------------------
      // Get accepted friends directly from DB
      // ---------------------------------------------

      const {
        data: accepted,
      } = await supabase
        .from('friend_requests')
        .select(
          'sender_id, receiver_id'
        )
        .eq('status', 'accepted')
        .or(
          `sender_id.eq.${userId},receiver_id.eq.${userId}`
        );

      const friendIds = new Set(
        (accepted || []).map(
          (request) =>
            request.sender_id ===
            userId
              ? request.receiver_id
              : request.sender_id
        )
      );

      // ---------------------------------------------
      // Get pending requests
      // ---------------------------------------------

      const {
        data: pending,
      } = await supabase
        .from('friend_requests')
        .select(
          'sender_id, receiver_id, status'
        )
        .or(
          `sender_id.eq.${userId},receiver_id.eq.${userId}`
        )
        .eq('status', 'pending');

      const relatedIds = new Set();

      (pending || []).forEach(
        (request) => {
          if (
            request.sender_id ===
            userId
          ) {
            relatedIds.add(
              request.receiver_id
            );
          } else {
            relatedIds.add(
              request.sender_id
            );
          }
        }
      );

      // ---------------------------------------------
      // Get profiles
      // ---------------------------------------------

      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .limit(20);

      if (error) {
        throw error;
      }

      const formattedUsers = (
        data || []
      )
        .filter(
          (profile) =>
            !friendIds.has(
              profile.id
            ) &&
            !relatedIds.has(
              profile.id
            )
        )
        .map((profile) => ({
          ...formatProfile(profile),
          mutuals: 0,
        }));

      setSuggestedUsers(
        formattedUsers
      );
    } catch (err) {
      console.error(
        'Load suggested users error:',
        err
      );
    }
  };

  // =====================================================
  // SEARCH PEOPLE
  // =====================================================

  const searchPeople = async (
    query
  ) => {
    setFilterQuery(query);

    const text = query.trim();

    if (!text) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError('');

      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .or(
          `full_name.ilike.%${text}%,username.ilike.%${text}%`
        )
        .limit(20);

      if (error) {
        throw error;
      }

      const results = (
        data || []
      ).map(formatProfile);

      setSearchResults(results);

      // ---------------------------------------------
      // Check request status for search results
      // ---------------------------------------------

      if (results.length > 0) {
        await loadRequestStatuses(
          results.map(
            (user) => user.id
          )
        );
      } else {
        setRequestStatuses({});
      }
    } catch (err) {
      console.error(
        'Search people error:',
        err
      );

      setError(
        err.message ||
          'Search failed.'
      );

      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // LOAD REQUEST STATUS
  // =====================================================

  const loadRequestStatuses = async (
    userIds
  ) => {
    if (!currentUser) return;

    try {
      const statuses = {};

      for (const userId of userIds) {
        const {
          data,
          error,
        } = await supabase
          .from('friend_requests')
          .select(
            'id, sender_id, receiver_id, status'
          )
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`
          )
          .maybeSingle();

        if (error) {
          console.error(
            'Request status error:',
            error
          );

          continue;
        }

        if (!data) {
          statuses[userId] = 'none';
        } else if (
          data.status === 'accepted'
        ) {
          statuses[userId] =
            'friends';
        } else if (
          data.status === 'pending'
        ) {
          if (
            data.sender_id ===
            currentUser.id
          ) {
            statuses[userId] =
              'sent';
          } else {
            statuses[userId] =
              'received';
          }
        }
      }

      setRequestStatuses(
        statuses
      );
    } catch (err) {
      console.error(
        'Request statuses error:',
        err
      );
    }
  };

  // =====================================================
  // ADD FRIEND
  // =====================================================

  const handleAddFriend = async (
    userId
  ) => {
    if (!currentUser) return;

    try {
      clearMessages();

      setRequestLoading(userId);

      // ---------------------------------------------
      // Check existing request
      // ---------------------------------------------

      const {
        data: existingRequest,
        error: checkError,
      } = await supabase
        .from('friend_requests')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`
        )
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingRequest) {
        if (
          existingRequest.status ===
          'accepted'
        ) {
          setRequestStatuses(
            (previous) => ({
              ...previous,
              [userId]: 'friends',
            })
          );

          return;
        }

        if (
          existingRequest.status ===
          'pending'
        ) {
          const isMine =
            existingRequest.sender_id ===
            currentUser.id;

          setRequestStatuses(
            (previous) => ({
              ...previous,
              [userId]: isMine
                ? 'sent'
                : 'received',
            })
          );

          return;
        }
      }

      // ---------------------------------------------
      // Send request
      // ---------------------------------------------

      const {
        data: request,
        error,
      } = await supabase
        .from('friend_requests')
        .insert({
          sender_id:
            currentUser.id,

          receiver_id:
            userId,

          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // ---------------------------------------------
      // CREATE NOTIFICATION FOR RECEIVER
      // ---------------------------------------------

      const {
        error: notificationError,
      } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'friend_request',
          reference_id: request.id,
          is_read: false,
        });

      if (notificationError) {
        console.error(
          'Notification creation error:',
          notificationError
        );

        setSuccess(
          'Friend request sent, but notification could not be created.'
        );
      } else {
        setSuccess(
          'Friend request sent successfully!'
        );
      }

      // ---------------------------------------------
      // Update UI
      // ---------------------------------------------

      setRequestStatuses(
        (previous) => ({
          ...previous,
          [userId]: 'sent',
        })
      );

      setSuggestedUsers(
        (previous) =>
          previous.filter(
            (user) =>
              user.id !== userId
          )
      );
    } catch (err) {
      console.error(
        'Send friend request error:',
        err
      );

      setError(
        err.message ||
          'Could not send friend request.'
      );
    } finally {
      setRequestLoading(null);
    }
  };

  // =====================================================
  // ACCEPT REQUEST
  // =====================================================

  const handleAcceptRequest = async (
    requestId
  ) => {
    try {
      clearMessages();

      setRequestLoading(
        requestId
      );

      const {
        error,
      } = await supabase
        .from('friend_requests')
        .update({
          status: 'accepted',
        })
        .eq(
          'id',
          requestId
        );

      if (error) {
        throw error;
      }

      setSuccess(
        'Friend request accepted!'
      );

      await initialize();
    } catch (err) {
      console.error(
        'Accept request error:',
        err
      );

      setError(
        err.message ||
          'Could not accept request.'
      );
    } finally {
      setRequestLoading(null);
    }
  };

  // =====================================================
  // DECLINE REQUEST
  // =====================================================

  const handleDeclineRequest = async (
    requestId
  ) => {
    try {
      clearMessages();

      setRequestLoading(
        requestId
      );

      const {
        error,
      } = await supabase
        .from('friend_requests')
        .delete()
        .eq(
          'id',
          requestId
        );

      if (error) {
        throw error;
      }

      setSuccess(
        'Friend request removed.'
      );

      await initialize();
    } catch (err) {
      console.error(
        'Decline request error:',
        err
      );

      setError(
        err.message ||
          'Could not remove request.'
      );
    } finally {
      setRequestLoading(null);
    }
  };

  // =====================================================
  // CREATE / FIND CONVERSATION
  // =====================================================

  const handleMessage = async (
    friend
  ) => {
    if (
      !currentUser ||
      !friend?.id
    ) {
      return;
    }

    try {
      clearMessages();

      setMessageLoading(
        friend.id
      );

      // ---------------------------------------------
      // Get my conversations
      // ---------------------------------------------

      const {
        data: myMemberships,
        error: membershipError,
      } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq(
          'user_id',
          currentUser.id
        );

      if (membershipError) {
        throw membershipError;
      }

      let conversationId = null;

      // ---------------------------------------------
      // Find existing conversation
      // ---------------------------------------------

      for (
        const membership of
          myMemberships || []
      ) {
        const {
          data: otherMember,
          error,
        } = await supabase
          .from('conversation_members')
          .select('user_id')
          .eq(
            'conversation_id',
            membership.conversation_id
          )
          .eq(
            'user_id',
            friend.id
          )
          .maybeSingle();

        if (error) {
          console.error(
            'Check conversation error:',
            error
          );

          continue;
        }

        if (otherMember) {
          conversationId =
            membership.conversation_id;

          break;
        }
      }

      // ---------------------------------------------
      // Create conversation
      // ---------------------------------------------

      if (!conversationId) {
        const {
          data: newConversation,
          error,
        } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (error) {
          throw error;
        }

        conversationId =
          newConversation.id;

        // -----------------------------------------
        // Add both members
        // -----------------------------------------

        const {
          error: memberError,
        } = await supabase
          .from('conversation_members')
          .insert([
            {
              conversation_id:
                conversationId,

              user_id:
                currentUser.id,
            },
            {
              conversation_id:
                conversationId,

              user_id:
                friend.id,
            },
          ]);

        if (memberError) {
          // Cleanup conversation
          await supabase
            .from('conversations')
            .delete()
            .eq(
              'id',
              conversationId
            );

          throw memberError;
        }
      }

      // ---------------------------------------------
      // Navigate to chat
      // ---------------------------------------------

      navigate('/chat');
    } catch (err) {
      console.error(
        'Conversation error:',
        err
      );

      setError(
        err.message ||
          'Could not open conversation.'
      );
    } finally {
      setMessageLoading(null);
    }
  };

  // =====================================================
  // FILTER EXISTING FRIENDS
  // =====================================================

  const filteredFriends =
    friendsList.filter(
      (friend) => {
        const query =
          filterQuery
            .trim()
            .toLowerCase();

        const matchesSearch =
          !query ||
          friend.name
            .toLowerCase()
            .includes(query) ||
          friend.username
            .toLowerCase()
            .includes(query);

        if (
          activeFilterTab ===
          'online'
        ) {
          return (
            matchesSearch &&
            friend.online
          );
        }

        return matchesSearch;
      }
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-slate-400">
            Loading friends...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Users className="w-8 h-8 text-indigo-500" />

            Friends & Network
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Manage connections and discover new creators.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <div className="glass-card px-4 py-2 rounded-2xl text-center">
            <span className="text-xs text-slate-400 block">
              Total Friends
            </span>

            <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              {friendsList.length}
            </span>
          </div>

          <div className="glass-card px-4 py-2 rounded-2xl text-center border-indigo-500/30">
            <span className="text-xs text-indigo-400 block">
              Requests
            </span>

            <span className="font-extrabold text-lg text-indigo-500">
              {friendRequests.length}
            </span>
          </div>

        </div>
      </div>

      {/* =================================================
          SUCCESS / ERROR
      ================================================= */}

      {(error || success) && (
        <div
          className={`p-4 rounded-2xl border text-sm ${
            success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>
              {success || error}
            </span>

            <button
              onClick={clearMessages}
              className="opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          PEOPLE SEARCH
      ================================================= */}

      <div className="glass-card p-5 rounded-2xl">

        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-indigo-500" />

          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            Find People
          </h2>
        </div>

        {/* SEARCH INPUT */}

        <div className="relative">

          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search by name or username..."
            value={filterQuery}
            onChange={(e) =>
              searchPeople(
                e.target.value
              )
            }
            className="w-full pl-12 pr-12 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {searching && (
            <Loader2 className="w-5 h-5 text-indigo-500 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
          )}

        </div>

        {/* SEARCH RESULTS */}

        {filterQuery.trim() && (
          <div className="mt-5">

            <div className="flex items-center justify-between mb-3">

              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Search Results
              </h3>

              <span className="text-xs text-slate-400">
                {searchResults.length} result
                {searchResults.length !== 1
                  ? 's'
                  : ''}
              </span>

            </div>

            {searching ? (

              <div className="py-10 text-center">

                <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mx-auto mb-3" />

                <p className="text-sm text-slate-400">
                  Searching...
                </p>

              </div>

            ) : searchResults.length === 0 ? (

              <div className="py-10 text-center">

                <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />

                <p className="text-sm font-semibold text-slate-500">
                  No users found
                </p>

                <p className="text-xs text-slate-600 mt-1">
                  Try another name or username.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {searchResults.map(
                  (user) => {

                    const status =
                      requestStatuses[
                        user.id
                      ] || 'none';

                    return (
                      <div
                        key={user.id}
                        onClick={() =>
                          openProfile(
                            user.id
                          )
                        }
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500/40 hover:shadow-md transition-all"
                      >

                        {/* Avatar */}

                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20"
                        />

                        {/* Info */}

                        <div className="flex-1 min-w-0">

                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {user.name}
                          </h4>

                          <p className="text-xs text-slate-400 truncate">
                            @{user.username}
                          </p>

                          {user.bio && (
                            <p className="text-xs text-slate-500 truncate mt-1">
                              {user.bio}
                            </p>
                          )}

                        </div>

                        {/* Action */}

                        {status ===
                        'friends' ? (

                          <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1">

                            <UserCheck className="w-4 h-4" />

                            Friends

                          </span>

                        ) : status ===
                          'sent' ? (

                          <span className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs font-bold">
                            Pending
                          </span>

                        ) : status ===
                          'received' ? (

                          <span className="px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-xs font-bold">
                            Requested You
                          </span>

                        ) : (

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              handleAddFriend(
                                user.id
                              );
                            }}
                            disabled={
                              requestLoading ===
                              user.id
                            }
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                          >

                            {requestLoading ===
                            user.id ? (

                              <Loader2 className="w-4 h-4 animate-spin" />

                            ) : (

                              <UserPlus className="w-4 h-4" />

                            )}

                            Add

                          </button>

                        )}

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>
        )}

      </div>

      {/* =================================================
          FRIEND REQUESTS
      ================================================= */}

      {friendRequests.length > 0 && (
        <div className="space-y-4">

          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">

            <UserPlus className="w-5 h-5 text-indigo-500" />

            Pending Friend Requests (
            {friendRequests.length}
            )

          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {friendRequests.map(
              (request) => (

                <div
                  key={request.id}
                  className="glass-card p-4 rounded-2xl flex items-center gap-4 shadow-sm border-indigo-500/20"
                >

                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                  />

                  <div className="min-w-0 flex-1">

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {request.name}
                    </h4>

                    <p className="text-xs text-slate-400 truncate">
                      @{request.username}
                    </p>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {request.role}
                    </p>

                    <div className="flex gap-2 mt-3">

                      <button
                        onClick={() =>
                          handleAcceptRequest(
                            request.id
                          )
                        }
                        disabled={
                          requestLoading ===
                          request.id
                        }
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >

                        {requestLoading ===
                        request.id ? (

                          <Loader2 className="w-4 h-4 animate-spin" />

                        ) : (

                          <Check className="w-4 h-4" />

                        )}

                        Confirm

                      </button>

                      <button
                        onClick={() =>
                          handleDeclineRequest(
                            request.id
                          )
                        }
                        disabled={
                          requestLoading ===
                          request.id
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center transition-all disabled:opacity-50"
                      >

                        <X className="w-4 h-4" />

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>
      )}

      {/* =================================================
          FRIEND LIST
      ================================================= */}

      <div className="glass-card p-4 rounded-2xl space-y-4">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex gap-2 w-full sm:w-auto">

            <button
              onClick={() =>
                setActiveFilterTab(
                  'all'
                )
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilterTab ===
                'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              All Friends (
              {friendsList.length}
              )
            </button>

            <button
              onClick={() =>
                setActiveFilterTab(
                  'online'
                )
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilterTab ===
                'online'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              Online Now (
              {
                friendsList.filter(
                  (friend) =>
                    friend.online
                ).length
              }
              )
            </button>

          </div>

          {/* Refresh */}

          <button
            onClick={initialize}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400"
            title="Refresh"
          >

            <RefreshCw className="w-4 h-4" />

          </button>

        </div>

        {/* FRIENDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">

          {filteredFriends.length ===
          0 ? (

            <div className="col-span-full py-12 text-center">

              <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />

              <p className="text-sm font-semibold text-slate-500">
                No friends yet
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Search for people above to send friend requests.
              </p>

            </div>

          ) : (

            filteredFriends.map(
              (friend) => (

                <div
                  key={friend.id}
                  onClick={() =>
                    openProfile(
                      friend.id
                    )
                  }
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center text-center group cursor-pointer hover:border-indigo-500/40 hover:shadow-md transition-all"
                >

                  {/* Avatar */}

                  <div className="relative mb-3">

                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform"
                    />

                    {friend.online && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}

                  </div>

                  {/* Name */}

                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate w-full">
                    {friend.name}
                  </h4>

                  {/* Username */}

                  <p className="text-xs text-slate-400 truncate w-full">
                    @{friend.username}
                  </p>

                  {/* Bio */}

                  {friend.bio && (
                    <p className="text-xs text-slate-500 truncate w-full mb-3">
                      {friend.bio}
                    </p>
                  )}

                  {/* Message */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      handleMessage(
                        friend
                      );
                    }}
                    disabled={
                      messageLoading ===
                      friend.id
                    }
                    className="w-full mt-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >

                    {messageLoading ===
                    friend.id ? (

                      <Loader2 className="w-4 h-4 animate-spin" />

                    ) : (

                      <MessageSquare className="w-4 h-4" />

                    )}

                    {messageLoading ===
                    friend.id
                      ? 'Opening...'
                      : 'Send Message'}

                  </button>

                </div>

              )
            )

          )}

        </div>

      </div>

      {/* =================================================
          SUGGESTED PEOPLE
      ================================================= */}

      {suggestedUsers.length > 0 && (
        <div className="space-y-4">

          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">

            <Sparkles className="w-5 h-5 text-amber-400" />

            People You May Know

          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            {suggestedUsers.map(
              (user) => {

                const status =
                  requestStatuses[
                    user.id
                  ] || 'none';

                return (
                  <div
                    key={user.id}
                    onClick={() =>
                      openProfile(
                        user.id
                      )
                    }
                    className="glass-card p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:border-indigo-500/40 hover:shadow-md transition-all"
                  >

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {user.name}
                    </h4>

                    <p className="text-xs text-slate-400 mb-3">
                      @{user.username}
                    </p>

                    {status ===
                    'sent' ? (

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        disabled
                        className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-xs rounded-xl"
                      >
                        Request Sent
                      </button>

                    ) : (

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          handleAddFriend(
                            user.id
                          );
                        }}
                        disabled={
                          requestLoading ===
                          user.id
                        }
                        className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >

                        {requestLoading ===
                        user.id ? (

                          <Loader2 className="w-4 h-4 animate-spin" />

                        ) : (

                          <UserPlus className="w-4 h-4" />

                        )}

                        {requestLoading ===
                        user.id
                          ? 'Sending...'
                          : 'Add Friend'}

                      </button>

                    )}

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}