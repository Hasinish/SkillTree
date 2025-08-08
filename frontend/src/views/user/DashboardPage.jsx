import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import SkillCard from '../../components/user/SkillCard';

export default function DashboardPage() {
  const [learning, setLearning] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/learning')
      .then((res) => setLearning(res.data))
      .catch(() => toast.error('Could not load your dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  if (learning.length === 0) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-neutral">
        <p className="mb-4">You haven’t started any skills yet.</p>
        <Link to="/skills" className="btn btn-primary btn-sm">
          Browse Skills
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-neutral to-neutral p-6 space-y-8 overflow-auto">
      <h1 className="text-3xl font-bold text-neutral">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {learning.map((s) => {
          const total = s.tasks.length;
          const done  = s.completedTasks.filter(Boolean).length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <SkillCard
              key={s._id}
              skill={s}
              to={`/dashboard/${s._id}`}
              progress={percent}
            />
          );
        })}
      </div>
    </div>
  );
}
