// Single axios instance for the whole app. Every service file
// (productService, adminService) imports THIS instead of calling
// axios directly, so base URL, auth header injection and error
// unwrapping are handled in exactly one place.
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the admin JWT (if present) to every outgoing request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap the { success, data } envelope and normalize errors so
// components can just `await productService.list()` and `try/catch`
// a plain Error with a readable `.message`.
axiosClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Сүлжээний алдаа гарлаа';
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
