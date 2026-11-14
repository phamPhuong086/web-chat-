
import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({
  onSendMessage,
  replyTo,
  onCancelReply,
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const fileInputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();

    if (!text.trim() && !image) return;

    onSendMessage(text.trim(), image, replyTo);

    setText("");
    setImage(null);
    setShowEmoji(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onCancelReply?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="message-input-container">
      {replyTo && (
        <div className="reply-preview">
          <div>
            <strong>Đang trả lời {replyTo.sender}</strong>
            <p>{replyTo.text || "Hình ảnh"}</p>
          </div>

          <button
            type="button"
            onClick={onCancelReply}
            className="cancel-reply-btn"
          >
            ✕
          </button>
        </div>
      )}

      {image && (
        <div className="image-preview">
          <img src={image} alt="Ảnh xem trước" />

          <button
            type="button"
            onClick={() => {
              setImage(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            ✕
          </button>
        </div>
      )}

      {showEmoji && (
        <div className="emoji-picker-container">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              setText((prev) => prev + emojiData.emoji);
            }}
          />
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSend}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
        />

        <button
          type="button"
          className="input-tool-btn"
          title="Chọn ảnh"
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </button>

        <button
          type="button"
          className="input-tool-btn"
          title="Chọn emoji"
          onClick={() => setShowEmoji((prev) => !prev)}
        >
          😊
        </button>

        <textarea
          className="message-textarea"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <button
          type="submit"
          className="message-send-btn"
          disabled={!text.trim() && !image}
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
