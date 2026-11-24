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

import { useRef, useEffect, useState } from "react";

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

  // Thẻ audio dùng để phát âm thanh đối phương
  const remoteAudioRef = useRef(null);

  // Thời lượng cuộc gọi (đơn vị: giây)
  const [callDuration, setCallDuration] = useState(0);

  // Bắt đầu đếm thời gian khi WebRTC kết nối thành công
  useEffect(() => {
    if (!callActive) {
      setCallDuration(0);
      return;
    }

    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTime) / 1000
      );

      setCallDuration(elapsedSeconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    if (!callActive || !localVideoRef.current) return;

    localVideoRef.current.srcObject = localStream || null;
  }, [callActive, callType, localStream]);

  useEffect(() => {
    if (!callActive || !remoteVideoRef.current) return;

    remoteVideoRef.current.srcObject = remoteStream || null;
  }, [callActive, callType, remoteStream]);

  // Phát âm thanh đối phương khi gọi thoại
  useEffect(() => {
    if (!callActive || callType !== "audio") return;

    const audioElement = remoteAudioRef.current;

    if (!audioElement) return;

    audioElement.srcObject = remoteStream || null;

    return () => {
      audioElement.srcObject = null;
    };
  }, [callActive, callType, remoteStream]);

  if (!callActive) return null;

  // Chuyển số giây thành định dạng MM:SS
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
  <div style={{ position: "fixed", inset: 0, background: "#111", zIndex: 9999, display: "flex", flexDirection: "column" }}>

    {/* Hiển thị thời lượng cuộc gọi */}
    <div
      style={{
        padding: "16px",
        textAlign: "center",
        color: "#fff",
        background: "rgba(0,0,0,0.5)",
        fontSize: 20,
        fontWeight: "bold",
      }}
    >
      ⏱️ {formatDuration(callDuration)}
    </div>

    {/* Khung hiển thị Video Remote (Đối phương) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
>
        {callType === "video" ? (
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: "#fff", fontSize: 24 }}>
            <audio
              ref={remoteAudioRef}
              autoPlay
              playsInline
            />

            <p>📞 Đang gọi thoại...</p>
          </div>
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
