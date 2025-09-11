import { Link, useNavigate } from "react-router-dom";
import { SunIcon, MoonIcon, LogOutIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { clearAuth } from "../../lib/auth";

export default function AdminNavbar() {
  const [forestMode, setForestMode] = useState(
    localStorage.getItem("theme") === "forest"
  );
  const navigate = useNavigate();

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
    <nav className="navbar bg-base-100 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold">
          SkillTree&nbsp;<span className="text-primary">Admin</span>
        </Link>

        <div className="flex items-center space-x-2">
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

          <button
            onClick={logout}
            className="btn btn-primary btn-sm flex items-center gap-1"
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
