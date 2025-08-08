import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { saveToken, saveIsAdmin } from "../../lib/auth";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", { username, password });
      saveToken(data.token);
      saveIsAdmin(data.isAdmin);   

      toast.success("Account created!");

      if (data.isAdmin) {
        nav("/");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral via-neutral to-neutral flex items-center justify-center p-4">
      <form
        onSubmit={handle}
        className="bg-base-100 p-6 w-full max-w-md rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-center mb-6">Sign Up</h1>
        <input
          type="text"
          placeholder="Username"
          className="input input-bordered w-full mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-full mb-4">Create</button>
        <p className="text-center">
          Already have one?{" "}
          <Link to="/login" className="text-blue-800 underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
