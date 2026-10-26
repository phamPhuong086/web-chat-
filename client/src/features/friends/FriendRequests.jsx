/**
 * @file FriendRequests.jsx
 * @description Danh sách lời mời kết bạn gửi đến người dùng
 * @assigned_to Thành viên A
 * 
 * CẦN THÊM GÌ:
 * - Gọi GET /api/friends/requests để tải các lời mời đang chờ (pending).
 * - Nút "Chấp nhận" gọi POST /api/friends/accept { requestId }.
 * - Nút "Từ chối" gọi POST /api/friends/reject { requestId }.
 * - Lắng nghe Socket event "friend_request" để cập nhật realtime khi có người gửi lời mời.
 */

import { useState, useEffect } from "react";
import api from "../../config/api";
import { useSocket } from "../../context/SocketContext";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    // TODO: [A] Lấy danh sách lời mời từ GET /api/friends/requests
    // api.get("/friends/requests").then(res => setRequests(res.data));

    if (socket) {
      // TODO: [A] Lắng nghe realtime khi có lời mời mới
      // socket.on("friend_request", (reqData) => setRequests(prev => [reqData, ...prev]));
    }
  }, [socket]);

  const handleAccept = async (requestId) => {
    // TODO: [A] Gọi POST /api/friends/accept
  };

  const handleReject = async (requestId) => {
    // TODO: [A] Gọi POST /api/friends/reject
  };

  return (
    <div style={{ padding: 16 }}>
      <h4>Lời Mời Kết Bạn ({requests.length})</h4>
      {requests.length === 0 ? (
        <p style={{ color: "#888" }}>Không có lời mời kết bạn nào.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {requests.map((r) => (
            <li key={r._id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #eee" }}>
              <span>Từ: <strong>{r.fromUsername}</strong></span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleAccept(r._id)}>Chấp nhận</button>
                <button onClick={() => handleReject(r._id)}>Từ chối</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
