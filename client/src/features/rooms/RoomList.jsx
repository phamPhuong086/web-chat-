/**
 * @file RoomList.jsx
 * @description Danh sách các hội thoại (chat cá nhân & nhóm)
 * @assigned_to Thành viên A
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function RoomList({ currentUserId, selectedRoomId, onSelectRoom, onOpenCreateGroup }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDirectChatModal, setShowDirectChatModal] = useState(false);
  const [searchUserKeyword, setSearchUserKeyword] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searching, setSearching] = useState(false);

  // Lấy danh sách các phòng chat
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rooms");
      setRooms(res.data || []);
      // Nếu chưa chọn phòng và đã có danh sách, có thể chọn phòng đầu tiên
      if (!selectedRoomId && res.data && res.data.length > 0) {
        onSelectRoom(res.data[0]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Tìm kiếm người dùng để mở chat 1-1
  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchUserKeyword.trim()) return;
    try {
      setSearching(true);
      const res = await api.get(`/users/search?keyword=${encodeURIComponent(searchUserKeyword.trim())}`);
      setSearchedUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm người dùng:", err);
    } finally {
      setSearching(false);
    }
  };

  // Tạo hoặc mở phòng chat 1-1 với người dùng
  const handleStartDirectChat = async (targetUserId) => {
    try {
      const res = await api.post("/rooms", {
        isGroup: false,
        memberIds: [targetUserId],
      });
      const room = res.data;
      // Cập nhật lại danh sách nếu phòng chưa có trong list
      setRooms((prev) => {
        const exists = prev.some((r) => r._id === room._id);
        return exists ? prev : [room, ...prev];
      });
      onSelectRoom(room);
      setShowDirectChatModal(false);
      setSearchUserKeyword("");
      setSearchedUsers([]);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo cuộc trò chuyện");
    }
  };

  return (
    <div style={{ width: 300, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      {/* Header Danh sách phòng */}
      <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 16 }}>Hội Thoại</strong>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setShowDirectChatModal(true)}
            title="Nhắn tin với người dùng mới"
            style={{ padding: "4px 8px", fontSize: 12, cursor: "pointer", background: "#f3f4f6", border: "1px solid #d1d5db" }}
          >
            + 1-1
          </button>
          <button
            onClick={onOpenCreateGroup}
            title="Tạo nhóm chat mới"
            style={{ padding: "4px 8px", fontSize: 12, cursor: "pointer", background: "#4f46e5", color: "#fff", border: "none" }}
          >
            + Nhóm
          </button>
        </div>
      </div>

      {/* Danh sách phòng */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <p style={{ padding: 16, color: "#888", fontSize: 14, textAlign: "center" }}>Đang tải danh sách...</p>
        ) : rooms.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: 14 }}>Chưa có cuộc trò chuyện nào.</p>
            <button
              onClick={() => setShowDirectChatModal(true)}
              style={{ fontSize: 13, padding: "6px 12px", background: "#4f46e5", color: "#fff", border: "none" }}
            >
              Bắt đầu trò chuyện
            </button>
          </div>
        ) : (
          rooms.map((room) => {
            const isSelected = selectedRoomId === room._id;
            const otherMember = !room.isGroup
              ? room.members?.find((m) => (m._id || m) !== currentUserId)
              : null;
            const displayName = room.isGroup
              ? room.name
              : otherMember?.username || "Người dùng";
            const isOnline = otherMember?.isOnline || false;

            return (
              <div
                key={room._id}
                onClick={() => onSelectRoom(room)}
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  background: isSelected ? "#eef2ff" : "transparent",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "background 0.2s",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", background: room.isGroup ? "#6366f1" : "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, flexShrink: 0 }}>
                  {displayName.charAt(0).toUpperCase()}
                  {!room.isGroup && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: isOnline ? "#22c55e" : "#9ca3af",
                        border: "2px solid #fff",
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: isSelected ? 600 : 500, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {displayName}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {room.isGroup ? `Nhóm (${room.members?.length || 0} tv)` : isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal tìm kiếm người dùng để nhắn tin 1-1 */}
      {showDirectChatModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 380, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Nhắn Tin Cá Nhân (1-1)</h3>
            <form onSubmit={handleSearchUsers} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Tìm username người nhận..."
                value={searchUserKeyword}
                onChange={(e) => setSearchUserKeyword(e.target.value)}
                style={{ flex: 1, padding: 8 }}
              />
              <button type="submit" disabled={searching} style={{ padding: "8px 14px", background: "#4f46e5", color: "#fff", border: "none" }}>
                {searching ? "..." : "Tìm"}
              </button>
            </form>

            <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #eee", paddingTop: 10 }}>
              {searchedUsers.length === 0 ? (
                <p style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
                  {searchUserKeyword ? "Không tìm thấy người dùng phù hợp." : "Nhập username để tìm kiếm."}
                </p>
              ) : (
                searchedUsers.map((u) => (
                  <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <strong>{u.username}</strong>
                      <span style={{ fontSize: 11, marginLeft: 6, color: u.isOnline ? "green" : "gray" }}>
                        {u.isOnline ? "● online" : "○ offline"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleStartDirectChat(u._id)}
                      style={{ padding: "4px 10px", fontSize: 12, background: "#10b981", color: "#fff", border: "none", cursor: "pointer" }}
                    >
                      Nhắn tin
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button onClick={() => setShowDirectChatModal(false)} style={{ padding: "8px 16px" }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
