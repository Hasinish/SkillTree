import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAuth } from "../../lib/auth";
import { CATEGORIES } from "../../lib/categories";
import {
  LayersIcon,
  CircleIcon,
  CheckCircle2Icon,
  TagIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";

export default function Sidebar({ learning }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const qs = new URLSearchParams(search);

  const completed = learning.filter(
    (s) =>
      s.tasks.length &&
      s.completedTasks.filter(Boolean).length === s.tasks.length
  ).length;
  const inProgress = learning.length - completed;

  const active = (cond) =>
    cond ? "active bg-primary text-primary-content" : "";

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 ">
      <aside
        className="
          fixed top-20
          w-64 h-100
          bg-base-100 border border-primary
          shadow-lg flex flex-col z-30
        "
      >
        <ul className="menu menu-vertical px-4 py-6 flex-1 overflow-y-auto">
          <li className="menu-title"><span>Main</span></li>
          <li className={active(pathname === "/dashboard" && qs.get("filter") === "all")}>
            <Link to="/dashboard?filter=all" className="flex items-center gap-2">
              <LayersIcon className="h-5 w-5" />
              <span>All Skills</span>
            </Link>
          </li>

          <li className="menu-title mt-4"><span>My Progress</span></li>
          <li className={active(!qs.get("filter") || qs.get("filter") === "in")}>
            <Link to="/dashboard" className="flex items-center gap-2">
              <CircleIcon className="h-5 w-5" />
              <span>In Progress</span>
              <span className="badge badge-info ml-auto">{inProgress}</span>
            </Link>
          </li>
          <li className={active(qs.get("filter") === "completed")}>
            <Link to="/dashboard?filter=completed" className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5" />
              <span>Completed</span>
              <span className="badge badge-success ml-auto">{completed}</span>
            </Link>
          </li>

          <li className="menu-title mt-4"><span>Categories</span></li>
          {CATEGORIES.map((c) => (
            <li key={c} className={active(qs.get("category") === c)}>
              <Link
                to={`/dashboard?filter=all&category=${encodeURIComponent(c)}`}
                className="flex items-center gap-2"
              >
                <TagIcon className="h-5 w-5" />
                <span>{c}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-4 py-4 border-t border-base-300 space-y-2">
          <Link
            to="/profile"
            className="btn btn-ghost btn-sm w-full justify-start flex items-center gap-2"
          >
            <UserIcon className="h-5 w-5" />
            Profile
          </Link>
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm w-full justify-start flex items-center gap-2"
          >
            <LogOutIcon className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>
    </div>
  );
}
