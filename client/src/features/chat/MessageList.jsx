/**
 * @file MessageList.jsx
 * @description Danh sách tin nhắn trong phòng, hiển thị văn bản, hình ảnh, thời gian và reaction
 * @assigned_to Thành viên B
 * 
 * CẦN THÊM GÌ:
 * - Tự động cuộn xuống dưới cùng khi có tin nhắn mới (useRef).
 * - Phân biệt tin nhắn của mình (căn phải) và đối phương (căn trái).
 * - Hiển thị ảnh (nếu message.image có giá trị).
 * - Nút thả Reaction (👍 ❤️ 😂 😮 😢 😡), nút Sửa tin nhắn (chỉ tin của mình), nút Xóa (thu hồi).
 * - Hiển thị khối Reply nếu message.replyTo tồn tại.
 */

import { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId, onReply, onEdit, onDelete, onReact }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ flex: 1, padding: 16, overflowY: "auto", background: "#f9fafb" }}>
      {messages.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>Chưa có tin nhắn nào trong phòng này.</p>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>{msg.sender}</span>
              <div
                style={{
                  maxWidth: "70%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: isMe ? "#4f46e5" : "#fff",
                  color: isMe ? "#fff" : "#111",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                {msg.deleted ? (
                  <em style={{ color: "#aaa" }}>Tin nhắn đã bị thu hồi</em>
                ) : (
                  <>
                    {msg.replyTo && (
                      <div style={{ fontSize: 12, borderLeft: "2px solid #ccc", paddingLeft: 6, marginBottom: 4, opacity: 0.8 }}>
                        Trả lời {msg.replyTo.sender}: {msg.replyTo.text}
                      </div>
                    )}
                    {msg.text && <div>{msg.text}</div>}
                    {msg.image && <img src={msg.image} alt="ảnh" style={{ maxWidth: "100%", borderRadius: 4, marginTop: 4 }} />}
                    {msg.edited && <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>(đã sửa)</span>}
                  </>
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
