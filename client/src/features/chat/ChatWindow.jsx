
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

  useEffect(() => {
    if (!room || !socket) {
      setMessages([]);
      return;
    }

    socket.emit("join_room", { roomId: room._id });

    const handleLoadHistory = (history) => {
      setMessages(history);
    };

    const handleReceiveMessage = (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    };

    socket.on("load_history", handleLoadHistory);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("load_history", handleLoadHistory);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [room, socket]);

  const handleSendMessage = (text, image, replyTo) => {
    if (!socket || !room) return;

    socket.emit("send_message", {
      roomId: room._id,
      text,
      image,
      replyTo,
    });
  };

  if (!room) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">💬</div>
        <h2>Chào mừng đến với Web Chat</h2>
        <p>Chọn một hội thoại bên trái để bắt đầu trò chuyện.</p>
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
            onClick={() => onStartCall("audio")}
            title="Gọi thoại"
          >
            📞
          </button>

          <button
            className="chat-action-btn"
            onClick={() => onStartCall("video")}
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
        <MessageInput onSendMessage={handleSendMessage} />
      </footer>
    </div>
  );
}
