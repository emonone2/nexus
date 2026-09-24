import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Flame, 
  Play, 
  Eye, 
  Heart, 
  Video,
  FileText,
  UserCheck,
  Check,
  Clock,
  Calendar,
  Plus,
  X,
  Users,
  Sparkles,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Explore() {
  const { setActiveStory, followedCreators, handleFollowCreator } = useApp();
  const [activeTab, setActiveTab] = useState('reels');
  const [searchQuery, setSearchQuery] = useState('');

  // Events & Registration States
  const [eventsList, setEventsList] = useState([]);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('Virtual Video Call 💻');
  const [eventCover, setEventCover] = useState('');

  const getCreatorId = (name) => {
    const mapping = {
      'Elena Rostova': 'user_elena_rostova',
      'Marcus Chen': 'user_marcus_chen',
      'Sarah Jenkins': 'user_sarah_jenkins',
      'David Kim': 'user_david_kim'
    };
    return mapping[name] || 'user_elena_rostova';
  };

  // Load and sync events from localStorage
  useEffect(() => {
    const initialEvents = [
      {
        id: 'ev_1',
        title: 'React 19 Server Actions Summit 💻',
        host: 'Elena Rostova',
        hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        description: 'An advanced deep dive into the React 19 architecture: learn Server Actions, useActionState, form mutations, and optimal Vite configuration with professional engineers.',
        date: 'Oct 14, 2026 • 7:00 PM GMT',
        location: 'Virtual Workshop Zoom 💻',
        attendees: 320,
        cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        isAttending: false
      },
      {
        id: 'ev_2',
        title: 'Yosemite Valley Wilderness Photowalk 🏔️',
        host: 'Marcus Chen',
        hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        description: 'Join a professional scenic photowalk and trail timelapse session along the epic Yosemite Valley loops. Gear, base base weights, and camera configuration will be discussed.',
        date: 'Nov 02, 2026 • 9:00 AM PST',
        location: 'Yosemite National Park Valley 🏔️',
        attendees: 85,
        cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        isAttending: false
      },
      {
        id: 'ev_3',
        title: 'Figma Auto-Layout & Variables Bootcamp 🎨',
        host: 'Sarah Connor',
        hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
        description: 'Learn modern layout systems in Figma: design tokens, variables, Auto-Layout wrap hacks, responsive flex grids, and clean design-to-code pipelines.',
        date: 'Oct 28, 2026 • 4:00 PM GMT',
        location: 'Figma Live Jam Event 🎨',
        attendees: 195,
        cover: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80',
        isAttending: false
      }
    ];

    const stored = localStorage.getItem('nexus_explore_events');
    if (stored) {
      try {
        setEventsList(JSON.parse(stored));
      } catch {
        setEventsList(initialEvents);
      }
    } else {
      setEventsList(initialEvents);
      localStorage.setItem('nexus_explore_events', JSON.stringify(initialEvents));
    }
  }, []);

  const handleToggleRSVP = (eventId) => {
    const updated = eventsList.map(e => {
      if (e.id === eventId) {
        const attending = !e.isAttending;
        return {
          ...e,
          isAttending: attending,
          attendees: attending ? e.attendees + 1 : Math.max(0, e.attendees - 1)
        };
      }
      return e;
    });

    setEventsList(updated);
    localStorage.setItem('nexus_explore_events', JSON.stringify(updated));

    const selected = updated.find(e => e.id === eventId);
    if (selected?.isAttending) {
      triggerToast(`RSVP Confirmed! Scheduled: ${selected.title}`);
    } else {
      triggerToast(`RSVP Cancelled for ${selected?.title}`);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent = {
      id: `local_ev_${Date.now()}`,
      title: eventTitle.trim(),
      host: 'You (Me)',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      description: eventDesc.trim() || 'No description provided.',
      date: eventDate || 'Date to be announced',
      location: eventLocation.trim() || 'Virtual Video Call 💻',
      attendees: 1,
      cover: eventCover.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      isAttending: true
    };

    const updated = [newEvent, ...eventsList];
    setEventsList(updated);
    localStorage.setItem('nexus_explore_events', JSON.stringify(updated));

    triggerToast(`Event created: "${eventTitle.trim()}"!`);
    
    // Reset Form
    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    setEventLocation('Virtual Video Call 💻');
    setEventCover('');
    setShowCreateEventModal(false);
  };

  const reels = [
    {
      id: 'r1',
      title: 'Building glassmorphic design tokens in 60 seconds 🚀',
      views: '142.5k',
      likes: '18.4k',
      creator: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1555066931-4365d14babc?auto=format&fit=crop&w=600&q=80',
      tag: '#webdesign'
    },
    {
      id: 'r2',
      title: 'Yosemite sunset timelapse shot on cinematic camera 🏔️',
      views: '98.2k',
      likes: '12.1k',
      creator: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80',
      tag: '#nature'
    },
    {
      id: 'r3',
      title: 'Future of Generative AI UI paradigms explained',
      views: '210k',
      likes: '34.9k',
      creator: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      tag: '#ai_future'
    },
    {
      id: 'r4',
      title: 'Setup tour: Minimalist dark aesthetic workspace 🎧',
      views: '76.4k',
      likes: '9.8k',
      creator: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      tag: '#workspace'
    }
  ];

  const creators = [
    { name: 'Elena Rostova', role: 'UI/UX Architect', followers: '124.5k', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { name: 'Marcus Chen', role: 'Outdoor Photographer', followers: '89.2k', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Sarah Jenkins', role: 'AI Researcher', followers: '210k', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' }
  ];

  const tags = ['#ai_future', '#reactjs', '#glassmorphism', '#yosemite', '#cyberpunk', '#minimalism'];

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-indigo-600 border border-indigo-500/30 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-indigo-500/25 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Compass className="w-8 h-8 text-indigo-500" />
            Explore & Discover
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Discover trending video reels, upcoming live events, and creators.</p>
        </div>

        {/* Action Button for creating events if on events tab */}
        {activeTab === 'events' ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowCreateEventModal(true)}
            className="px-4.5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Schedule Event</span>
          </motion.button>
        ) : (
          /* Search Input bar */
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Explore topics, reels, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        )}
      </div>

      {/* Trending Hashtags Pills (Unboxed, horizontal carousel) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pr-2 shrink-0">
          <Flame className="w-4 h-4 text-amber-500" /> Trending:
        </span>
        {tags.map((t, idx) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={idx}
            onClick={() => setSearchQuery(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              searchQuery === t
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* Segment Filter Tabs */}
      <div className="flex border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
        {[
          { id: 'reels', label: 'Trending Reels', icon: Video },
          { id: 'creators', label: 'Top Creators', icon: UserCheck },
          { id: 'events', label: 'Live Events & RSVPs', icon: Calendar },
          { id: 'articles', label: 'Articles & Insights', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main View Content Layer */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'reels' && (
            <motion.div 
              key="reels-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
            >
              {reels.map((reel) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  key={reel.id}
                  onClick={() => setActiveStory({ user: reel.creator, avatar: reel.avatar, bg: reel.bg })}
                  className="h-80 rounded-3xl relative overflow-hidden glass-card group cursor-pointer border border-slate-200/50 dark:border-slate-800/40 shadow-md flex flex-col justify-between p-4"
                >
                  <img
                    src={reel.bg}
                    alt={reel.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 pointer-events-none" />

                  {/* Play Indicator Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-extrabold text-white flex items-center gap-1 uppercase tracking-wider">
                      <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" /> Reel
                    </span>
                    <span className="text-[10px] font-bold text-indigo-300 drop-shadow-sm">{reel.tag}</span>
                  </div>

                  {/* Reel Bottom Meta Overlay */}
                  <div className="relative z-10 space-y-2">
                    <Link
                      to={`/profile/${getCreatorId(reel.creator)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                    >
                      <img src={reel.avatar} alt={reel.creator} className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/30" />
                      <span className="text-xs font-bold text-white font-['Outfit'] hover:text-indigo-400 transition-colors">{reel.creator}</span>
                    </Link>

                    <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                      {reel.title}
                    </p>

                    {/* Unboxed metric numbers separated by spaces */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-300 font-bold pt-1 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-indigo-400" /> {reel.views} Views</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/10" /> {reel.likes} Likes</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'creators' && (
            <motion.div 
              key="creators-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {creators.map((c, idx) => {
                const isFollowing = followedCreators.includes(c.name);
                return (
                  <motion.div 
                    whileHover={{ y: -3 }}
                    key={idx} 
                    className="glass-card p-6.5 rounded-[32px] text-center space-y-4 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm"
                  >
                    <Link to={`/profile/${getCreatorId(c.name)}`} className="block group">
                      <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-indigo-500/25 shadow-lg group-hover:scale-105 transition-transform duration-300" />
                      <div className="mt-4">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Outfit'] group-hover:text-indigo-500 transition-colors">{c.name}</h3>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{c.role}</p>
                      </div>
                    </Link>
                    <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-wide">{c.followers} followers</p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleFollowCreator(c.name)}
                      className={`w-full py-2.5 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        isFollowing
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Following</span>
                        </>
                      ) : (
                        <span>Follow Creator</span>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {eventsList.map((ev) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={ev.id}
                  className="glass-card rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm flex flex-col hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md rounded-lg text-[9px] font-extrabold text-white flex items-center gap-1 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-white" />
                      <span>Upcoming Event</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 font-['Outfit'] hover:text-indigo-500 transition-colors cursor-pointer leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="text-[10px] text-slate-400 font-bold space-y-1 pt-1.5 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {ev.date}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {ev.location}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300 font-bold">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>{ev.attendees} Going</span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleRSVP(ev.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                          ev.isAttending
                            ? 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        }`}
                      >
                        {ev.isAttending ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Going</span>
                          </>
                        ) : (
                          <span>RSVP</span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div 
              key="articles-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <motion.div 
                whileHover={{ y: -2 }}
                className="glass-card p-5 rounded-[32px] flex flex-col sm:flex-row gap-5 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm"
              >
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&h=300&q=80" alt="Article Cover" className="w-full sm:w-56 h-36 rounded-2xl object-cover border border-slate-200/10" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block mb-1">AI Architecture</span>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 font-['Outfit'] leading-snug mb-1.5 hover:text-indigo-500 cursor-pointer transition-colors">
                      Building Responsive AI Interfaces in 2026
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      A comprehensive deep dive into generative design tokens, dark-mode styling variables, and layout math algorithms for the future web.
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider mt-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>5 min read</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span>Published 3 hours ago</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Schedule Event Modal */}
      <AnimatePresence>
        {showCreateEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateEventModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 relative z-10 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 font-['Outfit']">
                  <Calendar className="w-5 h-5 text-indigo-500" /> 
                  <span>Schedule Community Event</span>
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateEventModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js 16 Launch Party 🚀"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Date & Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oct 24, 2026 • 6:30 PM GMT"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Location / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Virtual Google Meet Call 💻"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Event Cover Photo URL</label>
                  <input
                    type="url"
                    placeholder="Paste any high-res cover image address URL..."
                    value={eventCover}
                    onChange={(e) => setEventCover(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Event Description</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Provide a detailed roadmap, timeline, or agenda for attendees..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setShowCreateEventModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 hover:bg-indigo-500 cursor-pointer"
                  >
                    Publish Event
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
