import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

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
import ProfileView from './pages/ProfileView'; // ✅ NEW
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />

        <h2 className="text-lg font-semibold">
          Checking your session...
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Please wait
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PROTECTED ROUTE
   User must be logged in to access the main application.
   ============================================================ */
function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useApp();

  // Supabase session is still being checked
  if (!authReady) {
    return <AuthLoading />;
  }

  // No logged-in user → Login page
  if (!currentUser?.id || !currentUser?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* ============================================================
   PUBLIC ROUTE
   Login/Register are only for users who are NOT logged in.
   ============================================================ */
function PublicRoute({ children }) {
  const { currentUser, authReady } = useApp();

  // Wait until Supabase finishes checking session
  if (!authReady) {
    return <AuthLoading />;
  }

  // Already logged in → Home
  if (currentUser?.id && currentUser?.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ============================================================
   MAIN APPLICATION LAYOUT
   ============================================================ */
function Layout({ children }) {
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register';

  // Login/Register should not show Navbar/Sidebar/Rightbar
  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0">
          {children}
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
   APP
   ============================================================ */
export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout>
            <Routes>

              {/* ==================================================
                  PUBLIC AUTH ROUTES
                  ================================================== */}

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

              {/* ==================================================
                  PROTECTED APPLICATION ROUTES
                  ================================================== */}

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                }
              />

              {/* ==================================================
                  MY PROFILE
                  /profile
                  ================================================== */}

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* ==================================================
                  OTHER USER PROFILE
                  /profile/:userId
                  ================================================== */}

              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <ProfileView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <Marketplace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <Saved />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* ==================================================
                  UNKNOWN ROUTE
                  ================================================== */}

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
