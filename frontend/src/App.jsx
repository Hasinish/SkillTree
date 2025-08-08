import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { getToken, getIsAdmin } from './lib/auth';

import UserNavbar from './components/user/UserNavbar';
import LoginPage from './views/user/LoginPage';
import RegisterPage from './views/user/RegisterPage';
import DashboardPage from './views/user/DashboardPage';
import UserSkillsListPage from './views/user/UserSkillsListPage';
import UserSkillDetailPage from './views/user/UserSkillDetailPage';
import DashboardSkillDetailPage from './views/user/DashboardSkillDetailPage';

import AdminSkillsListPage from './views/admin/AdminSkillsListPage';
import AdminCreateSkillPage from './views/admin/AdminCreateSkillPage';
import AdminSkillDetailPage from './views/admin/AdminSkillDetailPage';

export default function App() {
  const { pathname } = useLocation();
  const token      = getToken();
  const isAdmin    = getIsAdmin();
  const isLoggedIn = !!token;

  // routes that use the "user" layout
  const isUserRoute = ['/login','/register','/dashboard','/skills']
    .some(p => pathname.startsWith(p));

  return (
    <div className="flex flex-col h-screen bg-base-200 text-base-content">
      <UserNavbar />

      <div className="flex-1 overflow-auto">
        {isUserRoute ? (
          <Routes>
            <Route
              path="/login"
              element={isLoggedIn
                ? <Navigate to={isAdmin ? '/' : '/dashboard'} replace />
                : <LoginPage />}
            />
            <Route
              path="/register"
              element={isLoggedIn
                ? <Navigate to={isAdmin ? '/' : '/dashboard'} replace />
                : <RegisterPage />}
            />

            {/* Dashboard and its detail page */}
            <Route
              path="/dashboard"
              element={isLoggedIn
                ? <DashboardPage />
                : <Navigate to="/login" replace />}
            />
            <Route
              path="/dashboard/:id"
              element={isLoggedIn
                ? <DashboardSkillDetailPage />
                : <Navigate to="/login" replace />}
            />

            {/* All-skills list + its readonly detail page */}
            <Route
              path="/skills"
              element={isLoggedIn
                ? <UserSkillsListPage />
                : <Navigate to="/login" replace />}
            />
            <Route
              path="/skills/:id"
              element={isLoggedIn
                ? <UserSkillDetailPage />
                : <Navigate to="/login" replace />}
            />
          </Routes>
        ) : (
          <main className="max-w-5xl mx-auto px-4 py-10">
            <Routes>
              <Route
                path="/"
                element={isLoggedIn && isAdmin
                  ? <AdminSkillsListPage />
                  : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="/create-skill"
                element={isLoggedIn && isAdmin
                  ? <AdminCreateSkillPage />
                  : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="/skill/:id"
                element={isLoggedIn && isAdmin
                  ? <AdminSkillDetailPage />
                  : <Navigate to="/dashboard" replace />}
              />
            </Routes>
          </main>
        )}
      </div>
    </div>
  );
}
