/**
 * @file userSocket.js
 * @description Xử lý theo dõi trạng thái Online/Offline của người dùng
 * @assigned_to Thành viên A
 * 
 * EVENT THỐNG NHẤT:
 * - user_status_change: Phát tới toàn bộ client khi user online/offline: { userId, isOnline }
 * 
 * CẦN THÊM GÌ:
 * - Quản lý danh sách socketId theo userId (đề phòng 1 user mở nhiều tab).
 * - Khi kết nối socket đầu tiên của user mở -> Cập nhật isOnline: true trong DB và emit "user_status_change".
 * - Khi user ngắt kết nối socket cuối cùng -> Cập nhật isOnline: false trong DB và emit "user_status_change".
 */

// const { User } = require("../models");

// Map lưu trữ userId -> Set các socket.id đang hoạt động
const onlineUsers = new Map();

function registerUserSocket(io, socket) {
  const userId = socket.userData?.id;
  if (!userId) return;

  // Thêm socket id vào danh sách online của user
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  const userSockets = onlineUsers.get(userId);
  userSockets.add(socket.id);

  // Cho socket join vào room cá nhân mang chính userId để nhận thông báo riêng
  socket.join(userId);

  // TODO: [A] Nếu đây là kết nối đầu tiên (userSockets.size === 1):
  // Cập nhật User.findByIdAndUpdate(userId, { isOnline: true })
  // io.emit("user_status_change", { userId, isOnline: true });

  // Xử lý khi ngắt kết nối
  socket.on("disconnect", async () => {
    userSockets.delete(socket.id);
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      // TODO: [A] Cập nhật User.findByIdAndUpdate(userId, { isOnline: false })
      // io.emit("user_status_change", { userId, isOnline: false });
    }
  });
}

module.exports = { registerUserSocket };
