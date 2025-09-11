import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import RankBadge from "../../components/user/RankBadge";
import { TrophyIcon } from "lucide-react";

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/users/leaderboard?limit=100&offset=0");
        setRows(data.items || []);
        setMe(data.me || null);
      } catch {
        toast.error("Could not load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-ghost">← Back</Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-primary" />
            Global Leaderboard
          </h1>
          <div />
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Rank</th>
                    <th className="text-right">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.position}-${r.username}`} className={r.position === me?.position ? "bg-secondary/10" : ""}>
                      <td className="font-semibold">{r.position}</td>
                      <td className="font-medium">{r.username}</td>
                      <td>
                        <RankBadge rank={r.rank} />
                      </td>
                      <td className="text-right">{r.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {me && (
              <div className="p-4 border-t text-sm opacity-80">
                You are currently <span className="font-semibold">#{me.position}</span> with{" "}
                <span className="font-semibold">{me.xp}</span> XP.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
