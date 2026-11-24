/**
 * @file roomRoutes.js
 * @description API Quản lý phòng chat cá nhân và nhóm chat
 * @assigned_to Thành viên A
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { Room, User } = require("../models");

// GET /api/rooms - Lấy danh sách các phòng mà user hiện tại đang tham gia
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate("members", "username avatar isOnline bio")
      .sort({ updatedAt: -1, createdAt: -1 });

    return res.json(rooms);
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách phòng: " + error.message });
  }
});

// POST /api/rooms - Tạo phòng chat 1-1 hoặc nhóm chat mới
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { isGroup, name, memberIds } = req.body;
    const myId = req.user.id;

    // 1. Xử lý tạo / mở phòng chat cá nhân (1-1)
    if (!isGroup) {
      const targetId = Array.isArray(memberIds) ? memberIds[0] : memberIds;

      if (!targetId) {
        return res.status(400).json({ message: "Thiếu ID người nhận để tạo cuộc trò chuyện 1-1" });
      }

      if (targetId.toString() === myId.toString()) {
        return res.status(400).json({ message: "Không thể tạo phòng chat với chính mình" });
      }

      // Kiểm tra người nhận có tồn tại không
      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng mục tiêu" });
      }

      // Kiểm tra xem phòng 1-1 giữa 2 người đã tồn tại chưa
      const existingRoom = await Room.findOne({
        isGroup: false,
        members: { $all: [myId, targetId], $size: 2 },
      }).populate("members", "username avatar isOnline bio");

      if (existingRoom) {
        return res.json(existingRoom);
      }

      // Nếu chưa có thì tạo mới
      const newRoom = new Room({
        isGroup: false,
        members: [myId, targetId],
      });
      await newRoom.save();
      await newRoom.populate("members", "username avatar isOnline bio");

      return res.status(201).json(newRoom);
    }

    // 2. Xử lý tạo nhóm chat
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tên nhóm không được để trống" });
    }

    const uniqueMembers = [...new Set([myId, ...(Array.isArray(memberIds) ? memberIds : [])])];

    const group = new Room({
      name: name.trim(),
      isGroup: true,
      creator: myId,
      members: uniqueMembers,
    });
    await group.save();
    await group.populate("members", "username avatar isOnline bio");

    return res.status(201).json(group);
  } catch (error) {
    console.error("Lỗi tạo phòng chat:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi tạo phòng: " + error.message });
  }
});

// PUT /api/rooms/:roomId - Cập nhật thông tin nhóm chat (chỉ creator)
router.put("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, avatar, memberIds } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng chat" });
    }

    if (!room.isGroup) {
      return res.status(400).json({ message: "Chỉ có thể chỉnh sửa thông tin cho nhóm chat" });
    }

    if (room.creator && room.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Chỉ trưởng nhóm mới có quyền chỉnh sửa thông tin nhóm" });
    }

    const updateFields = {};
    if (name !== undefined && name.trim()) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (Array.isArray(memberIds)) {
      updateFields.members = [...new Set([req.user.id, ...memberIds])];
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $set: updateFields },
      { new: true }
    ).populate("members", "username avatar isOnline bio");

    return res.json(updatedRoom);
  } catch (error) {
    console.error("Lỗi cập nhật nhóm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật nhóm: " + error.message });
  }
});

module.exports = router;
