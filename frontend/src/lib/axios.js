import axios from "axios";
import { getToken, clearAuth } from "./auth";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

const api = axios.create({ baseURL: BASE_URL });

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
