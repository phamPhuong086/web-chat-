/**
 * @file friendRoutes.js
 * @description API Quản lý danh sách bạn bè, gửi / chấp nhận / từ chối lời mời kết bạn
 * @assigned_to Thành viên A
 * 
 * DANH SÁCH API THỐNG NHẤT:
 * 1. GET /api/friends (Yêu cầu auth)
 *    - Lấy danh sách bạn bè của user hiện tại (populate username, avatar, isOnline, bio)
 * 2. POST /api/friends/request (Yêu cầu auth)
 *    - Body: { targetId }
 *    - Gửi lời mời kết bạn (kiểm tra không tự kết bạn, không gửi trùng, không kết bạn với người đã là bạn)
 * 3. GET /api/friends/requests (Yêu cầu auth)
 *    - Lấy danh sách lời mời kết bạn gửi đến mình (status = 'pending')
 * 4. POST /api/friends/accept (Yêu cầu auth)
 *    - Body: { requestId }
 *    - Chấp nhận lời mời -> Cập nhật status='accepted' -> Thêm cả 2 vào mảng friends của nhau
 * 5. POST /api/friends/reject (Yêu cầu auth)
 *    - Body: { requestId }
 *    - Từ chối lời mời -> Cập nhật status='rejected'
 * 6. POST /api/friends/unfriend (Yêu cầu auth)
 *    - Body: { targetId }
 *    - Xóa nhau khỏi mảng friends của cả 2 user
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
// const { User, FriendRequest } = require("../models");

// GET /api/friends
router.get("/", authMiddleware, async (req, res) => {
  try {
    // TODO: [A] Lấy danh sách bạn bè của user (populate thông tin bạn bè)
    return res.status(501).json({ message: "TODO: [A] Lấy danh sách bạn bè" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/friends/request
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.body;
    // TODO: [A] Gửi lời mời kết bạn tới targetId
    // TODO: [A] Nếu có socket instance, emit realtime thông báo cho targetId
    return res.status(501).json({ message: "TODO: [A] Gửi lời mời kết bạn" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/friends/requests
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    // TODO: [A] Lấy các lời mời kết bạn gửi tới req.user.id với status = 'pending'
    return res.status(501).json({ message: "TODO: [A] Lấy danh sách lời mời kết bạn" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/friends/accept
router.post("/accept", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.body;
    // TODO: [A] Chấp nhận lời mời và thêm cả 2 vào danh sách bạn bè
    return res.status(501).json({ message: "TODO: [A] Chấp nhận kết bạn" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/friends/reject
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.body;
    // TODO: [A] Từ chối lời mời kết bạn
    return res.status(501).json({ message: "TODO: [A] Từ chối kết bạn" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/friends/unfriend
router.post("/unfriend", authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.body;
    // TODO: [A] Xóa bạn bè giữa req.user.id và targetId
    return res.status(501).json({ message: "TODO: [A] Hủy kết bạn" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
