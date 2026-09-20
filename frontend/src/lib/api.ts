import axios from "axios";

// Determine the base URL depending on the environment
const baseURL = import.meta.env['VITE_API_URL'] || "http://localhost:5001/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("redpint_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Don't clear on login/register attempt failures
      const url = error.config?.url || "";
      if (!url.includes("/auth/login") && !url.includes("/donors/register") && !url.includes("/hospitals/register")) {
        localStorage.removeItem("redpint_token");
        localStorage.removeItem("redpint_role");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
