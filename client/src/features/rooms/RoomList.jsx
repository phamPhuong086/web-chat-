/**
 * @file RoomList.jsx
 * @description Danh sách các hội thoại (chat cá nhân & nhóm)
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Gọi GET /api/rooms để lấy danh sách phòng của người dùng hiện tại.
 * - Phân biệt hiển thị:
 *   + Nếu isGroup: false -> Hiển thị tên & avatar của đối phương.
 *   + Nếu isGroup: true -> Hiển thị tên nhóm & avatar nhóm.
 * - Nút "Tạo nhóm mới" mở CreateGroupModal.
 * - Khi click vào 1 phòng -> Gọi onSelectRoom(room) để truyền vào ChatWindow (của B).
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function RoomList({ currentUserId, selectedRoomId, onSelectRoom, onOpenCreateGroup }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // TODO: [A] Lấy danh sách phòng từ GET /api/rooms
    // api.get("/rooms").then(res => setRooms(res.data));
  }, []);

  return (
    <div style={{ width: 280, borderRight: "1px solid #ddd", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Hội Thoại</strong>
        <button onClick={onOpenCreateGroup} style={{ padding: "4px 8px", cursor: "pointer" }}>+ Nhóm</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {rooms.length === 0 ? (
          <p style={{ padding: 16, color: "#888", fontSize: 14 }}>Chưa có hội thoại nào.</p>
        ) : (
          rooms.map((room) => {
            const isSelected = selectedRoomId === room._id;
            // Xác định tên hiển thị nếu là chat 1-1
            const displayName = room.isGroup
              ? room.name
              : room.members.find((m) => m._id !== currentUserId)?.username || "Người dùng";

            return (
              <div
                key={room._id}
                onClick={() => onSelectRoom(room)}
                style={{
                  padding: 12,
                  cursor: "pointer",
                  background: isSelected ? "#eef2ff" : "transparent",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ fontWeight: isSelected ? "bold" : "normal" }}>{displayName}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{room.isGroup ? "Nhóm chat" : "Trò chuyện cá nhân"}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
