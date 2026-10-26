/**
 * @file MessageInput.jsx
 * @description Khung soạn thảo tin nhắn: nhập text, chọn ảnh đính kèm, chọn emoji
 * @assigned_to Thành viên B
 * 
 * CẦN THÊM GÌ:
 * - Input text, bấm Enter gửi tin nhắn (Shift+Enter xuống dòng).
 * - Nút chọn ảnh từ máy tính (convert sang Base64 hoặc upload URL).
 * - Nút bật mở Emoji Picker (emoji-picker-react).
 * - Hiển thị preview ảnh trước khi bấm gửi.
 * - Gọi onSendMessage(text, image, replyTo).
 */

import { useState } from "react";

export default function MessageInput({ onSendMessage, replyTo, onCancelReply }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    onSendMessage(text.trim(), image, replyTo);
    setText("");
    setImage(null);
    if (onCancelReply) onCancelReply();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ borderTop: "1px solid #ddd", padding: 12, background: "#fff" }}>
      {replyTo && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, background: "#f0f0f0", padding: 6, marginBottom: 8, borderRadius: 4 }}>
          <span>Đang trả lời <strong>{replyTo.sender}</strong>: {replyTo.text}</span>
          <button onClick={onCancelReply} style={{ border: "none", background: "none", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {image && (
        <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
          <img src={image} alt="preview" style={{ height: 60, borderRadius: 4 }} />
          <button
            onClick={() => setImage(null)}
            style={{ position: "absolute", top: -5, right: -5, background: "red", color: "white", borderRadius: "50%", border: "none", width: 20, height: 20, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          id="chat-image-input"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <label htmlFor="chat-image-input" style={{ cursor: "pointer", padding: "8px 12px", background: "#f3f4f6", borderRadius: 4 }}>
          📷
        </label>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
          Gửi
        </button>
      </form>
    </div>
  );
}
