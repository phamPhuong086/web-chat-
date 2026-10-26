/**
 * @file CallIncomingModal.jsx
 * @description Modal thông báo cuộc gọi đến (chuông reo, đếm ngược 30s, chấp nhận/từ chối)
 * @assigned_to Thành viên C
 * 
 * CẦN THÊM GÌ:
 * - Hiển thị tên người gọi (incomingCall.callerName) và loại cuộc gọi (Audio / Video).
 * - Phát âm thanh chuông reo (ringtone).
 * - Đếm ngược 30 giây (CALL_TIMEOUT_SECONDS): nếu không ai trả lời -> Tự động gọi onRejectCall().
 * - Nút "Chấp nhận" (màu xanh) -> Gọi onAcceptCall().
 * - Nút "Từ chối" (màu đỏ) -> Gọi onRejectCall().
 */

import { useState, useEffect } from "react";
import { CALL_TIMEOUT_SECONDS } from "../../utils/constants";

export default function CallIncomingModal({ incomingCall, onAcceptCall, onRejectCall }) {
  const [timeLeft, setTimeLeft] = useState(CALL_TIMEOUT_SECONDS);

  useEffect(() => {
    if (!incomingCall) return;

    setTimeLeft(CALL_TIMEOUT_SECONDS);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRejectCall(); // Hết 30 giây tự động hủy
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingCall, onRejectCall]);

  if (!incomingCall) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 12, textAlign: "center", width: 320, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h3>Cuộc Gọi Đến</h3>
        <p style={{ fontSize: 18, fontWeight: "bold", margin: "12px 0" }}>{incomingCall.callerName}</p>
        <p style={{ color: "#666" }}>Đang gọi {incomingCall.callType === "video" ? "Video 📹" : "Thoại 📞"} cho bạn...</p>
        <div style={{ margin: "16px 0", color: "orange", fontSize: 14 }}>Tự hủy sau: {timeLeft}s</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 20 }}>
          <button
            onClick={onRejectCall}
            style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Từ chối
          </button>
          <button
            onClick={onAcceptCall}
            style={{ padding: "10px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Nghe máy
          </button>
        </div>
      </div>
    </div>
  );
}
