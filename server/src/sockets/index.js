/**
 * @file index.js
 * @description Điểm khởi tạo và đăng ký toàn bộ Socket.IO Handlers
 * @assigned_to Phối hợp A, B, C (A quản lý khung kết nối)
 */

const { verifyToken } = require("../middleware/auth");
const { registerUserSocket } = require("./userSocket");
const { registerChatSocket } = require("./chatSocket");
const { registerCallSocket } = require("./callSocket");

function initSocketServer(io) {
  // Middleware xác thực JWT khi handshake kết nối Socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Xác thực Socket thất bại: Không có token"));
    }

    try {
      const decoded = verifyToken(token);
      socket.userData = decoded; // { id, username }
      next();
    } catch (err) {
      return next(new Error("Xác thực Socket thất bại: Token không hợp lệ hoặc đã hết hạn"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket] User đã kết nối: ${socket.userData.username} (${socket.id})`);

    // Đăng ký các module xử lý socket độc lập:
    registerUserSocket(io, socket); // [A] Trạng thái online/offline
    registerChatSocket(io, socket); // [B] Nhắn tin realtime
    registerCallSocket(io, socket); // [C] WebRTC Signaling cuộc gọi
  });
}

module.exports = { initSocketServer };
