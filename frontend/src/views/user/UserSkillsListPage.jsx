import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import SkillCard from '../../components/user/SkillCard';

export default function UserSkillsListPage() {
  const [skills, setSkills]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [learning, setLearning]   = useState([]);

  useEffect(() => {
    api.get('/skills')
      .then((res) => setSkills(res.data))
      .catch(() => toast.error('Failed to load skills'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/learning')
      .then((res) => setLearning(res.data.map((s) => s._id)))
      .catch(() => toast.error('Could not load your learning'));
  }, []);

  const handleStart = async (skillId) => {
    try {
      await api.post(`/learning/${skillId}`);
      setLearning((prev) => [...prev, skillId]);
      toast.success('Skill added to your dashboard!');
    } catch {
      toast.error('Could not start learning');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-neutral to-neutral p-6 overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-neutral">All Skills</h1>
      {skills.length === 0 ? (
        <p className="text-center">No skills available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => {
            const isLearning = learning.includes(s._id);
            return (
              <SkillCard
                key={s._id}
                skill={s}
                to={`/skills/${s._id}`}
                onStart={handleStart}
                isLearning={isLearning}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
