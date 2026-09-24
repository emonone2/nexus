import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);

const emptyUser = {
  id: null,
  name: '',
  handle: '',
  avatar: '',
  cover: '',
  bio: '',
  location: '',
  joined: '',
  stats: { posts: 0, followers: 0, following: 0 },
  isLoggedIn: false,
};

const getTimeText = (dateString) => {
  if (!dateString) return 'Just now';
  const diff = Math.max(0, Date.now() - new Date(dateString).getTime());
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const profileToUser = (user, profile) => ({
  id: user.id,
  name: profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User',
  handle: profile?.username || '',
  avatar: profile?.profile_image || '',
  cover: profile?.cover_image || '',
  bio: profile?.bio || '',
  location: profile?.location || '',
  joined: profile?.created_at
    ? `Joined ${new Date(profile.created_at).toLocaleDateString()}`
    : '',
  stats: { posts: 0, followers: 0, following: 0 },
  isLoggedIn: true,
});

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(emptyUser);
  const [authReady, setAuthReady] = useState(false);

  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyViews, setStoryViews] = useState([]);

  // Load active stories (filter out > 24 hours old)
  const loadAllStories = () => {
    let customStories = [];
    try {
      customStories = JSON.parse(localStorage.getItem('nexus_custom_stories')) || [];
    } catch {
      customStories = [];
    }

    const now = Date.now();
    const activeCustom = customStories.filter(story => {
      const createdTime = new Date(story.createdAt).getTime();
      return (now - createdTime) < 24 * 60 * 60 * 1000;
    });

    try {
      localStorage.setItem('nexus_custom_stories', JSON.stringify(activeCustom));
    } catch (e) {
      console.error(e);
    }

    setStories(activeCustom);
  };

  const handleCreateStory = (bgImage, storyText) => {
    if (!currentUser?.id) return;

    const newStory = {
      id: `story_custom_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser.name || 'User',
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      bg: bgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=600&q=80',
      text: storyText || '',
      hasUnseen: false,
      createdAt: new Date().toISOString()
    };

    let customStories = [];
    try {
      customStories = JSON.parse(localStorage.getItem('nexus_custom_stories')) || [];
    } catch {
      customStories = [];
    }

    customStories.unshift(newStory);
    localStorage.setItem('nexus_custom_stories', JSON.stringify(customStories));

    // Simulated views for instant realistic display
    const mockViewers = [
      { id: 'user_sarah_connor', name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'user_alex_rivers', name: 'Alex Rivers', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
      { id: 'user_elena_rostova', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' }
    ];

    const randomCount = Math.floor(Math.random() * 2) + 2;
    const selectedViewers = mockViewers.slice(0, randomCount);

    let currentViews = [];
    try {
      currentViews = JSON.parse(localStorage.getItem('nexus_story_views')) || [];
    } catch {
      currentViews = [];
    }

    selectedViewers.forEach(viewer => {
      currentViews.push({
        storyId: newStory.id,
        viewerId: viewer.id,
        viewerName: viewer.name,
        viewerAvatar: viewer.avatar,
        viewedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 60 * 1000).toISOString()
      });
    });

    localStorage.setItem('nexus_story_views', JSON.stringify(currentViews));
    setStoryViews(currentViews);

    loadAllStories();
  };

  const recordStoryView = (storyId) => {
    if (!currentUser?.id || !storyId) return;

    let currentViews = [];
    try {
      currentViews = JSON.parse(localStorage.getItem('nexus_story_views')) || [];
    } catch {
      currentViews = [];
    }

    const alreadyViewed = currentViews.some(v => v.storyId === storyId && v.viewerId === currentUser.id);
    if (alreadyViewed) return;

    const newView = {
      storyId,
      viewerId: currentUser.id,
      viewerName: currentUser.name || 'User',
      viewerAvatar: currentUser.avatar || '',
      viewedAt: new Date().toISOString()
    };

    currentViews.push(newView);
    localStorage.setItem('nexus_story_views', JSON.stringify(currentViews));
    setStoryViews(currentViews);
  };

  // Run on mount & when currentUser changes
  useEffect(() => {
    loadAllStories();
    try {
      const views = JSON.parse(localStorage.getItem('nexus_story_views')) || [];
      setStoryViews(views);
    } catch {
      setStoryViews([]);
    }
  }, [currentUser?.id]);

  const [posts, setPosts] = useState([]);
  const [groupsList, setGroupsList] = useState([
    {
      id: 'group_1',
      name: 'Vite & React Enthusiasts',
      category: 'Tech & Code',
      description: 'A global community of frontend developers focusing on Vite, React 19, and cutting-edge web tooling.',
      members: 2450,
      postsPerDay: '12+',
      cover: 'https://images.unsplash.com/photo-1555066931-4365d14babdf9?auto=format&fit=crop&w=800&q=80',
      isPrivate: false,
      isJoined: false,
    },
    {
      id: 'group_2',
      name: 'Figma Designers Hub',
      category: 'UI/UX Design',
      description: 'Discussing layout systems, variables, auto layout hacks, design tokens, and user experience paradigms.',
      members: 1890,
      postsPerDay: '8+',
      cover: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80',
      isPrivate: false,
      isJoined: true,
    },
    {
      id: 'group_3',
      name: 'Pacific Crest Trail Hikers',
      category: 'Outdoors',
      description: 'Gear recommendations, thru-hiking journals, safety alerts, and meetups along the Pacific Crest Trail.',
      members: 950,
      postsPerDay: '3+',
      cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      isPrivate: false,
      isJoined: false,
    },
    {
      id: 'group_4',
      name: 'Retro Arcade Lounge',
      category: 'Gaming',
      description: 'Nostalgic arcades, emulators, speedruns, custom cabinets, and classic pixel-art retro gaming.',
      members: 3120,
      postsPerDay: '20+',
      cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
      isPrivate: false,
      isJoined: false,
    }
  ]);
  const [productsList, setProductsList] = useState([
    {
      id: 'prod_1',
      title: 'Neon Glow UI Kit (Figma)',
      category: 'Digital Assets',
      price: 29,
      rating: '4.9',
      seller: 'Sarah Connor',
      sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'A complete Figma library featuring glassmorphism elements, fully responsive autolayout components, and dark-mode neon variables.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      isPurchased: false
    },
    {
      id: 'prod_2',
      title: 'Minimalist Blog Theme (Vite/React)',
      category: 'Templates',
      price: 39,
      rating: '4.8',
      seller: 'Alex Rivers',
      sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'Supercharged React 19 template with pre-configured Tailwind CSS v4, dynamic MDX blog posts, high SEO scoring, and fully responsive fluid layouts.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14babdf9?auto=format&fit=crop&w=800&q=80',
      isPurchased: false
    },
    {
      id: 'prod_3',
      title: 'Dreamscape Wallpaper Pack',
      category: 'Wallpapers',
      price: 12,
      rating: '5.0',
      seller: 'Elena Rostova',
      sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
      description: '10 custom high-resolution (8K) premium digital wallpapers optimized for ultra-wide desktop monitors and mobile display screens.',
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
      isPurchased: false
    }
  ]);

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [followedCreators, setFollowedCreators] = useState([]);
  const [collectionsList, setCollectionsList] = useState([
    { id: 'all', label: 'All Saved' },
    { id: 'design', label: 'Design Tokens' },
    { id: 'code', label: 'Code Snippets' },
    { id: 'photos', label: 'Wallpapers & Photos' },
  ]);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [dataLoading, setDataLoading] = useState(false);

  /*
   * ============================================================
   * AUTH
   * ============================================================
   * One Supabase database can safely contain many accounts.
   * Every account is identified by its own auth.users.id.
   */
  const authUserIdRef = useRef(null);
  const authLoadVersionRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const clearAccountState = () => {
      if (!mounted) return;

      setCurrentUser(emptyUser);
      setPosts([]);
      setConversations([]);
      setFriendRequests([]);
      setFriendsList([]);
      setNotifications([]);
      setActiveChatId(null);
      setAuthReady(true);
    };

    const loadUserById = async (user, version) => {
      if (!user?.id) {
        clearAccountState();
        return;
      }

      const userId = user.id;
      authUserIdRef.current = userId;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Ignore an older request if another account has already logged in.
      if (!mounted || version !== authLoadVersionRef.current) return;
      if (authUserIdRef.current !== userId) return;

      if (profileError) {
        console.error('Profile load error:', profileError);
      }

      setCurrentUser(profileToUser(user, profile));
      setAuthReady(true);
    };

    const handleAuthChange = (event, session) => {
      if (!mounted) return;

      const nextUser = session?.user || null;
      const version = ++authLoadVersionRef.current;

      if (!nextUser) {
        authUserIdRef.current = null;
        clearAccountState();
        return;
      }

      // Immediately remove the previous account's in-memory data.
      authUserIdRef.current = nextUser.id;
      setAuthReady(false);
      setCurrentUser(emptyUser);
      setPosts([]);
      setConversations([]);
      setFriendRequests([]);
      setFriendsList([]);
      setNotifications([]);
      setActiveChatId(null);

      // Do Supabase profile work outside the auth callback.
      // This avoids auth-listener timing/deadlock problems.
      setTimeout(() => {
        loadUserById(nextUser, version);
      }, 0);
    };

    // Listen first so a login/logout occurring during initial loading is not missed.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      handleAuthChange
    );

    // Load the session that already exists when the app starts.
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Initial auth session error:', error);
          ++authLoadVersionRef.current;
          authUserIdRef.current = null;
          clearAccountState();
          return;
        }

        const user = session?.user || null;
        const version = ++authLoadVersionRef.current;

        if (!user) {
          authUserIdRef.current = null;
          clearAccountState();
          return;
        }

        authUserIdRef.current = user.id;
        setAuthReady(false);
        setCurrentUser(emptyUser);
        setPosts([]);
        setConversations([]);
        setFriendRequests([]);
        setFriendsList([]);
        setNotifications([]);
        setActiveChatId(null);

        await loadUserById(user, version);
      } catch (err) {
        console.error('initializeAuth exception:', err);
        if (mounted) clearAccountState();
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      authUserIdRef.current = null;
      ++authLoadVersionRef.current;
      authListener.subscription.unsubscribe();
    };
  }, []);

  /*
   * ============================================================
   * PROFILE
   * ============================================================
   */
  const refreshCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setCurrentUser(emptyUser);
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile refresh error:', profileError);
      return null;
    }

    setCurrentUser(profileToUser(user, profile));
    return profile;
  };

  /*
   * ============================================================
   * NOTIFICATIONS
   * ============================================================
   */
  const getLocalDataFallback = (table) => {
    try {
      return JSON.parse(localStorage.getItem(`nexus_db_${table}`)) || [];
    } catch {
      return [];
    }
  };

  const loadNotifications = async (userId) => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    try {
      const { data: rows, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, reference_id, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped = await Promise.all((rows || []).map(async (row) => {
        let sender = null;
        let text = 'You have a new notification';

        if (row.type === 'message' && row.reference_id) {
          const { data: message } = await supabase
            .from('messages')
            .select('sender_id, content')
            .eq('id', row.reference_id)
            .maybeSingle();

          if (message?.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, username, profile_image')
              .eq('id', message.sender_id)
              .maybeSingle();

            sender = profile;
          }

          text = message?.content
            ? `sent you a message: ${message.content}`
            : 'sent you a message';
        }

        if (row.type === 'friend_request' && row.reference_id) {
          const { data: request } = await supabase
            .from('friend_requests')
            .select('sender_id')
            .eq('id', row.reference_id)
            .maybeSingle();

          if (request?.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, username, profile_image')
              .eq('id', request.sender_id)
              .maybeSingle();

            sender = profile;
          }

          text = 'sent you a friend request';
        }

        return {
          id: row.id,
          user: sender?.full_name || sender?.username || 'Someone',
          avatar: sender?.profile_image || '',
          senderId: sender?.id || null,
          text,
          time: getTimeText(row.created_at),
          unread: !row.is_read,
          type: row.type,
          referenceId: row.reference_id,
          createdAt: row.created_at,
        };
      }));

      setNotifications(mapped);
    } catch (err) {
      console.warn('[AI Studio] loadNotifications remote error, falling back to local mock data:', err);
      const notificationsList = getLocalDataFallback('notifications').filter(n => n.user_id === userId);
      const profilesList = getLocalDataFallback('profiles');
      const messagesList = getLocalDataFallback('messages');
      const requestsList = getLocalDataFallback('friend_requests');

      const mapped = notificationsList.map(row => {
        let sender = null;
        let text = 'You have a new notification';

        if (row.type === 'message' && row.reference_id) {
          const msg = messagesList.find(m => m.id === row.reference_id);
          if (msg) {
            sender = profilesList.find(p => p.id === msg.sender_id);
            text = msg.content ? `sent you a message: ${msg.content}` : 'sent you a message';
          }
        } else if (row.type === 'friend_request' && row.reference_id) {
          const req = requestsList.find(r => r.id === row.reference_id);
          if (req) {
            sender = profilesList.find(p => p.id === req.sender_id);
            text = 'sent you a friend request';
          }
        }

        return {
          id: row.id,
          user: sender?.full_name || sender?.username || 'Someone',
          avatar: sender?.profile_image || '',
          senderId: sender?.id || null,
          text,
          time: getTimeText(row.created_at),
          unread: !row.is_read,
          type: row.type,
          referenceId: row.reference_id,
          createdAt: row.created_at,
        };
      });

      setNotifications(mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  };

  /*
   * ============================================================
   * POSTS
   * ============================================================
   * Expected posts columns:
   * id, user_id, content, image_url, created_at
   */
  const loadPosts = async (userId) => {
    if (!userId) {
      setPosts([]);
      return;
    }

    try {
      const { data: rows, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const postIds = (rows || []).map((p) => p.id);

      let likesRows = [];
      let commentsRows = [];

      if (postIds.length) {
        const likesResult = await supabase
          .from('likes')
          .select('*')
          .in('post_id', postIds);

        if (!likesResult.error) likesRows = likesResult.data || [];

        const commentsResult = await supabase
          .from('comments')
          .select('*')
          .in('post_id', postIds)
          .order('created_at', { ascending: true });

        if (!commentsResult.error) commentsRows = commentsResult.data || [];
      }

      const userIds = [
        ...new Set([
          ...(rows || []).map((p) => p.user_id).filter(Boolean),
          ...(commentsRows || []).map((c) => c.user_id).filter(Boolean),
        ]),
      ];

      let profiles = [];
      if (userIds.length) {
        const profileResult = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_image')
          .in('id', userIds);

        if (!profileResult.error) profiles = profileResult.data || [];
      }

      const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

      const mapped = (rows || []).map((post) => {
        const author = profileMap[post.user_id];
        const postLikes = likesRows.filter((l) => l.post_id === post.id);
        const postComments = commentsRows
          .filter((c) => c.post_id === post.id)
          .map((c) => {
            const cp = profileMap[c.user_id];
            return {
              id: c.id,
              userId: c.user_id,
              author: cp?.full_name || cp?.username || 'User',
              avatar: cp?.profile_image || '',
              time: getTimeText(c.created_at),
              text: c.content,
            };
          });

        return {
          id: post.id,
          userId: post.user_id,
          author: {
            name: author?.full_name || author?.username || 'User',
            handle: author?.username || '',
            avatar: author?.profile_image || '',
            verified: false,
          },
          time: getTimeText(post.created_at),
          content: post.content || '',
          image: post.image_url || post.image || null,
          likes: postLikes.length,
          isLiked: postLikes.some((l) => l.user_id === userId),
          bookmarks: 0,
          isBookmarked: false,
          shares: 0,
          comments: postComments,
        };
      });

      setPosts(mapped);
    } catch (err) {
      console.warn('[AI Studio] loadPosts remote error, falling back to local mock data:', err);
      const postsList = getLocalDataFallback('posts');
      const likesList = getLocalDataFallback('likes');
      const commentsList = getLocalDataFallback('comments');
      const profilesList = getLocalDataFallback('profiles');

      const profileMap = Object.fromEntries(profilesList.map((p) => [p.id, p]));

      const mapped = postsList.map((post) => {
        const author = profileMap[post.user_id];
        const postLikes = likesList.filter((l) => l.post_id === post.id);
        const postComments = commentsList
          .filter((c) => c.post_id === post.id)
          .map((c) => {
            const cp = profileMap[c.user_id];
            return {
              id: c.id,
              userId: c.user_id,
              author: cp?.full_name || cp?.username || 'User',
              avatar: cp?.profile_image || '',
              time: getTimeText(c.created_at),
              text: c.content,
            };
          });

        return {
          id: post.id,
          userId: post.user_id,
          author: {
            name: author?.full_name || author?.username || 'User',
            handle: author?.username || '',
            avatar: author?.profile_image || '',
            verified: false,
          },
          time: getTimeText(post.created_at),
          content: post.content || '',
          image: post.image_url || post.image || null,
          likes: postLikes.length,
          isLiked: postLikes.some((l) => l.user_id === userId),
          bookmarks: 0,
          isBookmarked: false,
          shares: 0,
          comments: postComments,
        };
      });

      setPosts(mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  };

  /*
   * ============================================================
   * CONVERSATIONS + MESSAGES
   * ============================================================
   */
  const loadConversations = async (userId) => {
    if (!userId) {
      setConversations([]);
      setActiveChatId(null);
      return;
    }

    try {
      const { data: memberships, error: memberError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userId);

      if (memberError) throw memberError;

      const conversationIds = (memberships || []).map((m) => m.conversation_id);

      if (!conversationIds.length) {
        setConversations([]);
        setActiveChatId(null);
        return;
      }

      const { data: memberRows, error: allMemberError } = await supabase
        .from('conversation_members')
        .select('conversation_id, user_id')
        .in('conversation_id', conversationIds);

      if (allMemberError) throw allMemberError;

      const otherUserIds = [
        ...new Set(
          (memberRows || [])
            .filter((m) => m.user_id !== userId)
            .map((m) => m.user_id)
        ),
      ];

      let profiles = [];
      if (otherUserIds.length) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_image')
          .in('id', otherUserIds);

        if (!error) profiles = data || [];
      }

      const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

      const { data: messageRows, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true });

      if (messageError) throw messageError;

      const mapped = conversationIds.map((conversationId) => {
        const participant = (memberRows || []).find(
          (m) => m.conversation_id === conversationId && m.user_id !== userId
        );

        const other = profileMap[participant?.user_id];
        const msgs = (messageRows || []).filter(
          (m) => m.conversation_id === conversationId
        );

        const last = msgs[msgs.length - 1];

        return {
          id: conversationId,
          user: {
            name: other?.full_name || other?.username || 'User',
            avatar: other?.profile_image || '',
            online: false,
            status: 'Offline',
            userId: participant?.user_id || null,
          },
          unread: 0,
          lastMessage: last?.content || '',
          lastTime: last ? getTimeText(last.created_at) : '',
          messages: msgs.map((m) => ({
            id: m.id,
            sender: m.sender_id === userId ? 'me' : 'them',
            text: m.content || '',
            time: getTimeText(m.created_at),
            senderId: m.sender_id,
            createdAt: m.created_at,
          })),
        };
      });

      setConversations(mapped);
      setActiveChatId((prev) =>
        prev && mapped.some((c) => c.id === prev) ? prev : mapped[0]?.id || null
      );
    } catch (err) {
      console.warn('[AI Studio] loadConversations remote error, falling back to local mock data:', err);
      const memberships = getLocalDataFallback('conversation_members').filter(m => m.user_id === userId);
      const conversationIds = memberships.map(m => m.conversation_id);

      if (!conversationIds.length) {
        setConversations([]);
        setActiveChatId(null);
        return;
      }

      const memberRows = getLocalDataFallback('conversation_members').filter(m => conversationIds.includes(m.conversation_id));
      const profilesList = getLocalDataFallback('profiles');
      const profileMap = Object.fromEntries(profilesList.map((p) => [p.id, p]));
      const messageRows = getLocalDataFallback('messages').filter(m => conversationIds.includes(m.conversation_id));

      const mapped = conversationIds.map((conversationId) => {
        const participant = memberRows.find(
          (m) => m.conversation_id === conversationId && m.user_id !== userId
        );

        const other = profileMap[participant?.user_id];
        const msgs = messageRows
          .filter((m) => m.conversation_id === conversationId)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const last = msgs[msgs.length - 1];

        return {
          id: conversationId,
          user: {
            name: other?.full_name || other?.username || 'User',
            avatar: other?.profile_image || '',
            online: participant?.user_id === 'user_gemini_ai' ? true : Math.random() > 0.5,
            status: participant?.user_id === 'user_gemini_ai' ? 'Active now' : 'Offline',
            userId: participant?.user_id || null,
          },
          unread: 0,
          lastMessage: last?.content || '',
          lastTime: last ? getTimeText(last.created_at) : '',
          messages: msgs.map((m) => ({
            id: m.id,
            sender: m.sender_id === userId ? 'me' : 'them',
            text: m.content || '',
            time: getTimeText(m.created_at),
            senderId: m.sender_id,
            createdAt: m.created_at,
          })),
        };
      });

      setConversations(mapped);
      setActiveChatId((prev) =>
        prev && mapped.some((c) => c.id === prev) ? prev : mapped[0]?.id || null
      );
    }
  };

  /*
   * ============================================================
   * FRIEND REQUESTS & FRIENDS LIST
   * ============================================================
   */
  const loadFriends = async (userId) => {
    if (!userId) {
      setFriendsList([]);
      return;
    }

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

      const formattedFriends = (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || profile.username || 'User',
        username: profile.username || '',
        avatar: profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.username || 'User')}&background=4f46e5&color=fff&size=256`,
        bio: profile.bio || '',
        role: profile.bio || 'ConnectBD User',
        online: profile.id === 'user_gemini_ai' ? true : Math.random() > 0.4,
      }));

      setFriendsList(formattedFriends);
    } catch (err) {
      console.warn('[AI Studio] loadFriends remote error, falling back to local mock data:', err);
      const data = getLocalDataFallback('friend_requests').filter(r => r.status === 'accepted' && (r.sender_id === userId || r.receiver_id === userId));
      
      const friendIds = [
        ...new Set(
          data
            .map((request) =>
              request.sender_id === userId ? request.receiver_id : request.sender_id
            )
            .filter(Boolean)
        ),
      ];

      const profilesList = getLocalDataFallback('profiles');
      const profiles = profilesList.filter(p => friendIds.includes(p.id));

      const formattedFriends = profiles.map((profile) => ({
        id: profile.id,
        name: profile.full_name || profile.username || 'User',
        username: profile.username || '',
        avatar: profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.username || 'User')}&background=4f46e5&color=fff&size=256`,
        bio: profile.bio || '',
        role: profile.bio || 'ConnectBD User',
        online: profile.id === 'user_gemini_ai' ? true : Math.random() > 0.4,
      }));

      setFriendsList(formattedFriends);
    }
  };

  const loadFriendRequests = async (userId) => {
    if (!userId) {
      setFriendRequests([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const senderIds = [...new Set((data || []).map((r) => r.sender_id))];

      let profiles = [];
      if (senderIds.length) {
        const result = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_image, bio')
          .in('id', senderIds);

        if (!result.error) profiles = result.data || [];
      }

      const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

      setFriendRequests(
        (data || []).map((r) => {
          const p = profileMap[r.sender_id];
          return {
            id: r.id,
            senderId: r.sender_id,
            receiverId: r.receiver_id,
            name: p?.full_name || p?.username || 'User',
            avatar: p?.profile_image || '',
            mutuals: 0,
            role: p?.bio || '',
          };
        })
      );
    } catch (err) {
      console.warn('[AI Studio] loadFriendRequests remote error, falling back to local mock data:', err);
      const requestsList = getLocalDataFallback('friend_requests').filter(r => r.receiver_id === userId && r.status === 'pending');
      const profilesList = getLocalDataFallback('profiles');
      const profileMap = Object.fromEntries(profilesList.map((p) => [p.id, p]));

      setFriendRequests(
        requestsList.map((r) => {
          const p = profileMap[r.sender_id];
          return {
            id: r.id,
            senderId: r.sender_id,
            receiverId: r.receiver_id,
            name: p?.full_name || p?.username || 'User',
            avatar: p?.profile_image || '',
            mutuals: 0,
            role: p?.bio || '',
          };
        })
      );
    }
  };

  /*
   * ============================================================
   * ALL ACCOUNT-SCOPED DATA
   * ============================================================
   */
  const loadUserData = async (userId) => {
    if (!userId) return;

    setDataLoading(true);
    try {
      await Promise.all([
        loadNotifications(userId),
        loadPosts(userId),
        loadConversations(userId),
        loadFriendRequests(userId),
        loadFriends(userId),
      ]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady || !currentUser.id) return;
    loadUserData(currentUser.id);
  }, [authReady, currentUser.id]);

  /*
   * ============================================================
   * REALTIME
   * ============================================================
   */
  useEffect(() => {
    if (!authReady || !currentUser.id) return;

    const userId = currentUser.id;

    const notificationChannel = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await loadNotifications(userId);
        }
      )
      .subscribe();

    const messageChannel = supabase
      .channel(`messages-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          if (payload.new?.sender_id === userId) return;
          await loadConversations(userId);
          await loadNotifications(userId);
        }
      )
      .subscribe();

    const postChannel = supabase
      .channel(`posts-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        async () => {
          await loadPosts(userId);
        }
      )
      .subscribe();

    const requestChannel = supabase
      .channel(`requests-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        async () => {
          await loadFriendRequests(userId);
          await loadNotifications(userId);
        }
      )
      .subscribe();

    /*
     * Small fallback refresh so the UI still updates if realtime
     * is not enabled for one of the tables.
     */
    const timer = setInterval(() => {
      loadNotifications(userId);
      loadConversations(userId);
      loadFriendRequests(userId);
      loadFriends(userId);
    }, 5000);

    return () => {
      clearInterval(timer);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(postChannel);
      supabase.removeChannel(requestChannel);
    };
  }, [authReady, currentUser.id]);

  /*
   * ============================================================
   * POST HANDLERS
   * ============================================================
   */
  const handleLikePost = async (postId) => {
    if (!currentUser.id) return;

    const existing = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (existing.error) {
      console.error('Like check error:', existing.error);
      return;
    }

    if (existing.data) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existing.data.id);

      if (error) {
        console.error('Unlike error:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
        });

      if (error) {
        console.error('Like error:', error);
        return;
      }
    }

    await loadPosts(currentUser.id);
  };

  const handleBookmarkPost = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isBookmarked: !post.isBookmarked,
              bookmarks: post.isBookmarked
                ? Math.max(0, post.bookmarks - 1)
                : post.bookmarks + 1,
            }
          : post
      )
    );
  };

  const handleAddComment = async (postId, commentText) => {
    if (!currentUser.id || !commentText.trim()) return;

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      content: commentText.trim(),
    });

    if (error) {
      console.error('Comment error:', error);
      return;
    }

    await loadPosts(currentUser.id);
  };

  const handleCreatePost = async (newPostData) => {
    if (!currentUser.id || !newPostData?.content?.trim()) return;

    const { error } = await supabase.from('posts').insert({
      user_id: currentUser.id,
      content: newPostData.content.trim(),
      image_url: newPostData.image || null,
    });

    if (error) {
      console.error('Create post error:', error);
      return;
    }

    setIsPostModalOpen(false);
    await loadPosts(currentUser.id);
  };

  /*
   * ============================================================
   * MESSAGE HANDLER
   * ============================================================
   */
  const handleSendMessage = async (chatId, text) => {
    if (!currentUser.id || !chatId || !text.trim()) return;

    const conversation = conversations.find((c) => c.id === chatId);
    const receiverId = conversation?.user?.userId;

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: chatId,
        sender_id: currentUser.id,
        content: text.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Send message error:', error);
      return;
    }

    /*
     * Create a notification for the other account.
     */
    if (receiverId) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'message',
          reference_id: message.id,
          is_read: false,
        });

      if (notificationError) {
        console.error('Message notification error:', notificationError);
      }
    }

    await loadConversations(currentUser.id);
  };

  /*
   * ============================================================
   * FRIEND REQUESTS
   * ============================================================
   */
  const handleSendFriendRequest = async (userId) => {
    if (!currentUser.id || !userId || userId === currentUser.id) return;

    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id, status')
      .eq('sender_id', currentUser.id)
      .eq('receiver_id', userId)
      .maybeSingle();

    if (existing) return;

    const { data: request, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: currentUser.id,
        receiver_id: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Friend request error:', error);
      return;
    }

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'friend_request',
        reference_id: request.id,
        is_read: false,
      });

    if (notificationError) {
      console.error('Friend request notification error:', notificationError);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!currentUser.id) return;

    const { data: request, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('receiver_id', currentUser.id)
      .maybeSingle();

    if (error || !request) {
      console.error('Request load error:', error);
      return;
    }

    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) {
      console.error('Accept request error:', updateError);
      return;
    }

    await loadFriendRequests(currentUser.id);
  };

  const handleDeclineRequest = async (requestId) => {
    if (!currentUser.id) return;

    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)
      .eq('receiver_id', currentUser.id);

    if (error) {
      console.error('Decline request error:', error);
      return;
    }

    await loadFriendRequests(currentUser.id);
  };

  /*
   * ============================================================
   * NOTIFICATION HANDLERS
   * ============================================================
   */
  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser.id) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all notifications read error:', error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkNotificationRead = async (notifId) => {
    if (!currentUser.id) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Mark notification read error:', error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  /*
   * ============================================================
   * UI HANDLERS
   * ============================================================
   */
  const handleToggleJoinGroup = (groupId) => {
    setGroupsList((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              isJoined: !g.isJoined,
              members: g.isJoined ? Math.max(0, g.members - 1) : g.members + 1,
            }
          : g
      )
    );
  };

  const handleCreateGroup = (newGroup) => {
    const created = {
      id: `local_group_${Date.now()}`,
      name: newGroup.name,
      category: newGroup.category || 'General',
      description: newGroup.description || '',
      members: 1,
      postsPerDay: '1+',
      cover:
        newGroup.cover ||
        'https://images.unsplash.com/photo-1555066931-4365d14babdf9?auto=format&fit=crop&w=800&q=80',
      isPrivate: false,
      isJoined: true,
    };

    setGroupsList((prev) => [created, ...prev]);
  };

  const handleBuyProduct = (productId) => {
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isPurchased: !p.isPurchased } : p
      )
    );
  };

  const handleCreateProduct = (newProd) => {
    const created = {
      id: `local_product_${Date.now()}`,
      title: newProd.title,
      category: newProd.category || 'Digital Assets',
      price: newProd.price || 19,
      rating: '5.0',
      seller: currentUser.name,
      sellerAvatar: currentUser.avatar,
      description: newProd.description || '',
      image: newProd.image || '',
      isPurchased: true,
    };

    setProductsList((prev) => [created, ...prev]);
  };

  const handleFollowCreator = (creatorName) => {
    setFollowedCreators((prev) =>
      prev.includes(creatorName)
        ? prev.filter((c) => c !== creatorName)
        : [...prev, creatorName]
    );
  };

  const handleCreateCollection = (label) => {
    if (!label.trim()) return;
    setCollectionsList((prev) => [
      ...prev,
      { id: `col_${Date.now()}`, label: label.trim() },
    ]);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return;
    }

    setCurrentUser(emptyUser);
    setPosts([]);
    setConversations([]);
    setFriendRequests([]);
    setFriendsList([]);
    setNotifications([]);
    setActiveChatId(null);
  };

  /*
   * Compatibility aliases:
   * Some existing components may use these names.
   */
  const sendFriendRequest = handleSendFriendRequest;
  const logout = handleLogout;

  const unreadNotifCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        refreshCurrentUser,
        authReady,
        dataLoading,

        stories,
        setStories,
        activeStory,
        setActiveStory,
        isStoryModalOpen,
        setIsStoryModalOpen,
        storyViews,
        handleCreateStory,
        recordStoryView,

        posts,
        setPosts,
        groupsList,
        setGroupsList,
        productsList,
        setProductsList,

        conversations,
        setConversations,
        activeChatId,
        setActiveChatId,

        friendRequests,
        setFriendRequests,
        friendsList,
        setFriendsList,

        notifications,
        setNotifications,
        unreadNotifCount,

        followedCreators,
        collectionsList,

        isPostModalOpen,
        setIsPostModalOpen,
        searchQuery,
        setSearchQuery,

        handleLikePost,
        handleBookmarkPost,
        handleAddComment,
        handleCreatePost,

        handleSendMessage,

        handleSendFriendRequest,
        sendFriendRequest,
        handleAcceptRequest,
        handleDeclineRequest,

        handleToggleJoinGroup,
        handleCreateGroup,
        handleBuyProduct,
        handleCreateProduct,

        handleMarkAllNotificationsRead,
        handleMarkNotificationRead,

        handleFollowCreator,
        handleCreateCollection,

        handleLogout,
        logout,

        reloadAllData: () => currentUser.id && loadUserData(currentUser.id),
        reloadPosts: () => currentUser.id && loadPosts(currentUser.id),
        reloadMessages: () => currentUser.id && loadConversations(currentUser.id),
        reloadNotifications: () => currentUser.id && loadNotifications(currentUser.id),
        reloadFriendRequests: () =>
          currentUser.id && loadFriendRequests(currentUser.id),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
