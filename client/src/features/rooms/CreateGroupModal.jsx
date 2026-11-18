/**
 * @file CreateGroupModal.jsx
 * @description Modal tạo nhóm chat mới và chọn thành viên
 * @assigned_to Thành viên A
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setSearchUser("");
      setFoundUsers([]);
      setSelectedMembers([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Tìm kiếm thành viên để đưa vào nhóm
  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchUser.trim()) return;
    try {
      const res = await api.get(`/users/search?keyword=${encodeURIComponent(searchUser.trim())}`);
      setFoundUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi tìm kiếm người dùng:", err);
    }
  };

  const toggleSelectMember = (user) => {
    if (selectedMembers.some((m) => m._id === user._id)) {
      setSelectedMembers(selectedMembers.filter((m) => m._id !== user._id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/rooms", {
        isGroup: true,
        name: groupName.trim(),
        memberIds: selectedMembers.map((m) => m._id),
      });

      if (onGroupCreated) {
        onGroupCreated(res.data);
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo nhóm chat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 440, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Tạo Nhóm Chat Mới</h3>

        <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Tên nhóm */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Tên nhóm chat *</label>
            <input
              type="text"
              placeholder="Ví dụ: Nhóm học tập, Dự án Web..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, boxSizing: "border-box" }}
              required
            />
          </div>

          {/* Thành viên đã chọn */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Thành viên được chọn ({selectedMembers.length}):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, minHeight: 32 }}>
              {selectedMembers.length === 0 ? (
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Chưa chọn thành viên nào</span>
              ) : (
                selectedMembers.map((m) => (
                  <span
                    key={m._id}
                    style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 8px", borderRadius: 12, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {m.username}
                    <button
                      type="button"
                      onClick={() => toggleSelectMember(m)}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#4338ca", padding: 0, fontWeight: "bold" }}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Tìm kiếm thành viên thêm vào */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Tìm người dùng thêm vào nhóm:</label>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <input
                type="text"
                placeholder="Nhập tên người dùng..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                style={{ flex: 1, padding: 8, boxSizing: "border-box" }}
              />
              <button type="button" onClick={handleSearchUsers} style={{ padding: "8px 12px", background: "#f3f4f6" }}>
                Tìm
              </button>
            </div>

            {/* Danh sách kết quả tìm kiếm */}
            <div style={{ maxHeight: 120, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 4, marginTop: 8, padding: 6 }}>
              {foundUsers.length === 0 ? (
                <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: 6 }}>
                  {searchUser ? "Không tìm thấy người dùng" : "Tìm theo username để chọn"}
                </div>
              ) : (
                foundUsers.map((u) => {
                  const isChecked = selectedMembers.some((m) => m._id === u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleSelectMember(u)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", cursor: "pointer", background: isChecked ? "#f0fdf4" : "transparent" }}
                    >
                      <span style={{ fontSize: 13 }}>{u.username}</span>
                      <input type="checkbox" checked={isChecked} readOnly />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer nút hành động */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none" }}
            >
              {submitting ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
