import { Link } from "react-router-dom";
import { SunIcon, MoonIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminNavbar() {
  const [forestMode, setForestMode] = useState(
    localStorage.getItem("theme") === "forest"
  );

  useEffect(() => {
    const theme = forestMode ? "forest" : "lemonade";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [forestMode]);

  return (
    <nav className="navbar bg-base-100 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold">
          SkillTree&nbsp;<span className="text-primary">Admin</span>
        </Link>

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
      </div>
    </nav>
  );
}
