/**
 * @file roomRoutes.js
 * @description API Quản lý phòng chat cá nhân và nhóm chat
 * @assigned_to Thành viên A
 * 
 * DANH SÁCH API THỐNG NHẤT:
 * 1. GET /api/rooms (Yêu cầu auth)
 *    - Lấy danh sách tất cả các phòng mà user đang tham gia (populate thành viên)
 * 2. POST /api/rooms (Yêu cầu auth)
 *    - Chat 1-1 Body: { isGroup: false, memberIds: [targetId] }
 *      -> Nếu phòng 1-1 giữa 2 người đã tồn tại thì trả về phòng cũ, nếu chưa thì tạo mới.
 *    - Nhóm Body: { isGroup: true, name: "Tên nhóm", memberIds: [id1, id2] }
 *      -> Tạo nhóm mới với creator là req.user.id, members gồm creator + memberIds.
 * 3. PUT /api/rooms/:roomId (Yêu cầu auth)
 *    - Body: { name, description, avatar, memberIds }
 *    - Phân quyền: Chỉ trưởng nhóm (creator) mới có quyền chỉnh sửa thông tin hoặc thêm/xóa thành viên.
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
// const { Room } = require("../models");

// GET /api/rooms
router.get("/", authMiddleware, async (req, res) => {
  try {
    // TODO: [A] Tìm các Room có members chứa req.user.id, populate thông tin members
    return res.status(501).json({ message: "TODO: [A] Lấy danh sách phòng chat" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { isGroup, name, memberIds } = req.body;
    // TODO: [A] Xử lý tạo phòng chat 1-1 hoặc tạo nhóm
    // - Nếu !isGroup: Tìm room 1-1 có sẵn giữa req.user.id và memberIds[0], nếu có thì trả về, không thì tạo mới
    // - Nếu isGroup: Kiểm tra tên nhóm, gán creator = req.user.id, members = [req.user.id, ...memberIds]
    return res.status(501).json({ message: "TODO: [A] Tạo phòng hoặc nhóm chat" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/rooms/:roomId
router.put("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, avatar, memberIds } = req.body;
    // TODO: [A] Kiểm tra phòng tồn tại và người gọi có phải creator không
    // TODO: [A] Cập nhật thông tin phòng, danh sách thành viên
    return res.status(501).json({ message: "TODO: [A] Cập nhật thông tin nhóm" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
