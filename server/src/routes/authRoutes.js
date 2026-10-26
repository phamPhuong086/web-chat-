/**
 * @file authRoutes.js
 * @description API Đăng ký, Đăng nhập, Đăng xuất tài khoản
 * @assigned_to Thành viên A
 * 
 * DANH SÁCH API THỐNG NHẤT:
 * 1. POST /api/auth/register
 *    - Body: { username, password }
 *    - Logic: Kiểm tra username đã tồn tại chưa -> Băm mật khẩu (bcrypt.hash) -> Tạo User mới -> Trả về 201.
 * 
 * 2. POST /api/auth/login
 *    - Body: { username, password }
 *    - Logic: Tìm User -> So khớp mật khẩu (bcrypt.compare) -> Tạo JWT token (jwt.sign) -> Trả về { token, id, username, avatar }.
 * 
 * 3. POST /api/auth/logout
 *    - Logic: Phía client chủ động xóa token khỏi localStorage/cookie.
 */

const express = require("express");
const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    // TODO: [A] Kiểm tra dữ liệu đầu vào (username, password không được để trống)
    // TODO: [A] Kiểm tra xem username đã tồn tại trong DB chưa
    // TODO: [A] Băm mật khẩu với bcrypt.hash(password, 10)
    // TODO: [A] Lưu user mới vào CSDL
    return res.status(501).json({ message: "TODO: [A] Triển khai logic Đăng ký" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // TODO: [A] Tìm user theo username
    // TODO: [A] So sánh mật khẩu bằng bcrypt.compare(password, user.password)
    // TODO: [A] Tạo JWT token chứa { id: user._id, username: user.username }
    // TODO: [A] Trả về token và thông tin cơ bản của user
    return res.status(501).json({ message: "TODO: [A] Triển khai logic Đăng nhập" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  // TODO: [A] Xử lý đăng xuất (nếu có blacklist token), thông thường client chỉ cần xóa token
  return res.json({ message: "Đăng xuất thành công" });
});

module.exports = router;
