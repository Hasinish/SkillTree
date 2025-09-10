import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  SunIcon,
  MoonIcon,
  HomeIcon,
  BookOpenIcon,
  GridIcon,
  TreesIcon,
  PlusCircleIcon,
  TrophyIcon,
  CoinsIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clearAuth, getToken, getIsAdmin } from "../../lib/auth";
import api from "../../lib/axios";

export default function UserNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedIn = !!getToken();
  const isAdmin = getIsAdmin();

  const [forestMode, setForestMode] = useState(
    localStorage.getItem("theme") === "forest"
  );
  const [xp, setXp] = useState(null);
  const [coins, setCoins] = useState(null);

  useEffect(() => {
    const theme = forestMode ? "forest" : "light-forest";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [forestMode]);

  const fetchTotals = async () => {
    if (!loggedIn) {
      setXp(null);
      setCoins(null);
      return;
    }
    try {
      const { data } = await api.get("/users/me");
      setXp(typeof data?.xp === "number" ? data.xp : 0);
      setCoins(typeof data?.coins === "number" ? data.coins : 0);
    } catch {
      /* no-op */
    }
  };

  useEffect(() => {
    fetchTotals();
  }, [pathname, loggedIn]);

  useEffect(() => {
    const xpHandler = (e) => {
      if (typeof e?.detail?.xp === "number") setXp(e.detail.xp);
    };
    const coinHandler = (e) => {
      if (typeof e?.detail?.coins === "number") setCoins(e.detail.coins);
    };
    window.addEventListener("xp:update", xpHandler);
    window.addEventListener("coins:update", coinHandler);
    return () => {
      window.removeEventListener("xp:update", xpHandler);
      window.removeEventListener("coins:update", coinHandler);
    };
  }, []);

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  const isActive = (p) =>
    pathname === p || (p !== "/dashboard" && pathname.startsWith(p));

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

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* XP & Coins badges */}
          {loggedIn && (
            <>
              <span
                className="badge badge-primary px-3 py-2 text-xs sm:text-sm flex items-center gap-1"
                title="Total XP"
              >
                <TrophyIcon className="h-3.5 w-3.5" />
                <span>XP {xp ?? "—"}</span>
              </span>
              <span
                className="badge bg-amber-200 text-amber-900 px-3 py-2 text-xs sm:text-sm flex items-center gap-1"
                title="Total Coins"
              >
                <CoinsIcon className="h-3.5 w-3.5" />
                <span>{coins ?? "—"} coins</span>
              </span>
            </>
          )}

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
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${
                  isActive("/dashboard") ? "btn-active" : ""
                }`}
              >
                <HomeIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/skills"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${
                  isActive("/skills") ? "btn-active" : ""
                }`}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>Skills</span>
              </Link>

              <Link
                to="/custom-skill"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${
                  isActive("/custom-skill") ? "btn-active" : ""
                }`}
              >
                <PlusCircleIcon className="h-4 w-4" />
                <span>Create Custom Skill</span>
              </Link>

              <Link
                to="/forest"
                className={`btn btn-ghost btn-sm flex items-center space-x-1 ${
                  isActive("/forest") ? "btn-active" : ""
                }`}
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
