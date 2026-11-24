/**
 * @file FriendRequests.jsx
 * @description Danh sách lời mời kết bạn gửi đến người dùng
 * @assigned_to Thành viên A
 */

import { useState, useEffect } from "react";
import api from "../../config/api";
import { useSocket } from "../../context/SocketContext";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/friends/requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách lời mời:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (socket) {
      const handleNewRequest = (reqData) => {
        setRequests((prev) => [reqData, ...prev]);
      };
      socket.on("friend_request", handleNewRequest);
      return () => {
        socket.off("friend_request", handleNewRequest);
      };
    }
  }, [socket]);

  const handleAccept = async (requestId) => {
    try {
      await api.post("/friends/accept", { requestId });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      alert("Đã chấp nhận lời mời kết bạn!");
    } catch (err) {
      alert("Lỗi khi chấp nhận: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post("/friends/reject", { requestId });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      alert("Lỗi khi từ chối: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h4 style={{ margin: "0 0 12px 0" }}>Lời Mời Kết Bạn ({requests.length})</h4>
      {loading ? (
        <p style={{ color: "#888", fontSize: 13 }}>Đang tải lời mời...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: "#888", fontSize: 13 }}>Không có lời mời kết bạn nào.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {requests.map((r) => (
            <li
              key={r._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <strong>{r.fromUsername || r.from?.username}</strong>
                <div style={{ fontSize: 11, color: "#888" }}>Đã gửi lời mời cho bạn</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handleAccept(r._id)}
                  style={{ padding: "4px 10px", fontSize: 12, background: "#22c55e", color: "#fff", border: "none" }}
                >
                  Chấp nhận
                </button>
                <button
                  onClick={() => handleReject(r._id)}
                  style={{ padding: "4px 10px", fontSize: 12, background: "#ef4444", color: "#fff", border: "none" }}
                >
                  Từ chối
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
