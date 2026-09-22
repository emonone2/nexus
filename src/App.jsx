import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import StoryViewerModal from './components/StoryViewerModal';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import Friends from './pages/Friends';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Groups from './pages/Groups';
import Marketplace from './pages/Marketplace';
import Saved from './pages/Saved';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

/* ============================================================
   AUTH LOADING SCREEN
   ============================================================ */
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0D19] text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold font-['Outfit'] tracking-tight">Checking your session...</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Please wait a moment</p>
      </div>
    </div>
  );
}

/* ============================================================
   PROTECTED ROUTE
   ============================================================ */
function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useApp();

  if (!authReady) {
    return <AuthLoading />;
  }

  if (!currentUser?.id || !currentUser?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* ============================================================
   PUBLIC ROUTE
   ============================================================ */
function PublicRoute({ children }) {
  const { currentUser, authReady } = useApp();

  if (!authReady) {
    return <AuthLoading />;
  }

  if (currentUser?.id && currentUser?.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ============================================================
   PAGE ROUTE WRAPPER (FOR TRANSITION STYLES)
   ============================================================ */
function AnimatedPageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   MAIN APPLICATION LAYOUT
   ============================================================ */
function Layout({ children }) {
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register';

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {location.pathname !== '/chat' &&
          location.pathname !== '/settings' && (
            <Rightbar />
          )}
      </div>

      <StoryViewerModal />
    </div>
  );
}

/* ============================================================
   APP WITH ROUTER
   ============================================================ */
export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout>
            <Routes>
              {/* PUBLIC AUTH ROUTES */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* PROTECTED ROUTES */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Home />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Explore />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Profile />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <ProfileView />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Friends />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Chat />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Groups />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Marketplace />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Saved />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Notifications />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AnimatedPageWrapper>
                      <Settings />
                    </AnimatedPageWrapper>
                  </ProtectedRoute>
                }
              />

              {/* FALLBACK */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
