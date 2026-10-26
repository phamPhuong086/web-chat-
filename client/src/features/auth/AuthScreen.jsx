/**
 * @file AuthScreen.jsx
 * @description Màn hình Đăng ký / Đăng nhập
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Form nhập username, password (và confirmPassword nếu là đăng ký).
 * - Gọi hook useAuth() để thực thi login(username, password) hoặc register(username, password).
 * - Hiển thị thông báo lỗi rõ ràng khi thất bại.
 */

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AuthScreen() {
  const { login, register, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    if (isRegister) {
      const res = await register(username.trim(), password);
      if (res.success) {
        alert("Đăng ký thành công! Hãy đăng nhập.");
        setIsRegister(false);
      } else {
        setError(res.error);
      }
    } else {
      const res = await login(username.trim(), password);
      if (!res.success) {
        setError(res.error);
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>{isRegister ? "Đăng Ký Tài Khoản" : "Đăng Nhập"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, cursor: "pointer" }}>
          {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          {isRegister ? "Đã có tài khoản? Đăng nhập ngay" : "Chưa có tài khoản? Đăng ký tại đây"}
        </button>
      </div>
    </div>
  );
}
