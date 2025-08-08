import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { PlusIcon } from "lucide-react";
import { CATEGORIES } from "../../lib/categories";

export default function AdminSkillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/skills/${id}`)
      .then((res) => setSkill(res.data))
      .catch(() => toast.error("Could not load skill"))
      .finally(() => setLoading(false));
  }, [id]);

  const addTask = () =>
    setSkill((p) => ({ ...p, tasks: [...p.tasks, { title: "", content: "" }] }));
  const removeTask = (idx) =>
    setSkill((p) => ({ ...p, tasks: p.tasks.filter((_, i) => i !== idx) }));
  const updateTask = (idx, key, val) =>
    setSkill((p) => ({
      ...p,
      tasks: p.tasks.map((t, i) => (i === idx ? { ...t, [key]: val } : t)),
    }));

  const handleSave = async () => {
    if (!skill.name.trim()) return toast.error("Name required");
    if (skill.tasks.some((t) => !t.title.trim() || !t.content.trim()))
      return toast.error("All tasks need title & content");

    setSaving(true);
    try {
      await api.put(`/skills/${id}`, {
        name: skill.name,
        category: skill.category,
        tasks: skill.tasks,
      });
      toast.success("Skill updated");
      navigate("/");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await api.delete(`/skills/${id}`);
      toast.success("Skill deleted");
      navigate("/");
    } catch {
      toast.error("Deletion failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (!skill) return <p className="text-center py-20">Skill not found.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="btn btn-ghost">
          ← Back
        </Link>
        <button
          onClick={handleDelete}
          className="btn btn-outline btn-error btn-sm"
        >
          Delete Skill
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-8">
          <div>
            <label className="label">Skill Name</label>
            <input
              className="input input-bordered w-full"
              value={skill.name}
              onChange={(e) =>
                setSkill({ ...skill, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              className="select select-bordered w-full"
              value={skill.category}
              onChange={(e) =>
                setSkill({ ...skill, category: e.target.value })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Tasks</h3>

            {skill.tasks.map((t, i) => (
              <div
                key={i}
                className="space-y-2 border-b pb-4 last:border-none"
              >
                <input
                  className="input input-bordered w-full"
                  value={t.title}
                  onChange={(e) => updateTask(i, "title", e.target.value)}
                  placeholder="Title"
                />
                <textarea
                  className="textarea textarea-bordered w-full min-h-[6rem]"
                  value={t.content}
                  onChange={(e) =>
                    updateTask(i, "content", e.target.value)
                  }
                  placeholder="Content"
                />
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-xs"
                  onClick={() => removeTask(i)}
                >
                  Remove task
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline btn-secondary"
              onClick={addTask}
            >
              <PlusIcon className="h-5 w-5 mr-2" /> Add Task
            </button>
          </div>

          <div className="text-right pt-2">
            <button
              onClick={handleSave}
              className="btn btn-primary px-8"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
