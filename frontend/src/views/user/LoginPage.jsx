import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { saveToken, saveIsAdmin } from "../../lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { username, password });
      saveToken(data.token);
      saveIsAdmin(data.isAdmin);

      toast.success("Welcome back!");
      if (data.isAdmin) {
        nav("/");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      // show only the toast, keep inputs as-is
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral via-neutral to-neutral flex items-center justify-center p-4">
      <form
        onSubmit={handle}
        className="bg-base-100 p-6 w-full max-w-md rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-center mb-6">Log In</h1>
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
        <button type="submit" className="btn btn-primary w-full mb-4">
          Enter
        </button>
        <p className="text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-700 underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
