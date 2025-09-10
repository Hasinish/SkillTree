import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import SkillProgressBar from "../../components/user/SkillProgressBar";

export default function DashboardSkillDetailPage() {
  const { id: skillId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/learning/${skillId}`)
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

  const stageSrc = (p) => {
    if (p === 0)   return "/trees/seed.png";
    if (p < 25)    return "/trees/sprout.png";
    if (p < 50)    return "/trees/small-plant.png";
    if (p < 75)    return "/trees/young-tree.png";
    if (p < 100)   return "/trees/leafy-tree.png";
    return "/trees/full-tree.png";
  };

  const xpPerTask = entry.xpPerTask ?? 10;
  const totalTasks = entry.tasks.length;
  const doneTasks  = entry.completedTasks.filter(Boolean).length;
  const pct        = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleToggle = async (index) => {
    try {
      const { data } = await api.patch(`/learning/${skillId}/task/${index}`);
      setEntry((prev) => ({ ...prev, completedTasks: data.completedTasks }));

      // Refresh navbar XP badge
      if (typeof data?.xp === "number") {
        window.dispatchEvent(new CustomEvent("xp:update", { detail: { xp: data.xp } }));
      }

      // XP toast
      if (typeof data?.deltaXp === "number" && data.deltaXp !== 0) {
        const sign = data.deltaXp > 0 ? "+" : "";
        toast.success(`${sign}${data.deltaXp} XP`);
      }

      // COINS toast(s)
      if (typeof data?.deltaCoins === "number" && data.deltaCoins > 0) {
        toast.success(`+${data.deltaCoins} coins`);
      }
      if (Array.isArray(data?.awardedMilestones) && data.awardedMilestones.length) {
        data.awardedMilestones.forEach((t) =>
          toast.success(`Milestone ${t}%! +${data.milestoneBonuses?.[t] ?? ""} coins`)
        );
      }

      // Trigger daily streak tick only when marking as done (not unmarking)
      if (data?.deltaXp && data.deltaXp > 0) {
        try {
          const streak = await api.post("/streak/tick");
          if (streak?.data?.deltaCoins > 0) {
            toast.success(`Daily streak +${streak.data.deltaCoins} coins`);
          }
        } catch { /* no-op */ }
      }
    } catch {
      toast.error("Could not update that task");
    }
  };

  const earnedXp = doneTasks * xpPerTask;
  const totalEarnableXp = totalTasks * xpPerTask;

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-ghost">
            ← Back to Dashboard
          </Link>
          {/* Per-skill XP (done/total_earnable) */}
          <div className="badge badge-primary px-4 py-3 text-sm">
            XP: {earnedXp}/{totalEarnableXp}
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="text-2xl font-bold mb-1">{entry.name}</h1>
            <p className="text-sm opacity-70 mb-2">{entry.category}</p>

            <div className="flex flex-col items-center mb-4 w-full">
              <img
                src={stageSrc(pct)}
                alt="Skill growth stage"
                className="w-40 h-40 object-contain"
              />
              <div className="w-full mt-2">
                <SkillProgressBar percent={pct} />
              </div>
              <div className="text-sm opacity-70 mt-2">{pct}% complete</div>
            </div>

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
                        entry.completedTasks[i] ? "btn-success" : "btn-outline"
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
