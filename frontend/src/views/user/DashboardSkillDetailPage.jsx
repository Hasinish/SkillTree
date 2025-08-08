import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function DashboardSkillDetailPage() {
  const { id: skillId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch your learning entry (with tasks + your completedTasks)
  useEffect(() => {
    api
      .get(`/learning/${skillId}`)
      .then((res) => setEntry(res.data))
      .catch(() => toast.error("Could not load skill details"))
      .finally(() => setLoading(false));
  }, [skillId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  if (!entry) {
    return <p className="text-center py-20">Skill not found.</p>;
  }

  // toggle a task's completion state
  const handleToggle = async (index) => {
    try {
      const { data } = await api.patch(
        `/learning/${skillId}/task/${index}`
      );
      // merge in the updated completedTasks array
      setEntry((prev) => ({ ...prev, completedTasks: data.completedTasks }));
    } catch {
      toast.error("Could not update that task");
    }
  };

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/dashboard" className="btn btn-ghost">
          ← Back to Dashboard
        </Link>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="text-2xl font-bold mb-1">{entry.name}</h1>
            <p className="text-sm opacity-70 mb-4">{entry.category}</p>

            <h2 className="text-lg font-semibold mb-2">Tasks</h2>
            {entry.tasks.length === 0 ? (
              <p className="opacity-70">No tasks defined for this skill.</p>
            ) : (
              <ul className="space-y-4">
                {entry.tasks.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between border-l-4 border-primary pl-4"
                  >
                    <div>
                      <h3 className="font-medium">{t.title}</h3>
                      <p className="text-sm opacity-80 whitespace-pre-wrap">
                        {t.content}
                      </p>
                    </div>
                    <button
                      className={`btn btn-sm ${
                        entry.completedTasks[i]
                          ? "btn-success"
                          : "btn-outline"
                      }`}
                      onClick={() => handleToggle(i)}
                    >
                      {entry.completedTasks[i] ? "✓ Done" : "Mark Done"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
