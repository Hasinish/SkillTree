import { Link, useNavigate, useLocation } from "react-router-dom";
import { SunIcon, MoonIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { clearAuth, getToken, getIsAdmin } from "../../lib/auth";

export default function UserNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedIn = !!getToken();
  const isAdmin = getIsAdmin();
  const onLogin = pathname === "/login";
  const onRegister = pathname === "/register";

  // true = dark (“forest”), false = light (“lemonade”)
  const [forestMode, setForestMode] = useState(
    localStorage.getItem("theme") === "forest"
  );

  useEffect(() => {
    const theme = forestMode ? "forest" : "lemonade";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [forestMode]);

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <nav className="bg-secondary-content shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link
          to={loggedIn ? (isAdmin ? "/" : "/dashboard") : "/"}
          className="text-xl font-bold"
        >
          SkillTree
        </Link>

        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            aria-label="Toggle theme"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => setForestMode(!forestMode)}
          >
            {forestMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Links */}
          <div className="space-x-4">
            {loggedIn ? (
              <>
                {!isAdmin && (
                  <Link to="/dashboard" className="btn btn-primary btn-sm">
                    Dashboard
                  </Link>
                )}
                {isAdmin ? (
                  <Link to="/" className="btn btn-ghost btn-sm">
                    Admin
                  </Link>
                ) : (
                  <Link to="/skills" className="btn btn-primary btn-sm">
                    Skills
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="btn btn-primary btn-sm"
                >
                  Log Out
                </button>
              </>
            ) : onLogin ? (
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            ) : onRegister ? (
              <Link to="/login" className="btn btn-primary btn-sm">
                Log In
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
