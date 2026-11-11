
/**
 * @file chatSocket.js
 * @description Xử lý tin nhắn thời gian thực:
 * gửi, nhận, chỉnh sửa, thu hồi và reaction.
 * @assigned_to Thành viên B
 */

const mongoose = require("mongoose");
const { Message, Room } = require("../models");

function registerChatSocket(io, socket) {
  // Lấy thông tin người dùng từ JWT đã xác thực
  const { id: myId, username: myUsername } = socket.userData || {};

  // Kiểm tra ID phòng có hợp lệ không
  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  // Kiểm tra người dùng có thuộc phòng chat không
  async function checkRoomMember(roomId) {
    if (!isValidId(roomId) || !myId) {
      return false;
    }

    const room = await Room.findOne({
      _id: roomId,
      members: myId,
    });

    return !!room;
  }

  // 1. Tham gia phòng chat và tải lịch sử
  socket.on("join_room", async ({ roomId } = {}) => {
    try {
      if (!(await checkRoomMember(roomId))) {
        socket.emit("chat_error", {
          message: "Bạn không có quyền tham gia phòng chat này",
        });
        return;
      }

      // Tham gia phòng Socket.IO
      socket.join(roomId);

      // Lấy 100 tin nhắn gần nhất
      const history = await Message.find({
        roomID: roomId,
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      // Đảo thứ tự để hiển thị từ cũ đến mới
      history.reverse();

      socket.emit("load_history", history);
    } catch (error) {
      console.error("[Chat] Lỗi join_room:", error);

      socket.emit("chat_error", {
        message: "Không thể tải lịch sử tin nhắn",
      });
    }
  });

  // 2. Gửi tin nhắn mới
  socket.on("send_message", async ({
    roomId,
    text = "",
    image = null,
    replyTo = null,
  } = {}) => {
    try {
      if (!(await checkRoomMember(roomId))) {
        socket.emit("chat_error", {
          message: "Bạn không có quyền gửi tin nhắn vào phòng này",
        });
        return;
      }

      // Kiểm tra nội dung tin nhắn
      if (!text.trim() && !image) {
        return;
      }

      // Tạo tin nhắn mới
      const newMessage = new Message({
        roomID: roomId,
        sender: myUsername,
        senderId: myId,
        text,
        image,
        replyTo,
      });

      // Lưu vào MongoDB
      const savedMessage = await newMessage.save();

      // Phát tin nhắn đến tất cả thành viên trong phòng
      io.to(roomId).emit(
        "receive_message",
        savedMessage
      );
    } catch (error) {
      console.error("[Chat] Lỗi send_message:", error);

      socket.emit("chat_error", {
        message: "Không thể gửi tin nhắn",
      });
    }
  });

  // 3. Chỉnh sửa tin nhắn
  socket.on("edit_message", async ({
    messageId,
    roomId,
    newText,
  } = {}) => {
    try {
      if (!isValidId(messageId)) {
        return;
      }

      if (!(await checkRoomMember(roomId))) {
        return;
      }

      if (!newText || !newText.trim()) {
        return;
      }

      // Chỉ người gửi mới được sửa tin nhắn
      const message = await Message.findOne({
        _id: messageId,
        roomID: roomId,
        senderId: myId,
        deleted: false,
      });

      if (!message) {
        socket.emit("chat_error", {
          message: "Không tìm thấy tin nhắn hoặc bạn không có quyền sửa",
        });
        return;
      }

      message.text = newText.trim();
      message.edited = true;
      message.editedAt = new Date();

      await message.save();

      io.to(roomId).emit("message_edited", {
        messageId,
        newText: message.text,
        editedAt: message.editedAt,
      });
    } catch (error) {
      console.error("[Chat] Lỗi edit_message:", error);

      socket.emit("chat_error", {
        message: "Không thể chỉnh sửa tin nhắn",
      });
    }
  });

  // 4. Thu hồi tin nhắn
  socket.on("delete_message", async ({
    messageId,
    roomId,
  } = {}) => {
    try {
      if (!isValidId(messageId)) {
        return;
      }

      if (!(await checkRoomMember(roomId))) {
        return;
      }

      // Chỉ người gửi mới được thu hồi tin nhắn
      const message = await Message.findOne({
        _id: messageId,
        roomID: roomId,
        senderId: myId,
        deleted: false,
      });

      if (!message) {
        socket.emit("chat_error", {
          message: "Không tìm thấy tin nhắn hoặc bạn không có quyền thu hồi",
        });
        return;
      }

      message.deleted = true;
      message.text = "";
      message.image = null;

      await message.save();

      io.to(roomId).emit("message_deleted", {
        messageId,
      });
    } catch (error) {
      console.error("[Chat] Lỗi delete_message:", error);

      socket.emit("chat_error", {
        message: "Không thể thu hồi tin nhắn",
      });
    }
  });

  // 5. Thả hoặc gỡ reaction
  socket.on("react_message", async ({
    messageId,
    roomId,
    emoji,
  } = {}) => {
    try {
      if (!isValidId(messageId) || !emoji) {
        return;
      }

      if (!(await checkRoomMember(roomId))) {
        return;
      }

      const message = await Message.findOne({
        _id: messageId,
        roomID: roomId,
        deleted: false,
      });

      if (!message) {
        return;
      }

      // Lấy danh sách người đã thả emoji
      const users = message.reactions.get(emoji) || [];

      // Nếu đã thả thì gỡ, chưa thả thì thêm
      const userIndex = users.indexOf(myId.toString());

      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      } else {
        users.push(myId.toString());
      }

      // Cập nhật Map reactions
      if (users.length === 0) {
        message.reactions.delete(emoji);
      } else {
        message.reactions.set(emoji, users);
      }

      await message.save();

      // Chuyển Map thành object để gửi về client
      const reactions = Object.fromEntries(
        message.reactions
      );

      io.to(roomId).emit("reaction_update", {
        messageId,
        reactions,
      });
    } catch (error) {
      console.error("[Chat] Lỗi react_message:", error);

      socket.emit("chat_error", {
        message: "Không thể cập nhật reaction",
      });
    }
  });
}

module.exports = { registerChatSocket };
