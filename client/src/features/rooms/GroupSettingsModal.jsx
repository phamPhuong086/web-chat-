/**
 * @file GroupSettingsModal.jsx
 * @description Modal quản lý nhóm (Đổi tên, ảnh, mô tả nhóm; Thêm hoặc xóa thành viên)
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Kiểm tra nếu currentUserId === room.creator -> Mới cho phép sửa thông tin và đuổi thành viên.
 * - Form sửa tên, mô tả, avatar nhóm.
 * - Danh sách thành viên hiện tại: có nút "Xóa khỏi nhóm" (chỉ trưởng nhóm thấy).
 * - Chọn thêm bạn bè chưa có trong nhóm để thêm vào.
 * - Gọi PUT /api/rooms/:roomId để lưu thay đổi.
 */

import { useState } from "react";
import api from "../../config/api";

export default function GroupSettingsModal({ isOpen, onClose, room, currentUserId, onGroupUpdated }) {
  const [name, setName] = useState(room?.name || "");
  const [description, setDescription] = useState(room?.description || "");

  if (!isOpen || !room) return null;

  const isCreator = room.creator === currentUserId;

  const handleUpdate = async (e) => {
    e.preventDefault();
    // TODO: [A] Gọi PUT /api/rooms/:roomId
    alert("TODO: [A] Cập nhật thông tin nhóm");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 420, maxHeight: "90vh", overflowY: "auto" }}>
        <h3>Cài Đặt Nhóm: {room.name}</h3>
        {!isCreator && <p style={{ color: "orange", fontSize: 13 }}>Bạn là thành viên (chỉ Trưởng nhóm mới có quyền đổi thông tin).</p>}
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 12 }}>
            <label>Tên nhóm:</label>
            <input
              type="text"
              disabled={!isCreator}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Mô tả nhóm:</label>
            <textarea
              disabled={!isCreator}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Thành viên nhóm ({room.members?.length || 0}):</label>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 4 }}>
              {room.members?.map((m) => (
                <li key={m._id || m} style={{ display: "flex", justifyContent: "space-between", padding: 4 }}>
                  <span>{m.username || m}</span>
                  {isCreator && (m._id || m) !== currentUserId && (
                    <button type="button" style={{ color: "red", fontSize: 12 }}>Xóa</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>Đóng</button>
            {isCreator && <button type="submit" style={{ padding: "8px 16px" }}>Lưu thay đổi</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
