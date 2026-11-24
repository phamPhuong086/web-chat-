/**
 * @file userSocket.js
 * @description Xử lý theo dõi trạng thái Online/Offline của người dùng và tham gia các room chat
 * @assigned_to Thành viên A
 */

const { User, Room } = require("../models");

// Map lưu trữ userId -> Set các socket.id đang hoạt động
const onlineUsers = new Map();

async function registerUserSocket(io, socket) {
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

  try {
    // Nếu đây là kết nối đầu tiên của user (vừa mới online)
    if (userSockets.size === 1) {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("user_status_change", { userId, isOnline: true });
    }

    // Tự động cho socket tham gia vào tất cả các phòng chat mà user là thành viên
    const rooms = await Room.find({ members: userId });
    rooms.forEach((r) => {
      socket.join(r._id.toString());
    });
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo socket kết nối user:", error.message);
  }

  // Lắng nghe sự kiện tham gia phòng mới sau khi được tạo
  socket.on("join_created_room", ({ roomId }) => {
    if (roomId) {
      socket.join(roomId);
    }
  });

  // Xử lý khi ngắt kết nối
  socket.on("disconnect", async () => {
    userSockets.delete(socket.id);
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      try {
        await User.findByIdAndUpdate(userId, { isOnline: false });
        io.emit("user_status_change", { userId, isOnline: false });
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật offline user:", error.message);
      }
    }
  });
}

module.exports = { registerUserSocket, onlineUsers };
