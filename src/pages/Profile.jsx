import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Camera,
  Mail,
  User,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  AtSign,
  Upload,
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { refreshCurrentUser } = useApp();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    profile_image: '',
  });

  const [previewImage, setPreviewImage] = useState('');

  const [message, setMessage] = useState({
    type: '',
    text: '',
  });

  // ==========================================
  // LOAD CURRENT USER + PROFILE
  // ==========================================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        // Soft fallback to AppContext profile for demo mode
        return;
      }

      setUser(currentUser);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);

        setForm({
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          profile_image: data.profile_image || '',
        });

        setPreviewImage(data.profile_image || '');
      }
    } catch (error) {
      console.log('Profile loading fallback mode active');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DEFAULT AVATAR
  // ==========================================
  const getDefaultAvatar = (name = 'User') => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=2563eb&color=fff&size=256`;
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const openEditProfile = () => {
    setMessage({
      type: '',
      text: '',
    });

    setForm({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      profile_image: profile?.profile_image || '',
    });

    setPreviewImage(profile?.profile_image || '');

    setShowEdit(true);
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Name change হলে default preview update
    if (name === 'full_name' && !form.profile_image) {
      setPreviewImage('');
    }
  };

  // ==========================================
  // UPLOAD PROFILE IMAGE
  // ==========================================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      if (!user?.id) {
        throw new Error('No logged-in user found. Please log in again.');
      }

      // File type check
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      // 5 MB limit
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5 MB.');
      }

      setUploading(true);
      setMessage({ type: '', text: '' });

      // Keep the original extension when possible.
      const fileExt =
        file.name.split('.').pop()?.toLowerCase() || 'jpg';

      // Unique path for every upload.
      const filePath = `${user.id}/profile-${Date.now()}.${fileExt}`;

      // ----------------------------------------------------------
      // 1. Upload image to Supabase Storage
      // ----------------------------------------------------------
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(
          `Image upload failed: ${uploadError.message}`
        );
      }

      // ----------------------------------------------------------
      // 2. Get public URL
      // ----------------------------------------------------------
      const {
        data: publicUrlData,
      } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          'Image uploaded, but the public image URL could not be created.'
        );
      }

      // ----------------------------------------------------------
      // 3. IMPORTANT: save image URL immediately to profiles table
      //    This means the user does NOT have to press Save Changes
      //    just to change the profile picture.
      // ----------------------------------------------------------
      const {
        data: updatedProfile,
        error: profileUpdateError,
      } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (profileUpdateError) {
        console.error(
          'Profile image database update error:',
          profileUpdateError
        );

        throw new Error(
          `Image uploaded, but profile could not be updated: ${profileUpdateError.message}`
        );
      }

      if (!updatedProfile) {
        throw new Error(
          'Image uploaded, but no profile row was updated.'
        );
      }

      // ----------------------------------------------------------
      // 4. Update local UI immediately
      // ----------------------------------------------------------
      setProfile(updatedProfile);

      setForm((previous) => ({
        ...previous,
        profile_image: publicUrl,
      }));

      setPreviewImage(publicUrl);

      // Update AppContext so Navbar/Sidebar/etc. also get the new photo.
      try {
        await refreshCurrentUser();
      } catch (refreshError) {
        console.error(
          'Current user refresh error:',
          refreshError
        );
      }

      setMessage({
        type: 'success',
        text: 'Profile picture updated successfully!',
      });
    } catch (error) {
      console.error('Image upload error:', error);

      setMessage({
        type: 'error',
        text:
          error?.message ||
          'Failed to upload profile picture.',
      });
    } finally {
      setUploading(false);

      // Reset file input so the same image can be selected again.
      e.target.value = '';
    }
  };


  // ==========================================
  // SAVE PROFILE
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    if (!form.full_name.trim()) {
      setMessage({
        type: 'error',
        text: 'Full name cannot be empty.',
      });

      return;
    }

    if (!form.username.trim()) {
      setMessage({
        type: 'error',
        text: 'Username cannot be empty.',
      });

      return;
    }

    try {
      setSaving(true);

      setMessage({
        type: '',
        text: '',
      });

      const updatedData = {
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        bio: form.bio.trim(),
        profile_image: form.profile_image.trim(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase profile update error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Profile was not updated. Check your profile ID and RLS policy.');
      }

      // Update UI
      setProfile(data);

      // Keep the global AppContext user in sync.
      try {
        await refreshCurrentUser();
      } catch (refreshError) {
        console.error(
          'Current user refresh error:',
          refreshError
        );
      }

      setForm({
        full_name: data.full_name || '',
        username: data.username || '',
        bio: data.bio || '',
        profile_image: data.profile_image || '',
      });

      setPreviewImage(data.profile_image || '');

      setShowEdit(false);

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
    } catch (error) {
      console.error('Profile update error:', error);

      let errorMessage =
        error.message || 'Failed to update profile.';

      // Duplicate username
      if (error.code === '23505') {
        errorMessage = 'This username is already taken.';
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />

          <p className="text-gray-500 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROFILE AVATAR
  // ==========================================
  const profileAvatar =
    profile?.profile_image ||
    getDefaultAvatar(profile?.full_name || 'User');

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">

      <div className="max-w-4xl mx-auto">

        {/* ==================================
            SUCCESS / ERROR MESSAGE
        ================================== */}
        {message.text && (
          <div
            className={`mb-5 rounded-xl px-4 py-3 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        {/* ==================================
            PROFILE CARD
        ================================== */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

          {/* COVER */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">

            <div className="absolute inset-0 opacity-20">

              <div className="absolute w-48 h-48 rounded-full bg-white -top-20 -right-10" />

              <div className="absolute w-32 h-32 rounded-full bg-white bottom-0 left-10" />

            </div>

          </div>

          {/* PROFILE BODY */}
          <div className="px-6 md:px-10 pb-8">

            {/* AVATAR */}
            <div className="-mt-20 relative mb-5">

              <div className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-lg">

                <img
                  src={profileAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />

              </div>

              {/* CAMERA BUTTON */}
              <button
                onClick={openEditProfile}
                className="absolute bottom-2 left-28 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition"
                title="Change profile picture"
              >
                <Camera className="w-5 h-5" />
              </button>

            </div>

            {/* NAME + EDIT */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

              <div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile?.full_name || 'Your Name'}
                </h1>

                <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400">

                  <AtSign className="w-4 h-4" />

                  <span>
                    {profile?.username || 'username'}
                  </span>

                </div>

              </div>

              <button
                onClick={openEditProfile}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
              >
                <Edit3 className="w-4 h-4" />

                Edit Profile
              </button>

            </div>

            {/* BIO */}
            <div className="mt-6">

              <p className="text-gray-700 dark:text-gray-300 text-base leading-7">
                {profile?.bio || 'No bio added yet.'}
              </p>

            </div>

            {/* EMAIL + JOINED */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">

              {user?.email && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">

                  <Mail className="w-4 h-4" />

                  <span>{user.email}</span>

                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">

                <Calendar className="w-4 h-4" />

                <span>
                  Joined{' '}
                  {user?.created_at
                    ? new Date(
                        user.created_at
                      ).toLocaleDateString()
                    : 'Recently'}
                </span>

              </div>

            </div>

            {/* STATS */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-3 text-center">

              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </div>

                <div className="text-sm text-gray-500">
                  Posts
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </div>

                <div className="text-sm text-gray-500">
                  Friends
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </div>

                <div className="text-sm text-gray-500">
                  Following
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ==========================================
          EDIT PROFILE MODAL
      =========================================== */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!saving && !uploading) {
                setShowEdit(false);
              }
            }}
          />

          {/* MODAL */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">

            {/* HEADER */}
            <div className="sticky top-0 z-10 px-6 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Profile
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update your ConnectBD profile
                </p>

              </div>

              <button
                onClick={() => {
                  if (!saving && !uploading) {
                    setShowEdit(false);
                  }
                }}
                disabled={saving || uploading}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSave}
              className="p-6 space-y-5"
            >

              {/* =================================
                  PROFILE PICTURE
              ================================= */}
              <div className="flex flex-col items-center">

                {/* IMAGE */}
                <div className="relative">

                  <img
                    src={
                      previewImage ||
                      getDefaultAvatar(
                        form.full_name || 'User'
                      )
                    }
                    alt="Profile preview"
                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-md"
                  />

                  {/* CAMERA OVERLAY */}
                  <label
                    className={`absolute bottom-0 right-0 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-lg ${
                      uploading
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }`}
                  >

                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading || saving}
                    />

                  </label>

                </div>

                {/* UPLOAD BUTTON */}
                <label
                  className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                    uploading
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  }`}
                >

                  <Upload className="w-4 h-4" />

                  {uploading
                    ? 'Uploading...'
                    : 'Change Photo'}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading || saving}
                  />

                </label>

                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG or WEBP • Maximum 5 MB
                </p>

              </div>

              {/* =================================
                  FULL NAME
              ================================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>

                <div className="relative">

                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />

                </div>

              </div>

              {/* =================================
                  USERNAME
              ================================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>

                <div className="relative">

                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />

                </div>

              </div>

              {/* =================================
                  BIO
              ================================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell people about yourself..."
                  rows={4}
                  maxLength={160}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={saving}
                />

                <div className="text-right text-xs text-gray-400 mt-1">
                  {form.bio.length}/160
                </div>

              </div>

              {/* =================================
                  BUTTONS
              ================================= */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  disabled={saving || uploading}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium flex items-center justify-center gap-2 transition"
                >

                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}