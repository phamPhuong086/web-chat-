/**
 * @file ChatWindow.jsx
 * @description Cửa sổ chat chính (Hiển thị Header phòng chat, danh sách tin nhắn và khung soạn thảo)
 * @assigned_to Thành viên B (phối hợp với C ở nút gọi thoại/video)
 * 
 * CẦN THÊM GÌ:
 * - Lắng nghe Socket:
 *   + Khi đổi phòng: socket.emit("join_room", { roomId })
 *   + Nghe "load_history" để set messageList ban đầu
 *   + Nghe "receive_message" để append tin nhắn mới
 *   + Nghe "message_edited", "message_deleted", "reaction_update"
 * - Mã hóa & giải mã E2EE (qua utils/crypto.js) nếu là phòng 1-1.
 * - Nút gọi thoại và video trên Header: kích hoạt onStartCall("audio" | "video") cho Thành viên C.
 */

import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ room, currentUserId, onStartCall, onOpenGroupSettings }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!room || !socket) return;

    // 1. Tham gia phòng chat
    socket.emit("join_room", { roomId: room._id });

    // 2. Tải lịch sử tin nhắn
    const handleLoadHistory = (history) => {
      // TODO: [B] Giải mã E2EE tin nhắn nếu là phòng 1-1
      setMessages(history);
    };

    // 3. Nhận tin nhắn mới realtime
    const handleReceiveMessage = (newMsg) => {
      // TODO: [B] Giải mã E2EE nếu cần
      setMessages((prev) => [...prev, newMsg]);
    };

    socket.on("load_history", handleLoadHistory);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("load_history", handleLoadHistory);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [room, socket]);

  if (!room) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
        Chọn một hội thoại để bắt đầu trò chuyện
      </div>
    );
  }

  const handleSendMessage = (text, image, replyTo) => {
    if (!socket) return;
    // TODO: [B] Mã hóa tin nhắn E2EE nếu là phòng chat 1-1 trước khi emit
    socket.emit("send_message", { roomId: room._id, text, image, replyTo });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header Cửa Sổ Chat */}
      <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0 }}>{room.name || "Cuộc trò chuyện"}</h4>
          <span style={{ fontSize: 12, color: "#888" }}>{room.isGroup ? `${room.members?.length} thành viên` : "Trực tuyến"}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Nút gọi thoại & video dành cho Thành viên C */}
          <button onClick={() => onStartCall("audio")} title="Gọi thoại" style={{ padding: "6px 12px", cursor: "pointer" }}>📞 Thoại</button>
          <button onClick={() => onStartCall("video")} title="Gọi video" style={{ padding: "6px 12px", cursor: "pointer" }}>📹 Video</button>
          {room.isGroup && (
            <button onClick={onOpenGroupSettings} title="Cài đặt nhóm" style={{ padding: "6px 12px", cursor: "pointer" }}>⚙️ Nhóm</button>
          )}
        </div>
      </div>

      {/* Danh Sách Tin Nhắn */}
      <MessageList messages={messages} currentUserId={currentUserId} />

      {/* Khung Soạn Thảo Tin Nhắn */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
