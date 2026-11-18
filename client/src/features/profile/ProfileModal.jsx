/**
 * @file ProfileModal.jsx
 * @description Modal xem và cập nhật hồ sơ cá nhân (Avatar, ngày sinh, sở thích, tiểu sử)
 * @assigned_to Thành viên A
 */

import { useState, useEffect } from "react";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfileModal({ isOpen, onClose }) {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState({ bio: "", hobbies: [], birthday: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      api
        .get("/users/profile")
        .then((res) => {
          if (res.data) {
            setProfile({
              bio: res.data.bio || "",
              hobbies: res.data.hobbies || [],
              birthday: res.data.birthday ? res.data.birthday.substring(0, 10) : "",
              avatar: res.data.avatar || "",
            });
          }
        })
        .catch((err) => console.error("Lỗi lấy thông tin profile:", err))
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/users/profile", profile);
      updateUser({ avatar: profile.avatar });
      alert("Cập nhật hồ sơ cá nhân thành công!");
      onClose();
    } catch (err) {
      alert("Lỗi cập nhật hồ sơ: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 400, maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Hồ Sơ Cá Nhân</h3>
        {fetching ? (
          <p style={{ textAlign: "center", color: "#888" }}>Đang tải thông tin...</p>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Ảnh đại diện (URL ảnh):</label>
              <input
                type="text"
                placeholder="https://example.com/avatar.png"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Tiểu sử (Bio):</label>
              <textarea
                rows={3}
                placeholder="Giới thiệu đôi nét về bản thân..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Ngày sinh:</label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>
                Đóng
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none" }}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
