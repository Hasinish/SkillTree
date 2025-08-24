// frontend/src/views/user/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import SkillCard from "../../components/user/SkillCard";
import Sidebar from "../../components/user/Sidebar";

export default function DashboardPage() {
  const [learning, setLearning] = useState([]);
  const [loading, setLoading]   = useState(true);

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const filter = params.get("filter");
  const category = params.get("category");

  useEffect(() => {
    api.get("/learning")
      .then((res) => setLearning(res.data))
      .catch(() => toast.error("Could not load your dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-xl" />
      </div>
    );
  }

  if (!learning.length) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-neutral">
        <p className="mb-4">You haven’t started any skills yet.</p>
        <Link to="/skills" className="btn btn-primary btn-sm">
          Browse Skills
        </Link>
      </div>
    );
  }

  // Start with full list
  let displayed = [...learning];

  // Category filter
  if (category) {
    displayed = displayed.filter((s) => s.category === category);
  }

  // Filter type
  if (filter === "completed") {
    displayed = displayed.filter(
      (s) =>
        s.tasks.length > 0 &&
        s.completedTasks.filter(Boolean).length === s.tasks.length
    );
  } else if (filter === "all") {
    // show everything
  } else {
    // default = in-progress
    displayed = displayed.filter(
      (s) =>
        !(
          s.tasks.length > 0 &&
          s.completedTasks.filter(Boolean).length === s.tasks.length
        )
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-neutral to-neutral pb-6">
      {/* Fixed, container-aligned sidebar */}
      <Sidebar learning={learning} />

      {/* Main content inside the SAME container width as navbar */}
      <div className="container mx-auto px-4">
        {/* Reserve space for the fixed sidebar inside the container */}
        <main className="ml-[272px] p-6 pr-0"> 
          

          {displayed.length === 0 ? (
            <p className="text-center opacity-70">
              No skills{" "}
              {filter === "completed" ? "completed" : filter === "all" ? "" : "in progress"}{" "}
              {category && <>in “{category}”</>}.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {displayed.map((s) => {
                const total = s.tasks.length;
                const done  = s.completedTasks.filter(Boolean).length;
                const pct   = total ? Math.round((done / total) * 100) : 0;

                return (
                  <div key={s._id} className="w-full">
                    <SkillCard skill={s} to={`/dashboard/${s._id}`} progress={pct} />
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
