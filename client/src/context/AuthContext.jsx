/**
 * @file AuthContext.jsx
 * @description Quản lý trạng thái xác thực người dùng (User, Token, Login, Register, Logout)
 * @assigned_to Thành viên A
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // Lưu trạng thái vào localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // TODO: [A] Viết hàm xử lý đăng nhập (gọi POST /api/auth/login)
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      setToken(res.data.token);
      setUser({ id: res.data.id, username: res.data.username, avatar: res.data.avatar });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Đăng nhập thất bại" };
    } finally {
      setLoading(false);
    }
  };

  // TODO: [A] Viết hàm xử lý đăng ký (gọi POST /api/auth/register)
  const register = async (username, password) => {
    setLoading(true);
    try {
      await api.post("/auth/register", { username, password });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Đăng ký thất bại" };
    } finally {
      setLoading(false);
    }
  };

  // TODO: [A] Viết hàm đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // TODO: [A] Viết hàm cập nhật lại thông tin user trong Context
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
