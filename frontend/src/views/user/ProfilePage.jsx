import { useEffect, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/utils";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me")
      .then((res) => setMe(res.data))
      .catch(() => toast.error("Could not load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!me) {
    return <p className="text-center py-20">Profile unavailable.</p>;
  }

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="btn btn-ghost">← Back</Link>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div />
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-70">Username</div>
                <div className="text-lg font-semibold">{me.username}</div>
              </div>
              <div className="badge badge-primary px-4 py-3 text-sm">
                XP {me.xp}
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="text-sm opacity-70">
              Member since{" "}
              <span className="font-medium">
                {me.createdAt ? formatDate(new Date(me.createdAt)) : "—"}
              </span>
            </div>

            {me.isAdmin && (
              <div className="alert alert-info mt-2">
                <span>You are an admin.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
