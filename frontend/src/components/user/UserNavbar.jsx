import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  HomeIcon,
  BookOpenIcon,
  GridIcon,
  TreesIcon,
  PlusCircleIcon, // NEW
} from "lucide-react";
import { useState, useEffect } from "react";
import { clearAuth, getToken, getIsAdmin } from "../../lib/auth";

export default function UserNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedIn = !!getToken();
  const isAdmin = getIsAdmin();

  const [forestMode, setForestMode] = useState(
    localStorage.getItem("theme") === "forest"
  );
  useEffect(() => {
    const theme = forestMode ? "forest" : "light-forest";
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
          className="flex items-center text-xl font-bold space-x-2"
        >
          <GridIcon className="h-6 w-6 text-primary" />
          <span>SkillTree</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button
            aria-label="Toggle theme"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => setForestMode(!forestMode)}
          >
            {forestMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {loggedIn ? (
            <>
              <Link
                to="/dashboard"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${pathname === "/dashboard" ? "btn-active" : ""}`}
              >
                <HomeIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/skills"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${pathname.startsWith("/skills") ? "btn-active" : ""}`}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>Skills</span>
              </Link>

              {/* NEW: Create Custom Skill */}
              <Link
                to="/custom-skill"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${pathname.startsWith("/custom-skill") ? "btn-active" : ""}`}
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span>Create Custom Skill</span>
              </Link>

              <Link
                to="/forest"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${pathname.startsWith("/forest") ? "btn-active" : ""}`}
              >
                <TreesIcon className="h-4 w-4" />
                <span>Forest View</span>
              </Link>

              <button onClick={logout} className="btn btn-primary btn-sm flex items-center space-x-1">
                <MoonIcon className="h-4 w-4 rotate-90" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
