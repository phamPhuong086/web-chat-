/**
 * @file constants.js
 * @description Các hằng số dùng chung trong toàn bộ ứng dụng
 */

// Danh sách emoji biểu cảm tin nhắn nhanh (Thành viên B)
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

// Thời gian chờ đối phương nhấc máy cuộc gọi WebRTC: 30 giây (Thành viên C)
export const CALL_TIMEOUT_SECONDS = 30;

// Cấu hình máy chủ STUN miễn phí của Google (Thành viên C)
export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
