/**
 * @file ProfileModal.jsx
 * @description Modal xem và cập nhật hồ sơ cá nhân (Avatar, ngày sinh, sở thích, tiểu sử, đổi mật khẩu)
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Gọi GET /api/users/profile để tải thông tin hiện tại khi mở modal.
 * - Form sửa: bio, hobbies (nhập nhiều sở thích phân cách bởi dấu phẩy), birthday, avatar (URL hoặc tải ảnh base64).
 * - Gọi PUT /api/users/profile để lưu thay đổi.
 * - Tab/Form đổi mật khẩu: gọi PUT /api/users/password.
 */

import { useState, useEffect } from "react";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfileModal({ isOpen, onClose }) {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({ bio: "", hobbies: [], birthday: "", avatar: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // TODO: [A] Lấy thông tin profile từ GET /api/users/profile
      // api.get("/users/profile").then(res => setProfile(res.data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: [A] Gọi PUT /api/users/profile
      // const res = await api.put("/users/profile", profile);
      // updateUser({ avatar: profile.avatar });
      alert("TODO: [A] Lưu hồ sơ cá nhân");
      onClose();
    } catch (err) {
      alert("Lỗi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 400, maxHeight: "90vh", overflowY: "auto" }}>
        <h3>Hồ Sơ Cá Nhân</h3>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 12 }}>
            <label>Ảnh đại diện (URL):</label>
            <input
              type="text"
              value={profile.avatar}
              onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Tiểu sử (Bio):</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Ngày sinh:</label>
            <input
              type="date"
              value={profile.birthday ? profile.birthday.substring(0, 10) : ""}
              onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>Đóng</button>
            <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
