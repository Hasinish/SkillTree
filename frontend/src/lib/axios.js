import axios from "axios";
import { getToken, clearAuth } from "./auth";

const isDev = import.meta.env.DEV;

let API_BASE;
if (isDev) {
  // local dev server
  API_BASE = "http://localhost:5001/api";
} else {
  // On Render (separate services) this MUST be set in the Frontend service
  API_BASE = import.meta.env.VITE_API_BASE;
  if (!API_BASE) {
    // Hard fail loudly to avoid silent "/api" fallback when services are split
    throw new Error(
      "Missing VITE_API_BASE at build/runtime. Set it to your backend URL, e.g. https://skilltree-backend.onrender.com/api"
    );
  }
}

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || "";
    if (
      status === 401 &&
      !reqUrl.endsWith("/auth/login") &&
      !reqUrl.endsWith("/auth/register")
    ) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
