/**
 * @file GroupSettingsModal.jsx
 * @description Modal quản lý nhóm (Đổi tên, ảnh, mô tả nhóm; Thêm hoặc xóa thành viên)
 * @assigned_to Thành viên A
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function GroupSettingsModal({ isOpen, onClose, room, currentUserId, onGroupUpdated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setName(room.name || "");
      setDescription(room.description || "");
      setMembers(room.members || []);
    }
  }, [room]);

  if (!isOpen || !room) return null;

  const creatorId = room.creator?._id || room.creator;
  const isCreator = String(creatorId) === String(currentUserId);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Tên nhóm không được để trống");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/rooms/${room._id}`, {
        name: name.trim(),
        description: description.trim(),
        memberIds: members.map((m) => m._id || m),
      });

      if (onGroupUpdated) {
        onGroupUpdated(res.data);
      }
      alert("Cập nhật thông tin nhóm thành công!");
      onClose();
    } catch (err) {
      alert("Lỗi cập nhật nhóm: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberIdToRemove) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?")) return;
    const remainingMembers = members.filter((m) => (m._id || m) !== memberIdToRemove);
    try {
      const res = await api.put(`/rooms/${room._id}`, {
        memberIds: remainingMembers.map((m) => m._id || m),
      });
      setMembers(res.data.members || remainingMembers);
      if (onGroupUpdated) {
        onGroupUpdated(res.data);
      }
    } catch (err) {
      alert("Lỗi khi xóa thành viên: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 440, maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>Cài Đặt Nhóm: {room.name}</h3>
        {!isCreator && (
          <p style={{ color: "#d97706", fontSize: 13, background: "#fef3c7", padding: 8, borderRadius: 4, margin: "0 0 12px 0" }}>
            Bạn là thành viên (chỉ Trưởng nhóm mới có quyền đổi thông tin hoặc xóa thành viên).
          </p>
        )}
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Tên nhóm:</label>
            <input
              type="text"
              disabled={!isCreator}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Mô tả nhóm:</label>
            <textarea
              disabled={!isCreator}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Thành viên nhóm ({members.length}):</label>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 6, maxHeight: 150, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 4 }}>
              {members.map((m) => {
                const memberId = m._id || m;
                const memberUsername = m.username || memberId;
                const isMemberCreator = String(memberId) === String(creatorId);

                return (
                  <li
                    key={memberId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <span>
                      {memberUsername} {isMemberCreator && <em style={{ fontSize: 11, color: "#4f46e5" }}>(Trưởng nhóm)</em>}
                    </span>
                    {isCreator && !isMemberCreator && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(memberId)}
                        style={{ color: "#ef4444", fontSize: 12, border: "none", background: "none", cursor: "pointer" }}
                      >
                        Xóa khỏi nhóm
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>
              Đóng
            </button>
            {isCreator && (
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none" }}
              >
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
