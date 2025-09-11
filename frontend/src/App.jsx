import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { getToken, getIsAdmin } from './lib/auth';

import UserNavbar from './components/user/UserNavbar';
import AdminNavbar from './components/admin/AdminNavbar';

import LoginPage from './views/user/LoginPage';
import RegisterPage from './views/user/RegisterPage';
import DashboardPage from './views/user/DashboardPage';
import UserSkillsListPage from './views/user/UserSkillsListPage';
import UserSkillDetailPage from './views/user/UserSkillDetailPage';
import DashboardSkillDetailPage from './views/user/DashboardSkillDetailPage';
import SkillForestPage from './views/user/SkillForestPage';
import CreateCustomSkillPage from './views/user/CreateCustomSkillPage';
import AdminSkillsListPage from './views/admin/AdminSkillsListPage';
import AdminCreateSkillPage from './views/admin/AdminCreateSkillPage';
import AdminSkillDetailPage from './views/admin/AdminSkillDetailPage';

import ProfilePage from './views/user/ProfilePage';
import LeaderboardPage from './views/user/LeaderboardPage';
import ShopPage from './views/user/ShopPage'; // NEW

export default function App() {
  const { pathname } = useLocation();
  const token      = getToken();
  const isAdmin    = getIsAdmin();
  const isLoggedIn = !!token;

  // Routes for regular users
  const isUserRoute = [
    '/login',
    '/register',
    '/dashboard',
    '/skills',
    '/forest',
    '/custom-skill',
    '/profile',
    '/leaderboard',
    '/shop', // NEW
  ].some((p) => pathname.startsWith(p));

  return (
    <div className="flex flex-col h-screen bg-base-200 text-base-content">
      {isLoggedIn && isAdmin ? <AdminNavbar /> : <UserNavbar />}

      <div className="flex-1 overflow-auto">
        {isUserRoute ? (
          <Routes>
            {/* Auth */}
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to={isAdmin ? '/' : '/dashboard'} replace />
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/register"
              element={
                isLoggedIn ? (
                  <Navigate to={isAdmin ? '/' : '/dashboard'} replace />
                ) : (
                  <RegisterPage />
                )
              }
            />

            {/* User-only pages */}
            <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard/:id" element={isLoggedIn ? <DashboardSkillDetailPage /> : <Navigate to="/login" replace />} />

            <Route path="/skills" element={isLoggedIn ? <UserSkillsListPage /> : <Navigate to="/login" replace />} />
            <Route path="/skills/:id" element={isLoggedIn ? <UserSkillDetailPage /> : <Navigate to="/login" replace />} />

            <Route path="/forest" element={isLoggedIn ? <SkillForestPage /> : <Navigate to="/login" replace />} />
            <Route path="/custom-skill" element={isLoggedIn ? <CreateCustomSkillPage /> : <Navigate to="/login" replace />} />

            <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/leaderboard" element={isLoggedIn ? <LeaderboardPage /> : <Navigate to="/login" replace />} />

            {/* NEW: Shop */}
            <Route path="/shop" element={isLoggedIn ? <ShopPage /> : <Navigate to="/login" replace />} />
          </Routes>
        ) : (
          // Admin area
          <main className="max-w-5xl mx-auto px-4 py-10">
            <Routes>
              <Route
                path="/"
                element={
                  isLoggedIn && isAdmin ? (
                    <AdminSkillsListPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              <Route
                path="/create-skill"
                element={
                  isLoggedIn && isAdmin ? (
                    <AdminCreateSkillPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              <Route
                path="/skill/:id"
                element={
                  isLoggedIn && isAdmin ? (
                    <AdminSkillDetailPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
            </Routes>
          </main>
        )}
      </div>
    </div>
  );
}
