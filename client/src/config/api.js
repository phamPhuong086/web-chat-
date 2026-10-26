/**
 * @file api.js
 * @description Axios instance thống nhất, tự động đính kèm JWT Bearer token
 * @assigned_to Thành viên A (Cấu hình dùng chung cho cả nhóm)
 */

import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor tự động gắn token vào tất cả request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi 401 (hết hạn token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Có thể kích hoạt logout hoặc xóa token
      console.warn("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    }
    return Promise.reject(error);
  }
);

export default api;
