import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { PlusIcon } from "lucide-react";
import api from "../../lib/axios";
import { CATEGORIES } from "../../lib/categories";

export default function CreateCustomSkillPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tasks, setTasks] = useState([{ title: "", content: "" }]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const addTask = () => setTasks((prev) => [...prev, { title: "", content: "" }]);
  const removeTask = (idx) => setTasks((prev) => prev.filter((_, i) => i !== idx));
  const updateTask = (idx, key, val) =>
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, [key]: val } : t)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name required");
    if (tasks.some((t) => !t.title.trim() || !t.content.trim()))
      return toast.error("All tasks need title & content");

    setSaving(true);
    try {
      await api.post("/skills/custom", { name, category, tasks });
      toast.success("Custom skill created");
      navigate("/skills");
    } catch {
      toast.error("Creation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/skills" className="btn btn-ghost mb-6">← Back</Link>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-8">
          <h2 className="card-title text-2xl">Create Custom Skill</h2>
          <p className="text-sm opacity-70">
            Your skill will be saved with <strong>(Custom)</strong> in the title.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="label">Skill Name</label>
              <input
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pixel Art Basics"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="label">Tasks</label>
              {tasks.map((t, i) => (
                <div key={i} className="space-y-2">
                  <input
                    className="input input-bordered w-full"
                    placeholder="Task title"
                    value={t.title}
                    onChange={(e) => updateTask(i, "title", e.target.value)}
                  />
                  <textarea
                    className="textarea textarea-bordered w-full min-h-[6rem]"
                    placeholder="Task details"
                    value={t.content}
                    onChange={(e) => updateTask(i, "content", e.target.value)}
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
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Task
              </button>
            </div>

            <div className="text-right">
              <button type="submit" className="btn btn-primary px-8" disabled={saving}>
                {saving ? "Saving…" : "Create Custom Skill"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
