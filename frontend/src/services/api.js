import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.example.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sx_token");
      localStorage.removeItem("sx_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
