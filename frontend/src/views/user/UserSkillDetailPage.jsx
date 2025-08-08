import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function UserSkillDetailPage() {
  const { id } = useParams();
  const [skill, setSkill]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/skills/${id}`)
      .then((res) => setSkill(res.data))
      .catch(() => toast.error("Could not load skill"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (!skill) return <p className="text-center py-20">Skill not found.</p>;

  return (
    <div className="min-h-screen w-full bg-neutral p-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/skills" className="btn btn-ghost">← Back</Link>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-2">{skill.name}</h1>
            <p className="text-sm opacity-70 mb-6">{skill.category}</p>

            <h2 className="text-lg font-semibold mb-3">Tasks</h2>
            {skill.tasks.length === 0 ? (
              <p className="opacity-70">No tasks for this skill yet.</p>
            ) : (
              <ul className="space-y-4">
                {skill.tasks.map((t, i) => (
                  <li key={i} className="border-l-4 border-primary pl-4">
                    <h3 className="font-medium">{t.title}</h3>
                    <p className="text-sm opacity-80 whitespace-pre-wrap">
                      {t.content}
                    </p>
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
