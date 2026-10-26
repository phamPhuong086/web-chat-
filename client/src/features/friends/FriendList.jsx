/**
 * @file FriendList.jsx
 * @description Danh sách bạn bè, tìm kiếm người dùng mới để kết bạn
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Gọi GET /api/friends để lấy danh sách bạn bè hiện tại.
 * - Hiển thị trạng thái isOnline (chấm xanh/xám).
 * - Tìm kiếm người dùng qua GET /api/users/search?keyword=... và nút gửi lời mời POST /api/friends/request.
 * - Nút Hủy kết bạn gọi POST /api/friends/unfriend.
 * - Nút Nhắn tin: Mở hoặc tạo phòng chat 1-1 qua POST /api/rooms.
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function FriendList({ onSelectFriendToChat }) {
  const [friends, setFriends] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // TODO: [A] Lấy danh sách bạn bè từ GET /api/friends
    // api.get("/friends").then(res => setFriends(res.data));
  }, []);

  const handleSearch = async () => {
    // TODO: [A] Gọi GET /api/users/search?keyword=searchKeyword
  };

  const handleSendFriendRequest = async (targetId) => {
    // TODO: [A] Gọi POST /api/friends/request với { targetId }
  };

  return (
    <div style={{ padding: 16 }}>
      <h4>Danh Sách Bạn Bè</h4>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Tìm bạn theo username..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 16px" }}>Tìm</button>
      </div>

      {friends.length === 0 ? (
        <p style={{ color: "#888" }}>Chưa có bạn bè nào.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {friends.map((f) => (
            <li key={f._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #eee" }}>
              <div>
                <strong>{f.username}</strong>
                <span style={{ marginLeft: 8, fontSize: 12, color: f.isOnline ? "green" : "gray" }}>
                  {f.isOnline ? "● Online" : "○ Offline"}
                </span>
              </div>
              <button onClick={() => onSelectFriendToChat && onSelectFriendToChat(f._id)}>Nhắn tin</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
