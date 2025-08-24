// frontend/src/views/user/UserSkillsListPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpenIcon, PlusCircleIcon, CheckCircle2Icon } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function UserSkillsListPage() {
  const [skills, setSkills]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [learning, setLearning] = useState([]);
  const navigate = useNavigate();

  // load all skills + which ones the user is already learning
  useEffect(() => {
    api.get("/skills")
      .then((res) => setSkills(res.data))
      .catch(() => toast.error("Failed to load skills"))
      .finally(() => setLoading(false));

    api.get("/learning")
      .then((res) => setLearning(res.data.map((s) => s._id)))
      .catch(() => toast.error("Could not load your learning"));
  }, []);

  // start learning a skill
  const handleStart = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post(`/learning/${id}`);
      setLearning((prev) => [...prev, id]);
      toast.success("Skill added to your dashboard!");
    } catch {
      toast.error("Could not start learning");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral p-6 overflow-auto">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-neutral flex items-center space-x-2">
          <BookOpenIcon className="h-6 w-6" />
          <span>All Skills</span>
        </h1>

        {skills.length === 0 ? (
          <p className="text-center">No skills available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => {
              const isLearning = learning.includes(s._id);
              return (
                <div
                  key={s._id}
                  onClick={() => navigate(`/skills/${s._id}`)}
                  className="
                    bg-base-100 p-5 shadow hover:shadow-lg
                    transition cursor-pointer border border-primary
                  "
                >
                  <h2 className="text-xl font-semibold mb-2">{s.name}</h2>
                  <p className="text-sm opacity-75">{s.category}</p>
                  <p className="text-xs opacity-50 mt-2">
                    {s.tasks.length} task{s.tasks.length !== 1 && "s"}
                  </p>
                  <button
                    className="btn btn-primary btn-sm mt-4 w-full flex items-center justify-center space-x-2"
                    disabled={isLearning}
                    onClick={(e) => handleStart(e, s._id)}
                  >
                    {isLearning ? (
                      <>
                        <CheckCircle2Icon className="h-4 w-4" />
                        <span>Learning ✓</span>
                      </>
                    ) : (
                      <>
                        <PlusCircleIcon className="h-4 w-4" />
                        <span>Start Learning</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
