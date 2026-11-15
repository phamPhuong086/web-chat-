
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Chuyển reactions Map/Object thành danh sách để hiển thị
  const getReactions = (reactions) => {
    if (!reactions) return [];

    const reactionObject =
      reactions instanceof Map
        ? Object.fromEntries(reactions)
        : reactions;

    return Object.entries(reactionObject).filter(
      ([, users]) => Array.isArray(users) && users.length > 0
    );
  };

  const handleEdit = (msg) => {
    const newText = window.prompt(
      "Nhập nội dung mới:",
      msg.text || ""
    );

    if (newText === null || !newText.trim()) return;

    onEdit?.(msg);
  };

  const handleDelete = (msg) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn thu hồi tin nhắn này?"
    );

    if (confirmed) {
      onDelete?.(msg);
    }
  };

  const handleReact = (msg, emoji) => {
    onReact?.(msg, emoji);
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="message-empty">
          <span>💬</span>
          <p>Chưa có tin nhắn nào.</p>
          <small>
            Hãy gửi lời chào để bắt đầu cuộc trò chuyện!
          </small>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe =
            String(msg.senderId) === String(currentUserId);

          const reactions = getReactions(msg.reactions);

          return (
            <div
              key={msg._id}
              className={`message-row ${
                isMe ? "message-mine" : "message-theirs"
              }`}
            >
              <div className="message-content">
                {!isMe && (
                  <span className="message-sender">
                    {msg.sender || "Người dùng"}
                  </span>
                )}

                <div
                  className={`message-bubble ${
                    isMe ? "bubble-mine" : "bubble-theirs"
                  }`}
                >
                  {msg.deleted ? (
                    <em className="message-deleted">
                      Tin nhắn đã bị thu hồi
                    </em>
                  ) : (
                    <>
                      {msg.replyTo?._id && (
                        <div className="message-reply">
                          <strong>
                            {msg.replyTo.sender || "Người dùng"}
                          </strong>
                          <p>
                            {msg.replyTo.text || "Ảnh"}
                          </p>
                        </div>
                      )}

                      {msg.text && (
                        <div className="message-text">
                          {msg.text}
                        </div>
                      )}

                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Ảnh được gửi"
                          className="message-image"
                        />
                      )}

                      {msg.edited && (
                        <span className="message-edited">
                          (đã sửa)
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Hiển thị reaction */}
                {!msg.deleted && reactions.length > 0 && (
                  <div className="message-reactions">
                    {reactions.map(([emoji, users]) => (
                      <button
                        key={emoji}
                        type="button"
                        className="reaction-item"
                        onClick={() => handleReact(msg, emoji)}
                        title={`${users.length} người đã thả`}
                      >
                        {emoji} {users.length}
                      </button>
                    ))}
                  </div>
                )}

                <div className="message-time">
                  {formatTime(msg.createdAt)}
                </div>

                {/* Các nút thao tác */}
                {!msg.deleted && (
                  <div className="message-actions">
                    <button
                      type="button"
                      title="Trả lời"
                      onClick={() => onReply?.(msg)}
                    >
                      ↩️
                    </button>

                    <button
                      type="button"
                      title="Thả tim"
                      onClick={() => handleReact(msg, "❤️")}
                    >
                      ❤️
                    </button>

                    {isMe && (
                      <>
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(msg)}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          title="Thu hồi"
                          onClick={() => handleDelete(msg)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
