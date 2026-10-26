/**
 * @file chatSocket.js
 * @description Xử lý tin nhắn thời gian thực: gửi, nhận, chỉnh sửa, thu hồi và reaction
 * @assigned_to Thành viên B
 * 
 * DANH SÁCH EVENT THỐNG NHẤT:
 * 1. join_room:
 *    - Client emit: { roomId }
 *    - Logic: socket.join(roomId), truy vấn 100 tin nhắn gần nhất từ DB và emit "load_history" về client.
 * 2. send_message:
 *    - Client emit: { roomId, text, image, replyTo }
 *    - Logic: Lưu Message vào MongoDB -> emit "receive_message" tới io.to(roomId).
 * 3. edit_message:
 *    - Client emit: { messageId, roomId, newText }
 *    - Logic: Kiểm tra quyền sở hữu -> Cập nhật DB -> emit "message_edited" tới io.to(roomId).
 * 4. delete_message:
 *    - Client emit: { messageId, roomId }
 *    - Logic: Đánh dấu deleted: true trong DB -> emit "message_deleted" tới io.to(roomId).
 * 5. react_message:
 *    - Client emit: { messageId, roomId, emoji }
 *    - Logic: Thêm hoặc gỡ emoji reaction -> emit "reaction_update" tới io.to(roomId).
 */

// const { Message } = require("../models");

function registerChatSocket(io, socket) {
  const { id: myId, username: myUsername } = socket.userData || {};

  // 1. Tham gia phòng chat & tải lịch sử
  socket.on("join_room", async ({ roomId }) => {
    socket.join(roomId);
    // TODO: [B] Lấy 100 tin nhắn cũ nhất của roomId sắp xếp theo timestamp tăng dần
    // const history = await Message.find({ roomID: roomId }).sort({ timestamp: 1 }).limit(100);
    // socket.emit("load_history", history);
  });

  // 2. Gửi tin nhắn mới
  socket.on("send_message", async ({ roomId, text, image, replyTo }) => {
    // TODO: [B] Lưu tin nhắn vào MongoDB (text có thể đã mã hóa E2EE từ client)
    // const msg = await new Message({ roomID: roomId, sender: myUsername, senderId: myId, text, image, replyTo }).save();
    // io.to(roomId).emit("receive_message", msg);
  });

  // 3. Chỉnh sửa tin nhắn
  socket.on("edit_message", async ({ messageId, roomId, newText }) => {
    // TODO: [B] Kiểm tra người gửi có phải myId không, cập nhật text & edited: true
    // io.to(roomId).emit("message_edited", { messageId, newText, editedAt: new Date() });
  });

  // 4. Xóa / Thu hồi tin nhắn
  socket.on("delete_message", async ({ messageId, roomId }) => {
    // TODO: [B] Đánh dấu deleted: true trong DB
    // io.to(roomId).emit("message_deleted", { messageId });
  });

  // 5. Thả biểu cảm cảm xúc (Reaction)
  socket.on("react_message", async ({ messageId, roomId, emoji }) => {
    // TODO: [B] Cập nhật mảng reactions của tin nhắn
    // io.to(roomId).emit("reaction_update", { messageId, reactions });
  });
}

module.exports = { registerChatSocket };
