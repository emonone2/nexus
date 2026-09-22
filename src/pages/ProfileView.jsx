import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function getDefaultAvatar(name = 'User') {
  const firstLetter = name.trim().charAt(0).toUpperCase() || 'U';

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" rx="100" fill="#4f46e5"/>
      <text
        x="100"
        y="112"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="80"
        fill="white"
      >
        ${firstLetter}
      </text>
    </svg>
  `)}`;
}

export default function ProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [friendStatus, setFriendStatus] = useState('none');

  const [loading, setLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ==========================================
  // LOAD CURRENT USER + PROFILE
  // ==========================================

  useEffect(() => {
    loadProfilePage();
  }, [userId]);

  async function loadProfilePage() {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      // Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      setCurrentUser(user);

      // If user opens his/her own profile
      if (user.id === userId) {
        navigate('/profile', { replace: true });
        return;
      }

      // Get selected user's profile
      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        setError('User profile not found.');
        return;
      }

      setProfile(profileData);

      // Get friendship status
      await loadFriendStatus(user.id, userId);
    } catch (err) {
      console.error('Profile page error:', err);
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LOAD FRIEND STATUS
  // ==========================================

  async function loadFriendStatus(myId, otherUserId) {
    try {
      const { data, error: requestError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${myId})`
        )
        .order('created_at', {
          ascending: false,
        })
        .limit(1);

      if (requestError) {
        console.error('Friend status error:', requestError);
        setFriendStatus('none');
        return;
      }

      if (!data || data.length === 0) {
        setFriendStatus('none');
        return;
      }

      const request = data[0];

      // Already friends
      if (request.status === 'accepted') {
        setFriendStatus('friends');
        return;
      }

      // Pending request
      if (request.status === 'pending') {
        setFriendStatus('pending');
        return;
      }

      // Rejected / cancelled / other
      setFriendStatus('none');
    } catch (err) {
      console.error(err);
      setFriendStatus('none');
    }
  }

  // ==========================================
  // SEND FRIEND REQUEST
  // ==========================================

  async function handleAddFriend() {
    if (!currentUser || !profile) return;

    try {
      setFriendLoading(true);
      setMessage('');

      // Double-check existing request
      const { data: existingRequest, error: existingError } =
        await supabase
          .from('friend_requests')
          .select('*')
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${currentUser.id})`
          )
          .order('created_at', {
            ascending: false,
          })
          .limit(1);

      if (existingError) {
        throw existingError;
      }

      if (existingRequest && existingRequest.length > 0) {
        const existing = existingRequest[0];

        if (existing.status === 'accepted') {
          setFriendStatus('friends');
          return;
        }

        if (existing.status === 'pending') {
          setFriendStatus('pending');
          return;
        }
      }

      // Create friend request
      const {
        data: request,
        error: requestError,
      } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUser.id,
          receiver_id: profile.id,
          status: 'pending',
        })
        .select()
        .single();

      if (requestError) {
        throw requestError;
      }

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          type: 'friend_request',
          reference_id: request.id,
          is_read: false,
        });

      if (notificationError) {
        console.error(
          'Notification creation failed:',
          notificationError
        );
      }

      setFriendStatus('pending');
      setMessage('Friend request sent!');
    } catch (err) {
      console.error('Add friend error:', err);

      setMessage(
        err.message || 'Failed to send friend request.'
      );
    } finally {
      setFriendLoading(false);
    }
  }

  // ==========================================
  // UNFRIEND CONNECTION
  // ==========================================

  async function handleUnfriend() {
    if (!currentUser || !profile) return;

    try {
      setFriendLoading(true);
      setMessage('');

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${currentUser.id})`
        );

      if (error) throw error;

      setFriendStatus('none');
      setMessage('Unfriended successfully.');
    } catch (err) {
      console.error('Unfriend error:', err);
      setMessage(err.message || 'Failed to unfriend.');
    } finally {
      setFriendLoading(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#080d1d] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#11182b] border border-gray-700 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">😕</div>

          <h2 className="text-xl font-bold mb-2">
            Profile Not Found
          </h2>

          <p className="text-gray-400 mb-6">
            {error || 'This profile does not exist.'}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROFILE DATA
  // ==========================================

  const profileAvatar =
    profile.profile_image ||
    getDefaultAvatar(profile.full_name || 'User');

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#080d1d] text-white px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ======================================
            BACK BUTTON
        ====================================== */}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>

        {/* ======================================
            PROFILE CARD
        ====================================== */}

        <div className="bg-[#11182b] border border-[#263451] rounded-3xl overflow-hidden">

          {/* Cover Area */}

          <div className="h-32 md:h-44 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Information */}

          <div className="px-5 md:px-8 pb-8">

            {/* Avatar */}

            <div className="-mt-16 md:-mt-20 relative mb-5">
              <img
                src={profileAvatar}
                alt={profile.full_name || 'Profile'}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#11182b] shadow-xl bg-indigo-600"
                onError={(e) => {
                  e.currentTarget.src = getDefaultAvatar(
                    profile.full_name || 'User'
                  );
                }}
              />
            </div>

            {/* Name + Username */}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.full_name || 'User'}
                </h1>

                <p className="text-gray-400 mt-1">
                  @{profile.username || 'username'}
                </p>
              </div>

              {/* Friend Button */}

              <div>
                {friendStatus === 'friends' && (
                  <button
                    onClick={handleUnfriend}
                    disabled={friendLoading}
                    className="px-6 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 font-semibold transition cursor-pointer"
                  >
                    {friendLoading ? 'Please wait...' : 'Unfriend'}
                  </button>
                )}

                {friendStatus === 'pending' && (
                  <button
                    disabled
                    className="px-6 py-3 rounded-xl bg-gray-700 text-gray-300 font-semibold cursor-not-allowed"
                  >
                    Pending
                  </button>
                )}

                {friendStatus === 'none' && (
                  <button
                    onClick={handleAddFriend}
                    disabled={friendLoading}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
                  >
                    {friendLoading
                      ? 'Sending...'
                      : '+ Add Friend'}
                  </button>
                )}
              </div>
            </div>

            {/* Message */}

            {message && (
              <div className="mt-5 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                {message}
              </div>
            )}

            {/* Divider */}

            <div className="border-t border-[#263451] my-7"></div>

            {/* About */}

            <div>
              <h2 className="text-lg font-bold mb-4">
                About
              </h2>

              {profile.bio ? (
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-gray-500">
                  This user hasn't added a bio yet.
                </p>
              )}
            </div>

            {/* Basic Info */}

            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">
                Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Username */}

                <div className="bg-[#0c1324] border border-[#263451] rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    Username
                  </p>

                  <p className="text-gray-200">
                    @{profile.username || 'Not available'}
                  </p>
                </div>

                {/* Full Name */}

                <div className="bg-[#0c1324] border border-[#263451] rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    Full Name
                  </p>

                  <p className="text-gray-200">
                    {profile.full_name || 'Not available'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ======================================
            POSTS SECTION
        ====================================== */}

        <div className="mt-6 bg-[#11182b] border border-[#263451] rounded-3xl p-6">

          <h2 className="text-xl font-bold mb-2">
            Posts
          </h2>

          <p className="text-gray-500">
            Posts from this user will appear here.
          </p>

        </div>

      </div>
    </div>
  );
}