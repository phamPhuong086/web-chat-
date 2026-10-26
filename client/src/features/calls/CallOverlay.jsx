/**
 * @file CallOverlay.jsx
 * @description Giao diện cuộc gọi thoại/video P2P toàn màn hình
 * @assigned_to Thành viên C
 * 
 * CẦN THÊM GÌ:
 * - Gắn ref localVideoRef (stream từ camera của mình) và remoteVideoRef (stream nhận từ đối phương).
 * - Nút Bật/Tắt Microphone (toggleAudio).
 * - Nút Bật/Tắt Camera (toggleVideo).
 * - Nút Kết thúc cuộc gọi -> gọi endCall().
 * - Hiển thị thời lượng cuộc gọi (bấm giờ sau khi kết nối thành công).
 */

import { useRef, useEffect } from "react";

export default function CallOverlay({
  callActive,
  callType,
  localStream,
  remoteStream,
  onEndCall,
  isMuted,
  onToggleMute,
  isVideoOff,
  onToggleVideo,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callActive) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#111", zIndex: 9999, display: "flex", flexDirection: "column" }}>
      {/* Khung hiển thị Video Remote (Đối phương) */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {callType === "video" ? (
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: "#fff", fontSize: 24 }}>📞 Đang gọi thoại...</div>
        )}

        {/* Khung nhỏ hiển thị Video Local (Của mình) */}
        {callType === "video" && (
          <div style={{ position: "absolute", bottom: 20, right: 20, width: 180, height: 120, background: "#333", borderRadius: 8, overflow: "hidden", border: "2px solid #fff" }}>
            <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>

      {/* Thanh điều khiển cuộc gọi */}
      <div style={{ height: 80, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <button onClick={onToggleMute} style={{ padding: "12px 20px", borderRadius: "50%", cursor: "pointer", background: isMuted ? "red" : "#444", color: "#fff" }}>
          {isMuted ? "🔇 Bật Mic" : "🎙️ Tắt Mic"}
        </button>
        {callType === "video" && (
          <button onClick={onToggleVideo} style={{ padding: "12px 20px", borderRadius: "50%", cursor: "pointer", background: isVideoOff ? "red" : "#444", color: "#fff" }}>
            {isVideoOff ? "📷 Bật Cam" : "📹 Tắt Cam"}
          </button>
        )}
        <button onClick={onEndCall} style={{ padding: "12px 24px", borderRadius: 24, cursor: "pointer", background: "red", color: "#fff", fontWeight: "bold" }}>
          Kết Thúc
        </button>
      </div>
    </div>
  );
}
