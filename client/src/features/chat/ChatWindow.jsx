
import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  room,
  currentUserId,
  onStartCall,
  onOpenGroupSettings,
}) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);

  const roomId = room?._id;

  useEffect(() => {
    if (!roomId || !socket) {
      setMessages([]);
      return;
    }

    // Xóa tin nhắn của phòng trước khi chuyển phòng
    setMessages([]);

    // 1. Nhận lịch sử tin nhắn
      const handleLoadHistory = ({ roomId: eventRoomId, messages: history }) => {
      // Bỏ qua lịch sử của phòng không còn được mở
      if (String(eventRoomId) !== String(roomId)) return;

      const historyMessages = Array.isArray(history) ? history : [];

      setMessages((prev) => {
        const messageMap = new Map();

        historyMessages.forEach((msg) => {
          messageMap.set(String(msg._id), msg);
        });

        // Giữ tin nhắn mới nhận trong lúc tải lịch sử
        prev.forEach((msg) => {
          if (!messageMap.has(String(msg._id))) {
            messageMap.set(String(msg._id), msg);
          }
        });

        return Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      });
    };

    // 2. Nhận tin nhắn mới
    const handleReceiveMessage = (newMsg) => {
    // Chỉ nhận tin nhắn thuộc phòng đang mở
    if (String(newMsg.roomID) !== String(roomId)) return;

    setMessages((prev) => {
      const exists = prev.some(
        (msg) => msg._id === newMsg._id
      );

      if (exists) return prev;

      return [...prev, newMsg];
    });
  };

    // 3. Nhận sự kiện chỉnh sửa tin nhắn
    const handleMessageEdited = ({
      messageId,
      newText,
      editedAt,
      roomId: eventRoomId,
    }) => {
      if (eventRoomId && eventRoomId !== roomId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                text: newText,
                edited: true,
                editedAt,
              }
            : msg
        )
      );
    };

    // 4. Nhận sự kiện thu hồi tin nhắn
    const handleMessageDeleted = ({
      messageId,
      roomId: eventRoomId,
    }) => {
      if (eventRoomId && eventRoomId !== roomId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                deleted: true,
                text: "",
                image: null,
              }
            : msg
        )
      );
    };

    // 5. Nhận sự kiện cập nhật reaction
    const handleReactionUpdate = ({
      messageId,
      reactions,
      roomId: eventRoomId,
    }) => {
      if (eventRoomId && eventRoomId !== roomId) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                reactions,
              }
            : msg
        )
      );
    };

    // Đăng ký listener trước khi yêu cầu tải lịch sử
    socket.on("load_history", handleLoadHistory);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("reaction_update", handleReactionUpdate);

    // Tham gia phòng chat
    socket.emit("join_room", { roomId });

    // Hủy listener và rời phòng khi đổi phòng hoặc component bị unmount
    return () => {
      socket.emit("leave_room", { roomId });

      socket.off("load_history", handleLoadHistory);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("reaction_update", handleReactionUpdate);
    };
  }, [roomId, socket]);

  // Gửi tin nhắn
  const handleSendMessage = (text, image, replyTo) => {
    if (!socket || !roomId) return;

    socket.emit("send_message", {
      roomId,
      text,
      image,
      replyTo,
    });
  };

  // Chưa chọn hội thoại
  if (!room) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">💬</div>
        <h2>Chào mừng đến với Web Chat</h2>
        <p>
          Chọn một hội thoại bên trái để bắt đầu trò chuyện.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="chat-header-user">
          <div className="chat-avatar">
            {room.name?.charAt(0).toUpperCase() || "C"}
          </div>

          <div className="chat-header-info">
            <h3>{room.name || "Cuộc trò chuyện"}</h3>

            <span>
              {room.isGroup
                ? `${room.members?.length || 0} thành viên`
                : "● Trực tuyến"}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            className="chat-action-btn"
            onClick={() => onStartCall?.("audio")}
            title="Gọi thoại"
          >
            📞
          </button>

          <button
            className="chat-action-btn"
            onClick={() => onStartCall?.("video")}
            title="Gọi video"
          >
            📹
          </button>

          {room.isGroup && (
            <button
              className="chat-action-btn"
              onClick={onOpenGroupSettings}
              title="Cài đặt nhóm"
            >
              ⚙️
            </button>
          )}
        </div>
      </header>

      <main className="chat-message-area">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
        />
      </main>

      <footer className="chat-input-area">
        <MessageInput
          onSendMessage={handleSendMessage}
        />
      </footer>
    </div>
  );
}
