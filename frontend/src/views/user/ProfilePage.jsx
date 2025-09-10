import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { TrophyIcon, CoinsIcon, AwardIcon, MedalIcon, CrownIcon, GemIcon, StarIcon } from "lucide-react";
import api from "../../lib/axios";
import { formatDate } from "../../lib/utils";

/** Map rank → styles + icon */
const RANK_STYLES = {
  unranked: { bg: "bg-base-200", text: "text-base-content", ring: "ring-base-300", Icon: StarIcon },
  bronze:   { bg: "bg-amber-200", text: "text-amber-900",   ring: "ring-amber-300", Icon: MedalIcon },
  silver:   { bg: "bg-gray-200",  text: "text-gray-900",    ring: "ring-gray-300",  Icon: AwardIcon },
  gold:     { bg: "bg-yellow-200",text: "text-yellow-900",  ring: "ring-yellow-300",Icon: CrownIcon },
  diamond:  { bg: "bg-cyan-200",  text: "text-cyan-900",    ring: "ring-cyan-300",  Icon: GemIcon },
  mythic:   { bg: "bg-purple-200",text: "text-purple-900",  ring: "ring-purple-300",Icon: SparklesIcon},
};

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me")
      .then((res) => setMe(res.data))
      .catch(() => toast.error("Could not load profile"))
      .finally(() => setTimeout(() => setLoading(false), 0));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!me) return <p className="text-center py-24">Profile unavailable.</p>;

  const progress = me.rank?.progressToNext ?? 0;
  const nextName = me.rank?.next?.name || null;
  const toNext   = me.rank?.toNext ?? 0;
  const rankKey  = me.rank?.current?.key || "unranked";
  const rankName = me.rank?.current?.name || "Unranked";
  const c = RANK_STYLES[rankKey] || RANK_STYLES.unranked;
  const Icon = c.Icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back</Link>
          <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
          <div className="w-14" aria-hidden />
        </div>

        {/* Card */}
        <section className="card bg-base-100 shadow-md">
          <div className="card-body p-5 sm:p-8 space-y-8">
            {/* Username + stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase opacity-60">Username</p>
                <p className="text-lg font-semibold break-all">{me.username}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge badge-primary px-3 py-2 text-xs sm:text-sm flex items-center gap-1">
                  <TrophyIcon className="h-4 w-4" />
                  <span>XP {me.xp}</span>
                </span>
                <span className="badge bg-amber-200 text-amber-900 px-3 py-2 text-xs sm:text-sm flex items-center gap-1">
                  <CoinsIcon className="h-4 w-4" />
                  <span>{me.coins} coins</span>
                </span>
              </div>
            </div>

            {/* Rank section — stacked, no overlap */}
            <div className="flex flex-col items-center text-center">
              {/* Big circular emblem with ICON */}
              <div
                className={[
                  "rounded-full ring-4 ring-offset-2 shadow",
                  c.bg, c.text, c.ring,
                  "w-40 h-40 sm:w-44 sm:h-44",
                  "flex items-center justify-center",
                ].join(" ")}
              >
                <Icon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              {/* Rank name under emblem */}
              <div className="mt-3 font-semibold">{rankName}</div>
              <div className="text-sm opacity-70">Your current rank</div>

              {/* Gap before progress */}
              <div className="mt-6 w-full">
                <p className="text-sm opacity-70 mb-3">
                  {nextName ? (
                    <>
                      Progress to <span className="font-medium">{nextName}</span> — {progress}% ({toNext} XP left)
                    </>
                  ) : (
                    <>Top rank reached</>
                  )}
                </p>
                <div className="w-full bg-base-200 h-3 rounded-xl overflow-hidden">
                  <div
                    className="h-3 bg-primary rounded-xl transition-[width] duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-base-200/60">
                <p className="text-xs uppercase opacity-60">Member since</p>
                <p className="font-medium">
                  {me.createdAt ? formatDate(new Date(me.createdAt)) : "—"}
                </p>
              </div>

              {me.isAdmin && (
                <div className="p-4 rounded-lg bg-info/10 border border-info/30">
                  <p className="font-medium">Admin</p>
                  <p className="text-sm opacity-80">You have administrator privileges.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
