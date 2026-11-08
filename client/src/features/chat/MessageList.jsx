
import { useEffect, useRef } from "react";

export default function MessageList({
  messages,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="message-empty">
          <span>💬</span>
          <p>Chưa có tin nhắn nào.</p>
          <small>Hãy gửi lời chào để bắt đầu cuộc trò chuyện!</small>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg._id}
              className={`message-row ${isMe ? "message-mine" : "message-theirs"}`}
            >
              <div className="message-content">
                {!isMe && (
                  <span className="message-sender">
                    {msg.sender || "Người dùng"}
                  </span>
                )}

                <div className={`message-bubble ${isMe ? "bubble-mine" : "bubble-theirs"}`}>
                  {msg.deleted ? (
                    <em className="message-deleted">
                      Tin nhắn đã bị thu hồi
                    </em>
                  ) : (
                    <>
                      {msg.replyTo && (
                        <div className="message-reply">
                          <strong>{msg.replyTo.sender}</strong>
                          <p>{msg.replyTo.text}</p>
                        </div>
                      )}

                      {msg.text && (
                        <div className="message-text">{msg.text}</div>
                      )}

                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Ảnh được gửi"
                          className="message-image"
                        />
                      )}

                      {msg.edited && (
                        <span className="message-edited">(đã sửa)</span>
                      )}
                    </>
                  )}
                </div>

                <div className="message-time">
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
