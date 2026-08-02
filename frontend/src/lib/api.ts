import axios from "axios";
import { auth } from "./firebase";

// Determine the base URL depending on the environment
const baseURL = import.meta.env['VITE_API_URL'] || "http://localhost:5001/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      // Force refresh if necessary, but usually getIdToken() is fine
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
