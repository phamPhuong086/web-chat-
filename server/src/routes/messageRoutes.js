/**
 * @file messageRoutes.js
 * @description API Lịch sử tin nhắn và dữ liệu đa phương tiện trong phòng
 * @assigned_to Thành viên B (phối hợp với C)
 * 
 * DANH SÁCH API THỐNG NHẤT:
 * 1. GET /api/messages/:roomId (Yêu cầu auth)
 *    - Query: ?page=1&limit=50
 *    - Lấy thêm lịch sử tin nhắn cũ khi người dùng cuộn lên trên trong cửa sổ chat
 * 2. GET /api/messages/:roomId/media (Yêu cầu auth - Hỗ trợ C xem danh sách tệp/ảnh)
 *    - Lấy danh sách các tin nhắn có chứa ảnh (image != null) của phòng
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
// const { Message } = require("../models");

// GET /api/messages/:roomId
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    // TODO: [B] Lấy tin nhắn theo roomId, sắp xếp theo thời gian timestamp
    return res.status(501).json({ message: "TODO: [B] Lấy lịch sử tin nhắn" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/:roomId/media
router.get("/:roomId/media", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    // TODO: [B/C] Lấy danh sách ảnh trong phòng { image: { $ne: null } }
    return res.status(501).json({ message: "TODO: [B/C] Lấy danh sách media của phòng" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
