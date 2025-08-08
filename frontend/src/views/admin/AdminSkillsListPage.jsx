import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import AdminSkillCard from "../../components/admin/AdminSkillCard";

export default function AdminSkillsListPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/skills")
      .then((res) => setSkills(res.data))
      .catch(() => toast.error("Could not load skills"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Skills</h1>
        <Link to="/create-skill" className="btn btn-primary btn-sm">
          + Add Skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <p className="text-center opacity-70 py-16">No skills yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <AdminSkillCard key={s._id} skill={s} />
          ))}
        </div>
      )}
    </section>
  );
}
