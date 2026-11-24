/**
 * @file FriendList.jsx
 * @description Danh sách bạn bè và tìm kiếm người dùng để nhắn tin
 * @assigned_to Thành viên A
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function FriendList({ onSelectFriendToChat }) {
  const [friends, setFriends] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Tải danh sách bạn bè
    api
      .get("/friends")
      .then((res) => setFriends(res.data || []))
      .catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    try {
      setSearching(true);
      const res = await api.get(`/users/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm người dùng:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h4 style={{ margin: "0 0 12px 0" }}>Tìm Người Dùng & Bạn Bè</h4>

      {/* Form tìm kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: 16, display: "flex", gap: 6 }}>
        <input
          type="text"
          placeholder="Tìm theo username..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={searching} style={{ padding: "8px 14px", background: "#4f46e5", color: "#fff", border: "none" }}>
          {searching ? "..." : "Tìm"}
        </button>
      </form>

      {/* Kết quả tìm kiếm */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <strong style={{ fontSize: 13, color: "#4f46e5" }}>Kết quả tìm kiếm:</strong>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 6 }}>
            {searchResults.map((u) => (
              <li
                key={u._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 8,
                  borderBottom: "1px solid #f3f4f6",
                  background: "#f9fafb",
                  borderRadius: 4,
                  marginBottom: 4,
                }}
              >
                <div>
                  <strong>{u.username}</strong>
                  <span style={{ marginLeft: 8, fontSize: 12, color: u.isOnline ? "green" : "gray" }}>
                    {u.isOnline ? "● Online" : "○ Offline"}
                  </span>
                </div>
                <button
                  onClick={() => onSelectFriendToChat && onSelectFriendToChat(u._id)}
                  style={{ padding: "4px 10px", fontSize: 12, background: "#10b981", color: "#fff", border: "none" }}
                >
                  Nhắn tin
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Danh sách bạn bè hiện tại */}
      <strong style={{ fontSize: 13 }}>Danh sách bạn bè:</strong>
      {friends.length === 0 ? (
        <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>Chưa có bạn bè nào. Hãy tìm kiếm người dùng ở trên để bắt đầu trò chuyện!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {friends.map((f) => (
            <li
              key={f._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{f.username}</strong>
                <span style={{ marginLeft: 8, fontSize: 12, color: f.isOnline ? "green" : "gray" }}>
                  {f.isOnline ? "● Online" : "○ Offline"}
                </span>
              </div>
              <button
                onClick={() => onSelectFriendToChat && onSelectFriendToChat(f._id)}
                style={{ padding: "4px 10px", fontSize: 12, background: "#4f46e5", color: "#fff", border: "none" }}
              >
                Nhắn tin
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
