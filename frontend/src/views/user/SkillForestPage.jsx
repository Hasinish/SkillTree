import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function SkillForestPage() {
  const [learning, setLearning] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/learning")
      .then((res) => setLearning(res.data))
      .catch(() => toast.error("Could not load your learning"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // map percent -> image
  const stageSrc = (p) => {
    if (p === 0)   return "/trees/seed.png";
    if (p < 25)    return "/trees/sprout.png";
    if (p < 50)    return "/trees/small-plant.png";
    if (p < 75)    return "/trees/young-tree.png";
    if (p < 100)   return "/trees/leafy-tree.png";
    return "/trees/full-tree.png";
  };

  // ✅ Removed per-stage sizeClass. 
  // Now ALL trees will have the same bigger size.
  const treeSize = "w-40 h-40"; // change this to w-40 h-40 if you want even bigger

  const percent = (entry) => {
    const total = entry.tasks.length;
    const done  = entry.completedTasks.filter(Boolean).length;
    return total ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-ghost text-lg">← Back</Link>
          <h1 className="text-2xl font-bold">My Skill Forest</h1>
          <div />
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            {/* Forest with ground-aligned trees */}
            <div
              className="rounded-xl border border-primary bg-secondary-content/40 p-3 bg-bottom bg-cover"
              style={{
                backgroundImage: "url('/forest/forest-bg.png')",
                imageRendering: "pixelated"
              }}
            >
              {/* One bottom row; scrolls horizontally if needed */}
              <div className="min-h-[600px] overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-max items-end gap-0 h-[460px] px-4 ml-6">
                  {learning.length === 0 ? (
                    <p className="opacity-70 col-span-full py-24">
                      No trees yet. Start learning from the Skills page.
                    </p>
                  ) : (
                    learning.map((e) => {
                      const pct = percent(e);
                      const tip = `${e.name} — ${pct}%`;
                      return (
                        <div
                          key={e._id}
                          className="tooltip tooltip-top -ml-6"
                          data-tip={tip}
                        >
                          <Link to={`/dashboard/${e._id}`}>
                            <img
                              src={stageSrc(pct)}
                              alt={e.name}
                              className={`transition-transform hover:scale-110 ${treeSize} mb-[-2px]`}
                              style={{ imageRendering: "pixelated" }}
                            />
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3">
              Hover a tree to see its skill and progress. Click to open details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
