/**
 * @file userRoutes.js
 * @description API Quản lý hồ sơ cá nhân, tìm kiếm người dùng và lưu trữ Public Key E2EE
 * @assigned_to Thành viên A
 * 
 * DANH SÁCH API THỐNG NHẤT:
 * 1. GET /api/users/profile (Yêu cầu auth)
 *    - Lấy thông tin user hiện tại (trừ password)
 * 2. PUT /api/users/profile (Yêu cầu auth)
 *    - Body: { bio, hobbies, birthday, avatar }
 *    - Cập nhật thông tin cá nhân
 * 3. PUT /api/users/password (Yêu cầu auth)
 *    - Body: { currentPassword, newPassword }
 *    - Kiểm tra mật khẩu cũ và băm cập nhật mật khẩu mới
 * 4. GET /api/users/search?keyword=abc (Yêu cầu auth)
 *    - Tìm kiếm user theo username
 * 5. PUT /api/users/public-key (Yêu cầu auth - Dành cho E2EE của B)
 *    - Body: { publicKey }
 *    - Lưu public key của user lên DB
 * 6. GET /api/users/:userId/public-key (Yêu cầu auth - Dành cho E2EE của B)
 *    - Trả về public key của đối phương để B mã hóa tin nhắn
 */

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
// const { User } = require("../models");

// GET /api/users/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // TODO: [A] Tìm user theo req.user.id, loại trừ trường password (.select("-password"))
    return res.status(501).json({ message: "TODO: [A] Triển khai lấy hồ sơ người dùng" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { bio, hobbies, birthday, avatar } = req.body;
    // TODO: [A] Cập nhật bio, hobbies, birthday, avatar cho user có _id = req.user.id
    return res.status(501).json({ message: "TODO: [A] Triển khai cập nhật hồ sơ" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/password
router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // TODO: [A] Kiểm tra mật khẩu hiện tại có đúng không -> Hash mật khẩu mới và lưu
    return res.status(501).json({ message: "TODO: [A] Triển khai đổi mật khẩu" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/search
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { keyword } = req.query;
    // TODO: [A] Tìm kiếm user theo username (hỗ trợ regex tìm kiếm không phân biệt hoa thường)
    return res.status(501).json({ message: "TODO: [A] Triển khai tìm kiếm người dùng" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/public-key (Hỗ trợ E2EE cho Thành viên B)
router.put("/public-key", authMiddleware, async (req, res) => {
  try {
    const { publicKey } = req.body;
    // TODO: [A] Cập nhật trường publicKey cho user req.user.id
    return res.status(501).json({ message: "TODO: [A] Lưu public key E2EE" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:userId/public-key (Cung cấp public key cho Thành viên B mã hóa)
router.get("/:userId/public-key", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    // TODO: [A] Lấy publicKey của user theo userId
    return res.status(501).json({ message: "TODO: [A] Trả về public key của đối phương" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
