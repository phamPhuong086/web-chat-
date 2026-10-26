/**
 * @file CreateGroupModal.jsx
 * @description Modal tạo nhóm chat mới và chọn thành viên từ danh sách bạn bè
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Tải danh sách bạn bè từ GET /api/friends để chọn thành viên đưa vào nhóm.
 * - Form nhập tên nhóm (bắt buộc).
 * - Checkbox danh sách bạn bè để chọn memberIds.
 * - Gọi POST /api/rooms với body: { isGroup: true, name, memberIds } để tạo nhóm.
 */

import { useState, useEffect } from "react";
import api from "../../config/api";

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // TODO: [A] Lấy danh sách bạn bè để chọn vào nhóm
      // api.get("/friends").then(res => setFriends(res.data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm");
      return;
    }
    // TODO: [A] Gọi POST /api/rooms tạo nhóm
    // const res = await api.post("/rooms", { isGroup: true, name: groupName, memberIds: selectedFriends });
    // onGroupCreated(res.data);
    alert("TODO: [A] Tạo nhóm mới");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 400 }}>
        <h3>Tạo Nhóm Chat Mới</h3>
        <form onSubmit={handleCreateGroup}>
          <div style={{ marginBottom: 12 }}>
            <label>Tên nhóm:</label>
            <input
              type="text"
              placeholder="Nhập tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Chọn thành viên ({selectedFriends.length}):</label>
            <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #eee", marginTop: 4, padding: 8 }}>
              {friends.length === 0 ? (
                <p style={{ color: "#888", fontSize: 13 }}>Không có bạn bè để thêm.</p>
              ) : (
                friends.map((f) => (
                  <div key={f._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: 4 }}>
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(f._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedFriends([...selectedFriends, f._id]);
                        else setSelectedFriends(selectedFriends.filter((id) => id !== f._id));
                      }}
                    />
                    <span>{f.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px" }}>Hủy</button>
            <button type="submit" style={{ padding: "8px 16px" }}>Tạo nhóm</button>
          </div>
        </form>
      </div>
    </div>
  );
}
