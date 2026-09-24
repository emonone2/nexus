import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Globe,
  MapPin,
  Briefcase,
  Smile,
  Shield,
  Lock,
  Unlock,
  Search,
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { refreshCurrentUser, posts, friendsList, followedCreators } = useApp();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    profile_image: '',
    cover_image: '',
    location: '',
    designation: '',
    website: '',
    custom_status: '',
    twitter_handle: '',
    github_handle: '',
  });

  const [previewImage, setPreviewImage] = useState('');
  const [previewCover, setPreviewCover] = useState('');

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
        return;
      }

      setUser(currentUser);

      let data = null;
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!error && profileData) {
          data = profileData;
        } else {
          console.warn('Remote profiles load failed, using local/mock fallback:', error);
        }
      } catch (e) {
        console.warn('Remote profiles select threw error, using local/mock fallback:', e);
      }

      // If remote profile doesn't exist, build a default one
      if (!data) {
        const mockProfiles = JSON.parse(localStorage.getItem('nexus_db_profiles') || '[]');
        const existingMock = mockProfiles.find(p => p.id === currentUser.id || p.id === 'me');
        data = {
          id: currentUser.id,
          username: currentUser.email?.split('@')[0] || 'nexus_explorer',
          full_name: currentUser.user_metadata?.full_name || 'Nexus Explorer',
          profile_image: existingMock?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
          cover_image: existingMock?.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          bio: existingMock?.bio || 'Exploring the next generation of social interaction. Built on Nexus.',
          location: existingMock?.location || 'Metaverse',
          created_at: existingMock?.created_at || new Date().toISOString(),
        };
      }

      // Load custom local extensions if any exist
      let extendedData = { ...data };
      try {
        const localExt = localStorage.getItem(`nexus_profile_ext_${currentUser.id}`);
        if (localExt) {
          extendedData = { ...extendedData, ...JSON.parse(localExt) };
        }
      } catch (e) {
        console.error("Local profile extension parsing failed:", e);
      }

      setProfile(extendedData);

      setForm({
        full_name: extendedData.full_name || '',
        username: extendedData.username || '',
        bio: extendedData.bio || '',
        profile_image: extendedData.profile_image || '',
        cover_image: extendedData.cover_image || '',
        location: extendedData.location || '',
        designation: extendedData.designation || '',
        website: extendedData.website || '',
        custom_status: extendedData.custom_status || '',
        twitter_handle: extendedData.twitter_handle || '',
        github_handle: extendedData.github_handle || '',
      });

      setPreviewImage(extendedData.profile_image || '');
      setPreviewCover(extendedData.cover_image || '');
    } catch (error) {
      console.log('Profile loading fallback mode active:', error);
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
      cover_image: profile?.cover_image || '',
      location: profile?.location || '',
      designation: profile?.designation || '',
      website: profile?.website || '',
      custom_status: profile?.custom_status || '',
      twitter_handle: profile?.twitter_handle || '',
      github_handle: profile?.github_handle || '',
    });

    setPreviewImage(profile?.profile_image || '');
    setPreviewCover(profile?.cover_image || '');

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

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5 MB.');
      }

      setUploading(true);
      setMessage({ type: '', text: '' });

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/profile-${Date.now()}.${fileExt}`;

      let publicUrl = '';
      try {
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        publicUrl = publicUrlData?.publicUrl;
        
        if (!publicUrl) {
          throw new Error('Public image URL could not be created.');
        }
      } catch (storageError) {
        console.warn('Supabase storage upload failed, falling back to local base64:', storageError);
        publicUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      let updatedProfile = null;
      try {
        const { data: updated, error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ profile_image: publicUrl })
          .eq('id', user.id)
          .select()
          .single();

        if (profileUpdateError) {
          throw profileUpdateError;
        }
        updatedProfile = updated;
      } catch (updateError) {
        console.warn('Profiles table update failed, saving in local extensions:', updateError);
        const localExt = JSON.parse(localStorage.getItem(`nexus_profile_ext_${user.id}`) || '{}');
        localExt.profile_image = publicUrl;
        localStorage.setItem(`nexus_profile_ext_${user.id}`, JSON.stringify(localExt));
        
        updatedProfile = {
          ...profile,
          profile_image: publicUrl
        };
      }

      setProfile(updatedProfile);
      setForm((previous) => ({
        ...previous,
        profile_image: publicUrl,
      }));
      setPreviewImage(publicUrl);

      try {
        await refreshCurrentUser();
      } catch (refreshError) {
        console.error('Current user refresh error:', refreshError);
      }

      setMessage({
        type: 'success',
        text: 'Profile picture updated successfully!',
      });
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage({
        type: 'error',
        text: error?.message || 'Failed to upload profile picture.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ==========================================
  // UPLOAD COVER IMAGE
  // ==========================================
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      if (!user?.id) {
        throw new Error('No logged-in user found. Please log in again.');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5 MB.');
      }

      setUploadingCover(true);
      setMessage({ type: '', text: '' });

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/cover-${Date.now()}.${fileExt}`;

      let publicUrl = '';
      try {
        const { error: uploadError } = await supabase.storage
          .from('cover-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('cover-photos')
          .getPublicUrl(filePath);

        publicUrl = publicUrlData?.publicUrl;
        
        if (!publicUrl) {
          throw new Error('Public cover URL could not be created.');
        }
      } catch (storageError) {
        console.warn('Supabase cover storage upload failed, falling back to local base64:', storageError);
        publicUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      let updatedProfile = null;
      try {
        const { data: updated, error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ cover_image: publicUrl })
          .eq('id', user.id)
          .select()
          .single();

        if (profileUpdateError) {
          throw profileUpdateError;
        }
        updatedProfile = updated;
      } catch (updateError) {
        console.warn('Profiles table cover update failed, saving in local extensions:', updateError);
        const localExt = JSON.parse(localStorage.getItem(`nexus_profile_ext_${user.id}`) || '{}');
        localExt.cover_image = publicUrl;
        localStorage.setItem(`nexus_profile_ext_${user.id}`, JSON.stringify(localExt));
        
        updatedProfile = {
          ...profile,
          cover_image: publicUrl
        };
      }

      setProfile(updatedProfile);
      setForm((previous) => ({
        ...previous,
        cover_image: publicUrl,
      }));
      setPreviewCover(publicUrl);

      try {
        await refreshCurrentUser();
      } catch (refreshError) {
        console.error('Current user refresh error:', refreshError);
      }

      setMessage({
        type: 'success',
        text: 'Cover picture updated successfully!',
      });
    } catch (error) {
      console.error('Cover upload error:', error);
      setMessage({
        type: 'error',
        text: error?.message || 'Failed to upload cover picture.',
      });
    } finally {
      setUploadingCover(false);
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
        cover_image: form.cover_image.trim(),
        location: form.location.trim(),
        designation: form.designation.trim(),
        website: form.website.trim(),
        custom_status: form.custom_status.trim(),
        twitter_handle: form.twitter_handle.trim(),
        github_handle: form.github_handle.trim(),
      };

      let savedProfileData = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        savedProfileData = data;
      } catch (dbError) {
        console.warn('Supabase profiles update failed because of custom columns, retrying with standard columns:', dbError);
        
        // Save the advanced custom fields in local extensions
        const advancedFields = {
          cover_image: form.cover_image.trim(),
          location: form.location.trim(),
          designation: form.designation.trim(),
          website: form.website.trim(),
          custom_status: form.custom_status.trim(),
          twitter_handle: form.twitter_handle.trim(),
          github_handle: form.github_handle.trim(),
        };
        localStorage.setItem(`nexus_profile_ext_${user.id}`, JSON.stringify(advancedFields));

        // Save ONLY basic guaranteed fields to Supabase profiles table
        const basicData = {
          full_name: form.full_name.trim(),
          username: form.username.trim().toLowerCase(),
          bio: form.bio.trim(),
          profile_image: form.profile_image.trim(),
        };
        
        let basicSaved = null;
        try {
          const { data: basicDataResult, error: basicError } = await supabase
            .from('profiles')
            .update(basicData)
            .eq('id', user.id)
            .select()
            .single();

          if (basicError) {
            throw basicError;
          }
          basicSaved = basicDataResult;
        } catch (basicErr) {
          console.warn('Supabase basic profile update also failed. Saving everything locally:', basicErr);
          const fullLocalData = {
            id: user.id,
            ...basicData,
            ...advancedFields
          };
          // Save in general profiles local db array too
          try {
            const localProfiles = JSON.parse(localStorage.getItem('nexus_db_profiles') || '[]');
            const updatedProfilesList = localProfiles.map(p => p.id === user.id ? { ...p, ...fullLocalData } : p);
            localStorage.setItem('nexus_db_profiles', JSON.stringify(updatedProfilesList));
          } catch (storageErr) {
            console.error('Failed to update local db list:', storageErr);
          }
          basicSaved = fullLocalData;
        }
        
        savedProfileData = {
          ...basicSaved,
          ...advancedFields
        };
      }

      setProfile(savedProfileData);

      try {
        await refreshCurrentUser();
      } catch (refreshError) {
        console.error('Current user refresh error:', refreshError);
      }

      setForm({
        full_name: savedProfileData.full_name || '',
        username: savedProfileData.username || '',
        bio: savedProfileData.bio || '',
        profile_image: savedProfileData.profile_image || '',
        cover_image: savedProfileData.cover_image || '',
        location: savedProfileData.location || '',
        designation: savedProfileData.designation || '',
        website: savedProfileData.website || '',
        custom_status: savedProfileData.custom_status || '',
        twitter_handle: savedProfileData.twitter_handle || '',
        github_handle: savedProfileData.github_handle || '',
      });

      setPreviewImage(savedProfileData.profile_image || '');
      setPreviewCover(savedProfileData.cover_image || '');

      setShowEdit(false);

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
    } catch (error) {
      console.error('Profile update error:', error);

      let errorMessage = error.message || 'Failed to update profile.';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profileAvatar =
    profile?.profile_image || getDefaultAvatar(profile?.full_name || 'User');

  const isProfileLockedLocally = profile?.id ? (localStorage.getItem(`nexus_profile_lock_${profile.id}`) === 'true') : false;
  const isProfileLocked = profile?.is_profile_locked || isProfileLockedLocally;

  const handleToggleProfileLock = async () => {
    if (!user?.id) return;
    const nextLocked = !isProfileLocked;
    try {
      localStorage.setItem(`nexus_profile_lock_${user.id}`, nextLocked ? 'true' : 'false');
      
      const localExt = JSON.parse(localStorage.getItem(`nexus_profile_ext_${user.id}`) || '{}');
      localExt.is_profile_locked = nextLocked;
      localStorage.setItem(`nexus_profile_ext_${user.id}`, JSON.stringify(localExt));
      
      try {
        const localProfiles = JSON.parse(localStorage.getItem('nexus_db_profiles') || '[]');
        const updatedProfilesList = localProfiles.map(p => p.id === user.id ? { ...p, is_profile_locked: nextLocked } : p);
        localStorage.setItem('nexus_db_profiles', JSON.stringify(updatedProfilesList));
      } catch (e) {
        console.error(e);
      }

      try {
        await supabase
          .from('profiles')
          .update({ is_profile_locked: nextLocked })
          .eq('id', user.id);
      } catch (remoteErr) {
        console.warn("Supabase profile lock update ignored (might lack column):", remoteErr);
      }

      setProfile(prev => ({ ...prev, is_profile_locked: nextLocked }));
      setMessage({
        type: 'success',
        text: nextLocked ? 'Your profile has been locked successfully!' : 'Your profile has been unlocked successfully!',
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Failed to update profile lock status.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] py-8 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* ==================================
            SUCCESS / ERROR MESSAGE
        ================================== */}
        {message.text && (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 flex items-center gap-3 border shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* ==================================
            PROFILE CARD
        ================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-lg border border-slate-200/50 dark:border-slate-800/40 overflow-hidden">
          {/* COVER PHOTO DISPLAY */}
          <div className="h-48 md:h-64 relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
            {profile?.cover_image ? (
              <img
                src={profile.cover_image || null}
                alt="Cover photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-48 h-48 rounded-full bg-white -top-20 -right-10" />
                <div className="absolute w-32 h-32 rounded-full bg-white bottom-0 left-10" />
              </div>
            )}

            {/* COVER UPLOAD CAMERA OVERLAY */}
            <label className="absolute top-4 right-4 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-lg cursor-pointer transition flex items-center gap-1.5 select-none">
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <span>{uploadingCover ? 'Uploading...' : 'Change Cover'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                disabled={uploadingCover || saving}
              />
            </label>
          </div>

          {/* PROFILE BODY */}
          <div className="px-6 md:px-10 pb-8 relative">
            {/* AVATAR */}
            <div className="-mt-20 relative mb-5 flex justify-between items-end">
              <div className="w-36 h-36 rounded-3xl border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xl relative group">
                <img
                  src={profileAvatar || null}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />

                {/* AVATAR CAMERA OVERLAY */}
                <label className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
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

              {/* FLOATING ACTION STATUS */}
              {profile?.custom_status && (
                <span className="mb-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs border border-indigo-500/20 shadow-sm flex items-center gap-1.5">
                  <Smile className="w-4 h-4" />
                  <span>{profile.custom_status}</span>
                </span>
              )}
            </div>

            {/* NAME + EDIT */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit'] flex items-center gap-2">
                  {profile?.full_name || 'Your Name'}
                </h1>

                {profile?.designation && (
                  <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{profile.designation}</span>
                  </p>
                )}

                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">
                  <AtSign className="w-4 h-4" />
                  <span>{profile?.username || 'username'}</span>
                </div>
              </div>

              <button
                onClick={openEditProfile}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-extrabold shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* BIO */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/60">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {profile?.bio || 'No bio added yet. Write something interesting about yourself.'}
              </p>
            </div>

            {/* PROFILE LOCK STATUS CARD */}
            <div className="mt-6 p-5 rounded-3xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isProfileLocked ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <Shield className={`w-6 h-6 ${isProfileLocked ? 'fill-current animate-pulse' : ''}`} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Profile Privacy Shield</span>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${isProfileLocked ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                      {isProfileLocked ? 'Locked' : 'Unlocked'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-md font-medium">
                    {isProfileLocked 
                      ? 'Your profile is locked like Facebook. Only accepted friends can view your bio, details, contact details, locations, and updates.' 
                      : 'Your profile is public. Anyone can see your full details and posts. Lock your profile to protect your personal privacy.'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleProfileLock}
                className={`py-2 px-4.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm border select-none transition-all duration-300 shrink-0 ${isProfileLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-transparent shadow-indigo-600/15 hover:shadow-lg'}`}
              >
                {isProfileLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isProfileLocked ? 'Unlock Profile' : 'Lock Profile'}</span>
              </button>
            </div>

            {/* EMAIL + JOINED + DETAILS */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-5">
              {user?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Joined{' '}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Recently'}
                </span>
              </div>

              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile?.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 hover:underline animate-fade-in"
                >
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>{profile.website}</span>
                </a>
              )}
            </div>

            {/* SOCIAL ACCOUNTS BAR */}
            {(profile?.twitter_handle || profile?.github_handle) && (
              <div className="mt-4 flex gap-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40 w-fit">
                {profile?.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profile.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-sky-500 transition-colors text-xs font-bold"
                  >
                    <svg className="w-4 h-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>@{profile.twitter_handle}</span>
                  </a>
                )}
                {profile?.twitter_handle && profile?.github_handle && <span className="text-slate-200 dark:text-slate-800">|</span>}
                {profile?.github_handle && (
                  <a
                    href={`https://github.com/${profile.github_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors text-xs font-bold"
                  >
                    <svg className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.441 1.087 3.035.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <span>{profile.github_handle}</span>
                  </a>
                )}
              </div>
            )}

            {/* STATS */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-3 text-center">
              <div className="p-2.5 rounded-2xl">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  {(posts || []).filter(p => p.userId === user?.id).length}
                </div>
                <div className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                  Posts
                </div>
              </div>

              <div 
                onClick={() => setShowFriendsModal(true)}
                className="cursor-pointer group hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 p-2.5 rounded-2xl transition border border-transparent hover:border-indigo-500/10"
                title="Click to view friends list"
              >
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-indigo-500 transition-colors">
                  {friendsList?.length || 0}
                </div>
                <div className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider flex items-center justify-center gap-1 group-hover:text-indigo-500 transition-colors">
                  <span>Friends</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  {(friendsList?.length || 0) + (followedCreators?.length || 0)}
                </div>
                <div className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                  Following
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            POSTS SECTION (New Feature added here!)
        ========================================== */}
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              My Posts
            </h2>
            <span className="text-xs font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/10">
              {(posts || []).filter(p => p.userId === user?.id).length} posts shared
            </span>
          </div>

          {(posts || []).filter(p => p.userId === user?.id).length > 0 ? (
            <div className="space-y-5">
              {(posts || []).filter(p => p.userId === user?.id).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-[32px] p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/40 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5" />
                </svg>
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-1">
                No posts yet
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                You haven't shared any updates yet. Go to the Home Feed to write your first post!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          EDIT PROFILE MODAL
      =========================================== */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!saving && !uploading && !uploadingCover) {
                setShowEdit(false);
              }
            }}
          />

          {/* MODAL */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/40 animate-scale-up">
            {/* HEADER */}
            <div className="sticky top-0 z-10 px-6 py-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  Edit Profile
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Update your ConnectBD profile information
                </p>
              </div>

              <button
                onClick={() => {
                  if (!saving && !uploading && !uploadingCover) {
                    setShowEdit(false);
                  }
                }}
                disabled={saving || uploading || uploadingCover}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* PROFILE IMAGE CONTROLS */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={previewImage || getDefaultAvatar(form.full_name || 'User')}
                    alt="Profile preview"
                    className="w-28 h-28 rounded-3xl object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
                  />

                  <label
                    className={`absolute bottom-0 right-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer shadow-lg transition ${
                      uploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4.5 h-4.5" />
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

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
                  Upload Avatar Image • Max 5 MB
                </p>
              </div>

              {/* DYNAMIC COVER PHOTO PREVIEW/SELECTION */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Cover Photo Upload
                </label>
                
                {previewCover && (
                  <div className="relative mb-3.5 h-24 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100">
                    <img src={previewCover} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, cover_image: '' }));
                        setPreviewCover('');
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer select-none">
                  {uploadingCover ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  ) : (
                    <Upload className="w-4 h-4 text-indigo-500" />
                  )}
                  <span>{uploadingCover ? 'Uploading...' : 'Choose Cover Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={uploadingCover || saving}
                  />
                </label>
              </div>

              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* USERNAME */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* DESIGNATION */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Professional Title / Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Fullstack Engineer / UI Designer"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* BIO */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell people about yourself..."
                  rows={4}
                  maxLength={160}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-all"
                  disabled={saving}
                />
                <div className="text-right text-[10px] text-slate-400 font-bold mt-1">
                  {form.bio.length}/160
                </div>
              </div>

              {/* CUSTOM STATUS */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Custom Status Emoji & Text
                </label>
                <div className="relative">
                  <Smile className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="custom_status"
                    value={form.custom_status}
                    onChange={handleChange}
                    placeholder="e.g. 👨‍💻 Coding / ☕ Coffee Break"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* WEBSITE */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                  Portfolio / Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="e.g. github.io/myportfolio"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* TWITTER & GITHUB HANDLES */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                    Twitter Handle
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <input
                      type="text"
                      name="twitter_handle"
                      value={form.twitter_handle}
                      onChange={handleChange}
                      placeholder="handle"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.441 1.087 3.035.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <input
                      type="text"
                      name="github_handle"
                      value={form.github_handle}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  disabled={saving || uploading || uploadingCover}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold text-sm transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading || uploadingCover}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15 hover:shadow-lg transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          FRIENDS LIST MODAL (New Feature)
      =========================================== */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFriendsModal(false)}
          />

          {/* MODAL BODY */}
          <div className="relative w-full max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/40 animate-scale-up overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  My Friends
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-bold">
                  {friendsList?.length || 0} total connections
                </p>
              </div>
              <button
                onClick={() => setShowFriendsModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEARCH */}
            {friendsList?.length > 0 && (
              <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/50 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search connections by name..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl text-xs sm:text-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar max-h-[50vh]">
              {friendsList?.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                    <User className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-1">
                    No friends yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed font-semibold">
                    Build your network by adding connections from the friends recommendation page.
                  </p>
                  <button
                    onClick={() => {
                      setShowFriendsModal(false);
                      navigate('/friends');
                    }}
                    className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow transition"
                  >
                    Find Connections
                  </button>
                </div>
              ) : (
                (() => {
                  const filtered = friendsList.filter(f => 
                    f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                    f.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                        No friends match "{friendSearchQuery}"
                      </div>
                    );
                  }

                  return filtered.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={friend.avatar || getDefaultAvatar(friend.name)}
                          alt={friend.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200/50 dark:border-slate-800/30"
                          onError={(e) => {
                            e.currentTarget.src = getDefaultAvatar(friend.name);
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {friend.name}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
                            @{friend.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setShowFriendsModal(false);
                            navigate(`/chat?userId=${friend.id}`);
                          }}
                          className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 rounded-xl transition cursor-pointer"
                          title="Send Message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setShowFriendsModal(false);
                            navigate(`/profile/${friend.id}`);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-extrabold rounded-xl transition cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
